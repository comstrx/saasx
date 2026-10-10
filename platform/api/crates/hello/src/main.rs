//! The only service while the foundation is built: it exercises each DSL as it lands.

use base::Typing;

#[expect(clippy::disallowed_macros, clippy::print_stdout, reason = "a binary reports to its operator on stdout")]
fn main() {
    println!("{}", Typing::hello_world());
}
