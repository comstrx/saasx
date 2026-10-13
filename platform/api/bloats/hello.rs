//! The floor a service binary pays before any logic.

use core::hint::black_box;
use std::env::args_os;
use base::Typing;

fn main () {

    black_box(Typing::hello_world());
    black_box(args_os().count());

}
