//! The identity service: sessions over HTTP, audited, served thread per core by the engine, stopped by a signal.

extern crate alloc;

mod arch;
mod base;
mod faults;
mod routes;
mod store;

use engine::error::Exit;

use crate::arch::Iam;

fn main () -> Exit {

    Exit::loud(Iam::run())

}
