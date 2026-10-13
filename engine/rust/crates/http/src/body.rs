use http_body::{Body as HttpBody, Frame, SizeHint};
use error::{Code, Failure, Result};
use core::task::{Context, Poll};
use http_body_util::BodyExt;
use hyper::body::Incoming;
use core::mem::take;
use core::pin::Pin;
use memory::Bytes;

use crate::arch::Polled;
use crate::Body;

impl Body {

    /// No bytes.
    #[inline]
    #[must_use]
    pub const fn empty () -> Self {

        Self::Empty

    }

    /// Every byte in hand.
    #[inline]
    #[must_use]
    pub fn full ( bytes: impl Into<Bytes> ) -> Self {

        Self::Full(bytes.into())

    }

    /// The same body refused past `limit` bytes; bytes already in hand are not re-checked.
    #[inline]
    #[must_use]
    pub fn limited ( self, limit: usize ) -> Self {

        match self {
            Self::Incoming(incoming) | Self::Limited(incoming, _) => Self::Limited(incoming, limit),
            Self::Empty                                           => Self::Empty,
            Self::Full(bytes)                                     => Self::Full(bytes),
        }

    }

    /// How many bytes are known to be coming, when that is known.
    #[inline]
    #[must_use]
    pub fn len ( &self ) -> Option<u64> {

        match self {
            Self::Empty                   => Some(0),
            Self::Full(bytes)             => Some(u64::try_from(bytes.len()).unwrap_or(u64::MAX)),
            Self::Incoming(incoming) | Self::Limited(incoming, _) => incoming.size_hint().exact(),
        }

    }

    /// Whether no byte will come.
    #[inline]
    #[must_use]
    pub fn is_empty ( &self ) -> bool {

        self.len() == Some(0)

    }

    /// Every byte, gathered; `TooLarge` past `limit`.
    ///
    /// # Errors
    /// The peer went away, or the body passed the limit.
    #[inline]
    pub async fn gather ( self, limit: usize ) -> Result<Bytes> {

        match self {
            Self::Empty                  => Ok(Bytes::new()),
            Self::Full(bytes)            => Failure::ensure(bytes.len() <= limit, Code::TooLarge, "the body passes the limit").map(|()| bytes),
            Self::Incoming(incoming)     => Self::drain(incoming, limit).await,
            Self::Limited(incoming, cap) => Self::drain(incoming, cap.min(limit)).await,
        }

    }

    async fn drain ( incoming: Incoming, limit: usize ) -> Result<Bytes> {

        if incoming.size_hint().lower() > u64::try_from(limit).unwrap_or(u64::MAX) { return Err(Self::too_large()); }

        let collected = BodyExt::collect(Self::Limited(incoming, limit)).await?;

        Ok(collected.to_bytes())

    }

    fn too_large () -> Failure {

        Failure::too_large("the body passes the limit").keyed("body_too_large")

    }

    fn carried ( error: hyper::Error ) -> Failure {

        Failure::unavailable("the body did not arrive whole").keyed("body_interrupted").caused_by(error)

    }

}

impl Default for Body {

    #[inline]
    fn default () -> Self {

        Self::Empty

    }

}

impl From<Bytes> for Body {

    #[inline]
    fn from ( value: Bytes ) -> Self {

        Self::Full(value)

    }

}

impl From<&'static str> for Body {

    #[inline]
    fn from ( value: &'static str ) -> Self {

        Self::Full(Bytes::from_static(value.as_bytes()))

    }

}

impl From<String> for Body {

    #[inline]
    fn from ( value: String ) -> Self {

        Self::Full(Bytes::from(value))

    }

}

impl From<Vec<u8>> for Body {

    #[inline]
    fn from ( value: Vec<u8> ) -> Self {

        Self::Full(Bytes::from(value))

    }

}

impl From<Incoming> for Body {

    #[inline]
    fn from ( value: Incoming ) -> Self {

        Self::Incoming(value)

    }

}

impl HttpBody for Body {

    type Data = Bytes;
    type Error = Failure;

    #[inline]
    fn poll_frame ( self: Pin<&mut Self>, cx: &mut Context<'_> ) -> Poll<Option<Result<Frame<Bytes>>>> {

        match self.get_mut() {
            Self::Empty => Poll::Ready(None),
            Self::Full(bytes) => {
                let data = take(bytes);
                Poll::Ready((!data.is_empty()).then(|| Ok(Frame::data(data))))
            }
            Self::Incoming(incoming) => Pin::new(incoming).poll_frame(cx).map(|frame| frame.map(|frame| frame.map_err(Self::carried))),
            Self::Limited(incoming, left) => Self::poll_limited(incoming, left, cx),
        }

    }

    #[inline]
    fn is_end_stream ( &self ) -> bool {

        match self {
            Self::Empty => true,
            Self::Full(bytes) => bytes.is_empty(),
            Self::Incoming(incoming) | Self::Limited(incoming, _) => incoming.is_end_stream(),
        }

    }

    #[inline]
    fn size_hint ( &self ) -> SizeHint {

        match self {
            Self::Empty => SizeHint::with_exact(0),
            Self::Full(bytes) => SizeHint::with_exact(u64::try_from(bytes.len()).unwrap_or(u64::MAX)),
            Self::Incoming(incoming) | Self::Limited(incoming, _) => incoming.size_hint(),
        }

    }

}

impl Body {

    fn poll_limited ( incoming: &mut Incoming, left: &mut usize, context: &mut Context<'_> ) -> Polled {

        let Poll::Ready(next) = Pin::new(incoming).poll_frame(context) else { return Poll::Pending; };

        let Some(outcome) = next else { return Poll::Ready(None); };
        let frame = match outcome { Ok(frame) => frame, Err(error) => return Poll::Ready(Some(Err(Self::carried(error)))) };
        let size  = frame.data_ref().map_or(0, Bytes::len);

        if size > *left { return Poll::Ready(Some(Err(Self::too_large()))); }

        *left -= size;

        Poll::Ready(Some(Ok(frame)))

    }

}
