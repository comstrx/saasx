//! The first service: the whole lifecycle of a service on the engine, booted, audited, served thread per core and stopped by a signal, answering hello.

mod arch;
mod base;

use engine::error::Exit;

use crate::arch::Hello;

fn main () -> Exit {

    Exit::loud(Hello::run())

}
