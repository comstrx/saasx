//! The floor every other fuzz target is calibrated against.

#![no_main]
#![expect(clippy::disallowed_methods, reason = "the libFuzzer entry macro expands to `expect`")]

use libfuzzer_sys::fuzz_target;
use core::hint::black_box;
use base::Typing;

fuzz_target!(|_data: &[u8]| {

    black_box(Typing::hello_world());

});
