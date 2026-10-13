//! HTTP on hyper, one thread per core: a [`Router`] of async handlers behind [`Middleware`], a
//! [`Request`] and a [`Response`] that are plain values with a small vocabulary, a [`Server`] that
//! binds once per worker and drains on [`Stop`](net::Stop), a [`Client`] over the same transport,
//! and a [`Socket`] for `WebSocket`s over an upgrade. A handler returns `Result<Response>`; a
//! failure becomes the response its code says, with the wire body and nothing leaked.

#![forbid(unsafe_code)]
#![expect(clippy::future_not_send, reason = "every future here runs on the one thread that made it: one worker per core, by design")]

extern crate alloc;

pub mod prelude;

mod arch;
mod body;
mod client;
mod digest;
mod exec;
mod layer;
mod request;
mod response;
mod router;
mod server;
mod socket;
mod source;
mod token;

pub use crate::arch::{Body, Client, Digest, Handler, Ident, Limit, Message, Middleware, Next, Param, Params, Pending, Posted, Request, Response, Router, Server, Settings, Socket, Table, Timeout, Token, Trace, Upgrade};
pub use hyper::header::{self, HeaderMap, HeaderName, HeaderValue};
pub use hyper::{Method, StatusCode, Uri, Version};
