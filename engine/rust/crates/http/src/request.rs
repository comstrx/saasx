use hyper::header::{CONTENT_TYPE, HOST, HeaderName, HeaderValue};
use core::fmt::{Display, Formatter, Result as FmtResult};
use hyper::{Method, Uri, Version};
use error::{Failure, Result};
use core::time::Duration;
use net::{Address, Peer};
use std::time::Instant;
use alloc::borrow::Cow;
use core::mem::take;
use memory::Bytes;
use parse::Query;

use crate::{Body, Ident, Params, Posted, Request};

impl Request {

    /// A request to send with a [`Client`](crate::Client): an absolute URI such as `http://host:port/path`.
    ///
    /// # Errors
    /// The URI does not parse or has no host.
    #[inline]
    pub fn build ( method: Method, uri: &str ) -> Result<Self> {

        let uri: Uri = uri.parse().map_err(|error| Failure::invalid("not a URI").keyed("not_uri").caused_by(error))?;
        let host = uri.host().ok_or_else(|| Failure::invalid("the URI has no host").keyed("not_uri"))?;
        let peer = Peer::new(Address::Name(host.into(), uri.port_u16().unwrap_or(80)));

        let mut inner = hyper::Request::new(Body::Empty);

        *inner.method_mut() = method;
        *inner.uri_mut() = uri;

        Ok(Self { inner, peer, params: Params::default(), ident: Ident { worker: 0, serial: 0 }, started: Instant::now(), limit: usize::MAX })

    }

    /// A `GET` to send.
    ///
    /// # Errors
    /// The URI does not parse or has no host.
    #[inline]
    pub fn get ( uri: &str ) -> Result<Self> {

        Self::build(Method::GET, uri)

    }

    /// A `POST` to send, with a body and its content type.
    ///
    /// # Errors
    /// The URI does not parse or has no host, or the content type is not a header value.
    #[inline]
    pub fn post ( uri: &str, body: impl Into<Body>, content_type: &str ) -> Result<Self> {

        let mut request = Self::build(Method::POST, uri)?;

        *request.inner.body_mut() = body.into();

        request.header(CONTENT_TYPE, content_type)

    }

    /// Sets a header, replacing any with the same name.
    ///
    /// # Errors
    /// The value is not a header value.
    #[inline]
    pub fn header ( mut self, name: HeaderName, value: &str ) -> Result<Self> {

        let value = HeaderValue::from_str(value).map_err(|error| Failure::invalid("not a header value").keyed("not_header").caused_by(error))?;

        self.inner.headers_mut().insert(name, value);

        Ok(self)

    }

    /// The method.
    #[inline]
    #[must_use]
    pub fn method ( &self ) -> &Method {

        self.inner.method()

    }

    /// The URI as received.
    #[inline]
    #[must_use]
    pub fn uri ( &self ) -> &Uri {

        self.inner.uri()

    }

    /// The path, always starting with `/`.
    #[inline]
    #[must_use]
    pub fn path ( &self ) -> &str {

        self.inner.uri().path()

    }

    /// The query string without its `?`, empty when there is none.
    #[inline]
    #[must_use]
    pub fn query ( &self ) -> &str {

        self.inner.uri().query().unwrap_or_default()

    }

    /// The first query value under `key`, decoded.
    ///
    /// # Errors
    /// The query is not valid percent-encoding.
    #[inline]
    pub fn arg ( &self, key: &str ) -> Result<Option<String>> {

        Query::get(self.query(), key).map(|value| value.map(Cow::into_owned))

    }

    /// The HTTP version.
    #[inline]
    #[must_use]
    pub fn version ( &self ) -> Version {

        self.inner.version()

    }

    /// A header as text; `None` when absent or not text.
    #[inline]
    #[must_use]
    pub fn head ( &self, name: HeaderName ) -> Option<&str> {

        self.inner.headers().get(name).and_then(|value| value.to_str().ok())

    }

    /// Every header.
    #[inline]
    #[must_use]
    pub fn headers ( &self ) -> &hyper::HeaderMap {

        self.inner.headers()

    }

    /// Every header, to change.
    #[inline]
    #[must_use]
    pub fn headers_mut ( &mut self ) -> &mut hyper::HeaderMap {

        self.inner.headers_mut()

    }

    /// The `Host` header, or the authority of the URI.
    #[inline]
    #[must_use]
    pub fn host ( &self ) -> Option<&str> {

        self.head(HOST).or_else(|| self.inner.uri().host())

    }

    /// The route parameter `name`, as the pattern captured it.
    #[inline]
    #[must_use]
    pub fn param ( &self, name: &str ) -> Option<&str> {

        self.params.get(name)

    }

    /// Every route parameter.
    #[inline]
    #[must_use]
    pub const fn params ( &self ) -> &Params {

        &self.params

    }

    /// Who sent it.
    #[inline]
    #[must_use]
    pub const fn peer ( &self ) -> &Peer {

        &self.peer

    }

