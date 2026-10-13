use hyper::header::{CONNECTION, CONTENT_LENGTH, SEC_WEBSOCKET_ACCEPT, SEC_WEBSOCKET_KEY, SEC_WEBSOCKET_VERSION, UPGRADE};
use tokio::io::{AsyncReadExt as _, AsyncWriteExt as _};
use memory::{Buf, Bytes, BytesMut, Space as _, Stack};
use std::io::Error as IoError;
use error::{Failure, Result};
use hyper_util::rt::TokioIo;
use hyper::upgrade::on;
use parse::List;

use crate::{Digest, Message, Request, Response, Socket, Upgrade};
use crate::arch::{Extent, Frame, Step};

const GUID: &[u8] = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

impl Socket {

    /// Answers a `WebSocket` handshake: the `101` to return, and the upgrade to wait for after it went out.
    ///
    /// # Errors
    /// `Invalid` keyed `not_websocket` when the request is not a version-13 `WebSocket` handshake.
    #[inline]
    pub fn accept ( request: &mut Request ) -> Result<( Response, Upgrade )> {

        let upgrade    = request.head(UPGRADE).is_some_and(|value| value.eq_ignore_ascii_case("websocket"));
        let connection = request.head(CONNECTION).is_some_and(|value| List::has(value, "upgrade"));
        let version    = request.head(SEC_WEBSOCKET_VERSION).is_some_and(|value| value.trim() == "13");
        let key        = request.head(SEC_WEBSOCKET_KEY).map(str::trim).filter(|key| !key.is_empty()).map(str::to_owned);

        let Some(key) = key.filter(|_| upgrade && connection && version) else { return Err(Failure::invalid("not a WebSocket handshake").keyed("not_websocket")); };

        let accept  = Digest::base64(&Digest::sha1(&[key.as_bytes(), GUID].concat()));
        let pending = on(request.inner_mut());

        let mut response = Response::status(101).header(UPGRADE, "websocket").header(CONNECTION, "upgrade").header(SEC_WEBSOCKET_ACCEPT, &accept);

        response.headers_mut().remove(CONTENT_LENGTH);

        Ok(( response, Upgrade { pending, limit: 1 << 20 } ))

    }

    /// The next message; `Close` once when the peer closes, then `None`.
    ///
    /// # Errors
    /// The peer broke the protocol, sent more than the limit, or went away.
    #[inline]
    pub async fn recv ( &mut self ) -> Result<Option<Message>> {

        if self.closed { return Ok(None); }

        let mut pending: Option<( u8, BytesMut )> = None;
        let mut outcome = None;

        while outcome.is_none() {

            let frame = self.frame().await?;

            outcome = self.consume(frame, &mut pending).await?;

        }

        Ok(outcome.flatten())

    }

    /// Sends one message.
    ///
    /// # Errors
    /// The socket is closed, or the write failed.
    #[inline]
    pub async fn send ( &mut self, message: Message ) -> Result<()> {

        if self.closed { return Err(Failure::unavailable("the socket is closed").keyed("socket_closed")); }

        let ( opcode, data ) = match message {
            Message::Text(text)    => ( 0x1, Bytes::from(text) ),
            Message::Binary(bytes) => ( 0x2, bytes ),
            Message::Ping(bytes)   => ( 0x9, bytes ),
            Message::Pong(bytes)   => ( 0xA, bytes ),
            Message::Close(code)   => ( 0x8, code.map_or_else(Bytes::new, |code| Bytes::copy_from_slice(&code.to_be_bytes())) ),
        };

        self.write(opcode, &data).await

    }

    /// Sends a close frame with this code; the next `recv` returns `None`.
    ///
    /// # Errors
    /// The write failed.
    #[inline]
    pub async fn close ( &mut self, code: u16 ) -> Result<()> {

        if self.closed { return Ok(()); }

        self.write(0x8, &code.to_be_bytes()).await?;
        self.closed = true;

        Ok(())

    }

    /// Whether the close handshake happened.
    #[inline]
    #[must_use]
    pub const fn is_closed ( &self ) -> bool {

        self.closed

    }

    async fn write ( &mut self, opcode: u8, data: &[u8] ) -> Result<()> {

        let mut head = Stack::<10>::new();

        head.push_byte(0x80 | opcode)?;
        Self::length(&mut head, data.len())?;

        let mut chained = Buf::chain(head.as_bytes(), data);

        self.link.write_all_buf(&mut chained).await.map_err(Self::carried)?;
        self.link.flush().await.map_err(Self::carried)

    }

    fn length ( head: &mut Stack<10>, len: usize ) -> Result<()> {

        let len64 = u64::try_from(len).unwrap_or(u64::MAX);

        match len {
            0..=125         => head.push_byte(u8::try_from(len).unwrap_or(125)).map(|_| ()),
            126..=65_535    => head.push_byte(126)?.push(&u16::try_from(len).unwrap_or(u16::MAX).to_be_bytes()).map(|_| ()),
            _               => head.push_byte(127)?.push(&len64.to_be_bytes()).map(|_| ()),
        }

    }

    async fn frame ( &mut self ) -> Result<Frame> {

        let mut parsed = self.parse()?;

        while parsed.is_none() {

            self.fill().await?;
            parsed = self.parse()?;

        }

        parsed.ok_or_else(|| Failure::internal("the frame vanished"))

    }

    async fn fill ( &mut self ) -> Result<()> {

        self.buffer.reserve(4096);

        let came = self.link.read_buf(&mut self.buffer).await.map_err(Self::carried)?;

        Failure::ensure(came > 0, error::Code::Unavailable, "the peer went away").map_err(|failure| failure.keyed("socket_gone"))

    }

