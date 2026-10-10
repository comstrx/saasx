//! The substrate every other crate in the foundation builds on.
//!
//! Types here are contracts shared across the workspace: they change
//! additively or not at all.

#![no_std]

pub mod prelude;

mod typing;

pub use crate::typing::Typing;
