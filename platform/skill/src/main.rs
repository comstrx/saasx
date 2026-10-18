//! The skill tool: the whole lifecycle of a command-line tool on the engine, booted and logged, answering hello.

mod arch;
mod base;

use engine::error::Exit;

use crate::arch::Skill;

fn main () -> Exit {

    Exit::loud(Skill::run())

}
