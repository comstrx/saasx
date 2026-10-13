//! The skill tool: the machine, the environment and programs it runs, driven by the engine.

mod arch;
mod base;
mod faults;
mod doctor;
mod env;
mod exec;

use engine::error::Exit;

use crate::arch::Skill;

fn main () -> Exit {

    Exit::loud(Skill::run())

}
