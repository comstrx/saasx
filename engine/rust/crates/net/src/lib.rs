//! The transport every protocol crate stands on: an [`Address`] that is TCP, Unix or a name, a
//! [`Tcp`] tuned for servers, a [`Listener`] whose [`Hook`]s admit or refuse a peer at accept
//! time, a [`Stream`] over either transport, [`Dial`] with a deadline, [`Resolve`] for names, a
//! thread-per-core [`Runtime`] and a [`Stop`] signal that every task can wait on.

#![forbid(unsafe_code)]

extern crate alloc;

pub mod prelude;

mod address;
mod arch;
mod dial;
mod hook;
mod listener;
mod resolve;
mod runtime;
mod socket;
mod stop;
mod stream;

pub use crate::arch::{Address, Bind, Bound, Dial, Hook, Listener, Peer, Protocol, Resolve, Runtime, Stop, Stream, Tcp, Workers};
