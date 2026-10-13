use std::net::TcpListener as StdTcpListener;
use tokio::sync::watch::{Receiver, Sender};
use tokio::net::{TcpListener, TcpStream};
use std::thread::JoinHandle;
use core::net::SocketAddr;
use alloc::sync::Arc;
use error::Result;

#[cfg(unix)]
use tokio::net::{UnixListener, UnixStream};

#[cfg(unix)]
use std::os::unix::net::UnixListener as StdUnixListener;

/// Where something listens or is reached: a TCP socket, a Unix socket path, or a name with a port.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Address {
    /// An IP and a port.
    Tcp(SocketAddr),
    /// A path on this machine.
    Unix(Box<str>),
    /// A host name to resolve, and a port.
    Name(Box<str>, u16),
}

/// How the other side of a connection is known.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Peer {
    pub(crate) address: Address,
}

/// What runs over a connection, for the crate above to pick a client or a server by.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Protocol {
    /// HTTP/1.1.
    #[default]
    Http1,
    /// HTTP/2, cleartext or over TLS.
    Http2,
    /// gRPC: HTTP/2 framing with its content type and trailers.
    Grpc,
}

/// Tcp creation and tuning.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Tcp;

/// How to bind: the accept backlog and whether several listeners may share the port.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Bind {
    pub(crate) backlog: u32,
    pub(crate) reuse:   bool,
}

/// Admits or refuses a peer the moment it is accepted, before a byte is read.
pub trait Hook: Send + Sync {

    /// Whether the peer may be served.
    fn admit ( &self, peer: &Peer ) -> bool;

}

/// A socket bound and listening but not yet registered with a runtime: made on any thread, turned
/// into a [`Listener`] on the thread that will run it.
#[derive(Debug)]
pub struct Bound {
    pub(crate) tcp:   Option<StdTcpListener>,
    #[cfg(unix)]
    pub(crate) unix:  Option<StdUnixListener>,
    pub(crate) local: Address,
}

/// A bound socket that yields streams, each one passed through the hooks first.
pub struct Listener {
    pub(crate) tcp:   Option<TcpListener>,
    #[cfg(unix)]
    pub(crate) unix:  Option<UnixListener>,
    pub(crate) local: Address,
    pub(crate) hooks: Vec<Arc<dyn Hook>>,
}

/// One connection, whichever transport carried it.
#[non_exhaustive]
#[derive(Debug)]
pub enum Stream {
    /// Over TCP.
    Tcp(TcpStream),
    /// Over a Unix socket.
    #[cfg(unix)]
    Unix(UnixStream),
}

/// Outbound connections with a deadline.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Dial;

/// Names into socket addresses through the system resolver.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Resolve;

/// One current-thread Tokio runtime per worker thread, each with its own local task set.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Runtime;

/// The threads a [`Runtime`] started, joined together.
#[derive(Debug)]
pub struct Workers {
    pub(crate) handles: Vec<JoinHandle<Result<()>>>,
}

/// A stop signal: any clone can raise it, every clone can wait for it.
#[derive(Debug, Clone)]
pub struct Stop {
    pub(crate) sender:   Arc<Sender<bool>>,
    pub(crate) receiver: Receiver<bool>,
}
