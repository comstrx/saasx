//! The desktop host: one window for the app its spec describes, driven by the engine, answering typed calls from the page.

mod arch;
mod base;
mod faults;
mod host;

use engine::error::Exit;

use crate::arch::Desk;

fn main () -> Exit {

    Exit::loud(Desk::run())

}
