//! The floor the identity service pays: the engine crates linked the way `iam` links them.

use engine::http::{Response, Router, Server, Settings};
use engine::memory::{Simd, Space as _, Stack};
use engine::error::{Code, Failure};
use engine::thread::Stop;
use engine::net::Address;
use engine::log::{Log, Stderr};
use core::hint::black_box;
use std::env::args_os;

fn main () {

    let log = Log::setup().sink(Stderr::json()).build("bloat");

    let mut line = Stack::<32>::new();

    black_box(line.push_str("Hello, world!").map(|line| line.len()).ok());
    black_box(Simd::find(&line, b','));
    black_box(Failure::ensure(args_os().count() == 1, Code::Usage, "no arguments").err().map(|failure| Response::from(failure).code()));
    black_box(log.info("linked").field("bytes", line.len()).commit().ok());
    black_box(Router::new().get("/", |_request| async { Ok(Response::text("ok")) }).worker(0));
    black_box(Address::parse("127.0.0.1:0").map(|address| Server::bind(address).settings(Settings::new()).workers(1).address().to_string()).ok());
    black_box(Stop::new().raised());

}
