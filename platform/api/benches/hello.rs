//! Scenario: what one request to the real `hello` server costs over the loopback, and what its pieces cost alone.

use criterion::{Criterion, criterion_group, criterion_main};
use engine::error::{Code, Failure, Fault};
use std::io::{BufRead as _, BufReader};
use engine::http::{Client, Response};
use std::process::{Child, Stdio};
use engine::thread::Runtime;
use engine::process::Cargo;
use core::hint::black_box;
use core::time::Duration;
use std::thread::spawn;
use std::path::Path;

const NOT_HERE: Fault = Fault::new("not_here", Code::NotFound, "nothing lives at this path");

fn launch () -> Option<( Child, String )> {

    let mut child = Cargo::command(&Path::new(env!("CARGO_MANIFEST_DIR")).join(".."), "hello", true, "HELLO_")
        .ok()?
        .env("HELLO_ADDR", "127.0.0.1:0")
        .env("HELLO_LOG", "info")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .ok()?;

    let stderr = child.stderr.take()?;
    let mut lines = BufReader::new(stderr).lines();
    let addr = lines.find_map(|line| line.ok().and_then(|line| line.rsplit_once("listening addr=").map(|( _, addr )| addr.trim().to_owned())))?;

    spawn(move || lines.for_each(drop));

    Some(( child, format!("http://{addr}/") ))

}

fn bench_hello ( harness: &mut Criterion ) {

    let server = launch();
    let base   = server.as_ref().map(|( _, base )| base.clone());

    measure(harness, base.as_deref());

    if let Some(( mut child, _ )) = server { drop(child.kill()); drop(child.wait()); }

}

fn measure ( harness: &mut Criterion, base: Option<&str> ) {

    let mut group = harness.benchmark_group("hello");
    let client    = Client::new().timeout(Duration::from_secs(5));

    group.bench_function("greeting/loopback", |bencher| bencher.iter(|| Runtime::block_on(async { match base { Some(uri) => client.get(uri).await.map(|response| response.code()), None => Err(Failure::internal("no server")) } })));
    group.bench_function("response/failure-wire", |bencher| bencher.iter(|| Response::from(black_box(NOT_HERE).fail()).code()));
    group.finish();

}

criterion_group!(benches, bench_hello);
criterion_main!(benches);
