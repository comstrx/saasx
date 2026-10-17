use hyper::client::conn::{http1, http2};
use hyper::header::{HOST, HeaderValue};
use net::{Address, Dial, Protocol};
use error::{Failure, Result};
use std::sync::{Mutex, PoisonError};
use std::collections::HashMap;
use hyper_util::rt::TokioIo;
use core::time::Duration;
use thread::{Task, Time};
use alloc::sync::Arc;
use hyper::Uri;

use crate::{Body, Client, Faults, Keep, Request, Response};
use crate::arch::{Conn, LocalExec};

impl Client {

    /// HTTP/1.1 with thirty seconds for the whole exchange.
    #[inline]
    #[must_use]
    pub const fn new () -> Self {

        Self { protocol: Protocol::Http1, timeout: Duration::from_secs(30) }

    }

    /// Which protocol to speak; HTTP/2 and gRPC are cleartext with prior knowledge.
    #[inline]
    #[must_use]
    pub const fn protocol ( mut self, protocol: Protocol ) -> Self {

        self.protocol = protocol;

        self

    }

    /// How long connecting, sending and receiving the head may take together.
    #[inline]
    #[must_use]
    pub const fn timeout ( mut self, timeout: Duration ) -> Self {

        self.timeout = timeout;

        self

    }

    /// The same client, keeping every connection it opens for the next request to that authority.
    #[inline]
    #[must_use]
    pub fn keep ( self ) -> Keep {

        Keep { client: self, idle: Arc::new(Mutex::new(HashMap::new())) }

    }

    /// Sends the request over a fresh connection.
    ///
    /// # Errors
    /// `Timeout`, `Unavailable`, or what the transport reports.
    #[inline]
    pub async fn send ( &self, request: Request ) -> Result<Response> {

        Time::within(self.timeout, Box::pin(self.exchange(request))).await.unwrap_or_else(|| Err(Faults::CLIENT_TIMEOUT.fail()))

    }

    /// `GET`s the URI.
    ///
    /// # Errors
    /// The URI is not absolute, or the exchange failed.
    #[inline]
    pub async fn get ( &self, uri: &str ) -> Result<Response> {

        self.send(Request::get(uri)?).await

    }

    /// `POST`s a body with its content type to the URI.
    ///
    /// # Errors
    /// The URI is not absolute, or the exchange failed.
    #[inline]
    pub async fn post ( &self, uri: &str, body: impl Into<Body>, content_type: &str ) -> Result<Response> {

        self.send(Request::post(uri, body, content_type)?).await

    }

    async fn exchange ( &self, request: Request ) -> Result<Response> {

        let mut conn = self.open(request.peer().address()).await?;

        conn.send(request.into_inner()).await

    }

    pub(crate) async fn open ( &self, address: &Address ) -> Result<Conn> {

        let stream = Dial::connect(address, self.timeout).await?;
        let link   = TokioIo::new(stream);

        match self.protocol {
            Protocol::Http2 | Protocol::Grpc => Self::http2(link).await,
            Protocol::Http1 | _              => Self::http1(link).await,
        }

    }

    async fn http1 ( link: TokioIo<net::Stream> ) -> Result<Conn> {

        let ( sender, connection ) = http1::handshake(link).await.map_err(Self::transport)?;

        drop(Task::spawn(connection));

        Ok(Conn::Http1(sender))

    }

    async fn http2 ( link: TokioIo<net::Stream> ) -> Result<Conn> {

        let ( sender, connection ) = http2::handshake(LocalExec, link).await.map_err(Self::transport)?;

        drop(Task::spawn(connection));

        Ok(Conn::Http2(sender))

    }

    fn origin_form ( mut inner: hyper::Request<Body> ) -> Result<hyper::Request<Body>> {

        let uri   = inner.uri().clone();
        let host  = uri.host().unwrap_or_default();
        let host  = uri.port_u16().map_or_else(|| host.to_owned(), |port| format!("{host}:{port}"));
        let value = HeaderValue::from_str(&host).map_err(|error| Faults::NOT_URI.because("the host is not a header value").caused_by(error))?;

        inner.headers_mut().entry(HOST).or_insert(value);
        *inner.uri_mut() = Self::origin(&uri)?;

        Ok(inner)

    }

