//! The skill binary: the smallest consumer of the engine, grown from here.

use base::Typing;

#[expect(clippy::disallowed_macros, clippy::print_stdout, reason = "a binary reports to its operator on stdout")]
fn main() {
    println!("{}", Typing::hello_world());
}