    /// Its identity.
    #[inline]
    #[must_use]
    pub const fn ident ( &self ) -> Ident {

        self.ident

    }

    /// How long since the request was taken.
    #[inline]
    #[must_use]
    pub fn elapsed ( &self ) -> Duration {

        self.started.elapsed()

    }

    /// The body, to read or replace.
    #[inline]
    #[must_use]
    pub fn body_mut ( &mut self ) -> &mut Body {

        self.inner.body_mut()

    }

    /// Caps what [`Request::bytes`] will gather.
    #[inline]
    pub const fn limit ( &mut self, bytes: usize ) -> &mut Self {

        self.limit = bytes;

        self

    }

    /// The whole body, within the limit; the body is spent afterwards.
    ///
    /// # Errors
    /// The peer went away, or the body passed the limit.
    #[inline]
    pub async fn bytes ( &mut self ) -> Result<Bytes> {

        let body = take(self.inner.body_mut());

        body.gather(self.limit).await

    }

    /// The whole body as text.
    ///
    /// # Errors
    /// The body could not be gathered, or is not UTF-8.
    #[inline]
    pub async fn text ( &mut self ) -> Result<String> {

        let bytes = self.bytes().await?;

        String::from_utf8(bytes.to_vec()).map_err(Failure::from)

    }

    /// Every pair of a form body (`application/x-www-form-urlencoded`), decoded once; the body is spent afterwards.
    ///
    /// # Errors
    /// The body could not be gathered or decoded.
    #[inline]
    pub async fn posted ( &mut self ) -> Result<Posted> {

        let text  = self.text().await?;
        let pairs = Query::new(&text).map(|pair| pair.map(|( key, value )| ( key.into_owned(), value.into_owned() ))).collect::<Result<Vec<_>>>()?;

        Ok(Posted { pairs })

    }

    /// The hyper request underneath, for what the vocabulary does not cover.
    #[inline]
    #[must_use]
    pub const fn inner ( &self ) -> &hyper::Request<Body> {

        &self.inner

    }

    /// The hyper request underneath, to change.
    #[inline]
    #[must_use]
    pub const fn inner_mut ( &mut self ) -> &mut hyper::Request<Body> {

        &mut self.inner

    }

    /// Takes the hyper request underneath.
    #[inline]
    #[must_use]
    pub fn into_inner ( self ) -> hyper::Request<Body> {

        self.inner

    }

}

impl Posted {

    /// The first value under `key`.
    #[inline]
    #[must_use]
    pub fn get ( &self, key: &str ) -> Option<&str> {

        self.pairs.iter().find(|( found, _ )| found == key).map(|( _, value )| value.as_str())

    }

    /// Every value under `key`, in order.
    #[inline]
    pub fn all <'a> ( &'a self, key: &'a str ) -> impl Iterator<Item = &'a str> {

        self.pairs.iter().filter(move |( found, _ )| found == key).map(|( _, value )| value.as_str())

    }

    /// Every pair, in order.
    #[inline]
    #[must_use]
    pub fn pairs ( &self ) -> &[( String, String )] {

        &self.pairs

    }

    /// How many pairs came.
    #[inline]
    #[must_use]
    pub const fn len ( &self ) -> usize {

        self.pairs.len()

    }

    /// Whether nothing came.
    #[inline]
    #[must_use]
    pub const fn is_empty ( &self ) -> bool {

        self.pairs.is_empty()

    }

}

impl Params {

    /// The value captured under `name`.
    #[inline]
    #[must_use]
    pub fn get ( &self, name: &str ) -> Option<&str> {

        self.pairs.iter().find(|( key, _ )| &**key == name).map(|( _, value )| &**value)

    }

    /// How many were captured.
    #[inline]
    #[must_use]
    pub const fn len ( &self ) -> usize {

        self.pairs.len()

    }

    /// Whether none were captured.
    #[inline]
    #[must_use]
    pub const fn is_empty ( &self ) -> bool {

        self.pairs.is_empty()

    }

    pub(crate) fn capture ( params: &matchit::Params<'_, '_> ) -> Self {

        Self { pairs: params.iter().map(|( key, value )| ( key.into(), value.into() )).collect() }

    }

}

impl Ident {

    /// The worker that took the request.
    #[inline]
    #[must_use]
    pub const fn worker ( self ) -> u16 {

        self.worker

    }

    /// The serial on that worker.
    #[inline]
    #[must_use]
    pub const fn serial ( self ) -> u64 {

        self.serial

    }

}

impl Display for Ident {

    #[inline]
    #[expect(clippy::renamed_function_params, reason = "the workspace minimum identifier length forbids `f`")]
    fn fmt ( &self, formatter: &mut Formatter<'_> ) -> FmtResult {

        write!(formatter, "{:x}-{:x}", self.worker, self.serial)

    }

}
