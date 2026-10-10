//! Size probe: the floor the binary pays before any logic.

use core::hint::black_box;
use std::env::args_os;

use base::Typing;

fn main() {
    // A run-time value keeps the call from being const-folded away.
    let argc = args_os().count();

    black_box(Typing::hello_world());
    black_box(argc);
}