    fn origin ( uri: &Uri ) -> Result<Uri> {

        let target = uri.path_and_query().map_or("/", |target| target.as_str());

        target.parse().map_err(|error| Faults::NOT_URI.because("the URI path is not usable").caused_by(error))

    }

    pub(crate) fn transport ( error: hyper::Error ) -> Failure {

        Faults::HTTP_TRANSPORT.fail().caused_by(error)

    }

}

impl Default for Client {

    #[inline]
    fn default () -> Self {

        Self::new()

    }

}

impl Keep {

    const SPARE: usize = 8;

    /// Sends the request over a kept connection when one is free, or over a fresh one that is then kept.
    ///
    /// # Errors
    /// `Timeout`, `Unavailable`, or what the transport reports.
    #[inline]
    pub async fn send ( &self, request: Request ) -> Result<Response> {

        Time::within(self.client.timeout, Box::pin(self.exchange(request))).await.unwrap_or_else(|| Err(Faults::CLIENT_TIMEOUT.fail()))

    }

    /// `GET`s the URI.
    ///
    /// # Errors
    /// The URI is not absolute, or the exchange failed.
    #[inline]
    pub async fn get ( &self, uri: &str ) -> Result<Response> {

        self.send(Request::get(uri)?).await

    }

    /// `POST`s a body with its content type to the URI.
    ///
    /// # Errors
    /// The URI is not absolute, or the exchange failed.
    #[inline]
    pub async fn post ( &self, uri: &str, body: impl Into<Body>, content_type: &str ) -> Result<Response> {

        self.send(Request::post(uri, body, content_type)?).await

    }

    /// How many connections are open and waiting for a request.
    #[inline]
    #[must_use]
    pub fn idle ( &self ) -> usize {

        self.idle.lock().unwrap_or_else(PoisonError::into_inner).values().map(Vec::len).sum()

    }

    async fn exchange ( &self, request: Request ) -> Result<Response> {

        let key: Box<str> = request.peer().address().to_string().into();

        let mut conn = match self.taken(&key) {
            Some(conn) => conn,
            None       => self.client.open(request.peer().address()).await?,
        };

        let response = conn.send(request.into_inner()).await;

        self.kept(key, conn);

        response

    }

    fn taken ( &self, key: &str ) -> Option<Conn> {

        let mut idle = self.idle.lock().unwrap_or_else(PoisonError::into_inner);
        let found    = idle.get_mut(key).and_then(Self::free);

        drop(idle);

        found

    }

    fn free ( conns: &mut Vec<Conn> ) -> Option<Conn> {

        conns.retain(|conn| !conn.is_closed());

        let index = conns.iter().position(Conn::is_ready)?;

        conns.get(index).and_then(Conn::shared).or_else(|| Some(conns.swap_remove(index)))

    }

    fn kept ( &self, key: Box<str>, conn: Conn ) {

        if conn.is_closed() { return; }

        let mut idle = self.idle.lock().unwrap_or_else(PoisonError::into_inner);

        Self::park(idle.entry(key).or_default(), conn);
        drop(idle);

    }

    fn park ( conns: &mut Vec<Conn>, conn: Conn ) {

        let present = matches!(conn, Conn::Http2(_)) && conns.iter().any(|kept| matches!(kept, Conn::Http2(_)));

        if !present && conns.len() < Self::SPARE { conns.push(conn); }

    }

}

impl Conn {

    pub(crate) async fn send ( &mut self, inner: hyper::Request<Body> ) -> Result<Response> {

        match self {
            Self::Http1(sender) => sender.send_request(Client::origin_form(inner)?).await.map(Response::arrived).map_err(Client::transport),
            Self::Http2(sender) => sender.send_request(inner).await.map(Response::arrived).map_err(Client::transport),
        }

    }

    pub(crate) fn is_ready ( &self ) -> bool {

        match self {
            Self::Http1(sender) => sender.is_ready(),
            Self::Http2(sender) => sender.is_ready(),
        }

    }

    pub(crate) fn is_closed ( &self ) -> bool {

        match self {
            Self::Http1(sender) => sender.is_closed(),
            Self::Http2(sender) => sender.is_closed(),
        }

    }

    pub(crate) fn shared ( &self ) -> Option<Self> {

        match self {
            Self::Http2(sender) => Some(Self::Http2(sender.clone())),
            Self::Http1(_)      => None,
        }

    }

}