    fn parse ( &mut self ) -> Result<Option<Frame>> {

        let Some(&[first, second]) = self.buffer.first_chunk::<2>() else { return Ok(None); };

        Failure::ensure(first & 0x70 == 0, error::Code::Invalid, "a reserved bit is set").map_err(Self::protocol)?;
        Failure::ensure(second & 0x80 != 0, error::Code::Invalid, "a client frame is not masked").map_err(Self::protocol)?;

        let ( extra, payload ) = Self::extent(&self.buffer, second & 0x7F)?;
        let Some(payload) = payload else { return Ok(None); };
        let header = 2 + extra + 4;

        Failure::ensure(payload <= self.limit, error::Code::TooLarge, "a frame passes the limit").map_err(|failure| failure.keyed("socket_too_large"))?;

        if self.buffer.len() < header + payload { return Ok(None); }

        let head = self.buffer.split_to(header);
        let key  = head.get(header - 4..).and_then(|key| key.first_chunk::<4>()).copied().unwrap_or_default();
        let mut data = self.buffer.split_to(payload);

        for ( index, byte ) in data.iter_mut().enumerate() { *byte ^= key.get(index % 4).copied().unwrap_or_default(); }

        Ok(Some(Frame { fin: first & 0x80 != 0, opcode: first & 0x0F, data: data.freeze() }))

    }

    fn extent ( buffer: &[u8], short: u8 ) -> Result<Extent> {

        match short {
            126 => Ok(( 2, buffer.get(2..4).and_then(|bytes| bytes.first_chunk::<2>()).map(|bytes| usize::from(u16::from_be_bytes(*bytes))) )),
            127 => buffer.get(2..10).and_then(|bytes| bytes.first_chunk::<8>()).map_or(Ok(( 8, None )), |bytes| usize::try_from(u64::from_be_bytes(*bytes)).map(|len| ( 8, Some(len) )).map_err(|error| Failure::too_large("a frame passes what this machine holds").keyed("socket_too_large").caused_by(error))),
            len => Ok(( 0, Some(usize::from(len)) )),
        }

    }

    async fn consume ( &mut self, frame: Frame, pending: &mut Option<( u8, BytesMut )> ) -> Result<Step> {

        match frame.opcode {
            0x0        => self.continued(&frame, pending),
            0x1 | 0x2  => Self::started(frame, pending),
            0x8        => self.closing(&frame.data).await,
            0x9        => self.write(0xA, &frame.data).await.map(|()| Some(Some(Message::Ping(frame.data)))),
            0xA        => Ok(Some(Some(Message::Pong(frame.data)))),
            _          => Err(Self::protocol(Failure::invalid("an unknown opcode"))),
        }

    }

    fn started ( frame: Frame, pending: &mut Option<( u8, BytesMut )> ) -> Result<Step> {

        Failure::ensure(pending.is_none(), error::Code::Invalid, "a new message began inside another").map_err(Self::protocol)?;

        if frame.fin { return Self::deliver(frame.opcode, frame.data); }

        *pending = Some(( frame.opcode, BytesMut::from(frame.data) ));

        Ok(None)

    }

    fn continued ( &self, frame: &Frame, pending: &mut Option<( u8, BytesMut )> ) -> Result<Step> {

        let Some(( opcode, mut data )) = pending.take() else { return Err(Self::protocol(Failure::invalid("a continuation without a start"))); };

        Failure::ensure(data.len() + frame.data.len() <= self.limit, error::Code::TooLarge, "a message passes the limit").map_err(|failure| failure.keyed("socket_too_large"))?;
        data.extend_from_slice(&frame.data);

        if frame.fin { return Self::deliver(opcode, data.freeze()); }

        *pending = Some(( opcode, data ));

        Ok(None)

    }

    async fn closing ( &mut self, data: &Bytes ) -> Result<Step> {

        let code = data.first_chunk::<2>().map(|bytes| u16::from_be_bytes(*bytes));

        if !self.closed {

            self.write(0x8, data.get(..2).unwrap_or_default()).await?;
            self.closed = true;

            return Ok(Some(Some(Message::Close(code))));

        }

        Ok(Some(None))

    }

    fn deliver ( opcode: u8, data: Bytes ) -> Result<Step> {

        if opcode == 0x2 { return Ok(Some(Some(Message::Binary(data)))); }

        String::from_utf8(data.to_vec()).map(|text| Some(Some(Message::Text(text)))).map_err(|error| Self::protocol(Failure::from(error.utf8_error())))

    }

    const fn protocol ( failure: Failure ) -> Failure {

        failure.keyed("websocket_protocol")

    }

    fn carried ( error: IoError ) -> Failure {

        Failure::from(error).keyed("socket_gone").context("on the websocket")

    }

}

impl Upgrade {

    /// How many bytes one message may hold.
    #[inline]
    #[must_use]
    pub const fn limit ( mut self, bytes: usize ) -> Self {

        self.limit = bytes;

        self

    }

    /// The socket, once the `101` has gone out and hyper handed the connection over.
    ///
    /// # Errors
    /// The connection ended before the upgrade.
    #[inline]
    pub async fn ready ( self ) -> Result<Socket> {

        let upgraded = self.pending.await.map_err(|error| Failure::unavailable("the connection did not upgrade").keyed("socket_gone").caused_by(error))?;

        Ok(Socket { link: TokioIo::new(upgraded), buffer: BytesMut::with_capacity(4096), limit: self.limit, closed: false })

    }

}

impl Message {

    /// A text message.
    #[inline]
    #[must_use]
    pub fn text ( text: impl Into<String> ) -> Self {

        Self::Text(text.into())

    }

    /// A binary message.
    #[inline]
    #[must_use]
    pub fn binary ( bytes: impl Into<Bytes> ) -> Self {

        Self::Binary(bytes.into())

    }

}

