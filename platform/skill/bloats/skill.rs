//! The floor the `skill` binary pays: the engine crates linked the way it links them.

use engine::memory::{Simd, Space as _, Stack};
use engine::process::{Args, Run, System};
use engine::error::{Code, Failure};
use engine::log::{Log, Stderr};
use core::hint::black_box;
use engine::parse::Parse;
use std::env::args_os;

fn main () {

    let log = Log::setup().sink(Stderr::json()).build("bloat");

    let mut line = Stack::<32>::new();

    black_box(line.push_str("Hello, world!").map(|line| line.len()).ok());
    black_box(Simd::find(&line, b','));
    black_box(Failure::ensure(args_os().count() == 1, Code::Usage, "no arguments").err().map(|failure| failure.report().to_string()));
    black_box(log.info("linked").field("bytes", line.len()).commit().ok());
    black_box(Args::current().command().map(str::len));
    black_box(( Run::which("cargo").is_some(), Parse::duration("5s").ok() ));
    black_box(( System::platform().name(), System::cores() ));

}
