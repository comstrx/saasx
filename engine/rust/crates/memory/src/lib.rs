//! Bytes without surprises: a [`Stack`] that never touches the heap, a [`Buffer`] allocated once
//! and never grown, a [`Pool`] that lends buffers, an [`Arena`] that bumps out shared [`Bytes`],
//! a [`Cursor`] that reads without copying, and [`Simd`] lanes eight bytes at a time. Every store
//! fails with `Exhausted` instead of growing; with the `alloc` feature, [`Alloc`] is the allocator
//! a binary installs as its global one.

#![forbid(unsafe_code)]

pub mod prelude;

mod arch;
mod arena;
mod buffer;
mod cursor;
mod pool;
mod simd;
mod space;
mod split;
mod stack;

pub use crate::arch::{Arena, Buffer, Cursor, Lease, Pool, Simd, Space, Split, Stack};
pub use bytes::{Buf, BufMut, Bytes, BytesMut};

#[cfg(feature = "alloc")]
pub use mimalloc::MiMalloc as Alloc;
