//! Scenario: what one request to the real `iam` server costs over the loopback, and what its pieces cost alone.

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

const BAD_CREDENTIALS: Fault = Fault::new("bad_credentials", Code::Unauthenticated, "the email or the password is wrong");

fn launch () -> Option<( Child, String )> {

    let mut child = Cargo::command(&Path::new(env!("CARGO_MANIFEST_DIR")).join(".."), "iam", true, "IAM_")
        .ok()?
        .env("IAM_ADDR", "127.0.0.1:0")
        .env("IAM_USER", "bench@example.com")
        .env("IAM_PASSWORD", "a-long-bench-secret")
        .env("IAM_LOG", "info")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .ok()?;

    let stderr = child.stderr.take()?;
    let mut lines = BufReader::new(stderr).lines();
    let addr = lines.find_map(|line| line.ok().and_then(|line| line.rsplit_once("listening addr=").map(|( _, addr )| addr.trim().to_owned())))?;

    spawn(move || lines.for_each(drop));

    Some(( child, format!("http://{addr}/health") ))

}

fn bench_iam ( harness: &mut Criterion ) {

    let server = launch();
    let base   = server.as_ref().map(|( _, base )| base.clone());

    measure(harness, base.as_deref());

    if let Some(( mut child, _ )) = server { drop(child.kill()); drop(child.wait()); }

}

fn measure ( harness: &mut Criterion, base: Option<&str> ) {

    let mut group = harness.benchmark_group("iam");
    let client    = Client::new().timeout(Duration::from_secs(5));

    group.bench_function("health/loopback", |bencher| bencher.iter(|| Runtime::block_on(async { match base { Some(uri) => client.get(uri).await.map(|response| response.code()), None => Err(Failure::internal("no server")) } })));
    group.bench_function("response/failure-wire", |bencher| bencher.iter(|| Response::from(black_box(BAD_CREDENTIALS).fail()).code()));
    group.finish();

}

criterion_group!(benches, bench_iam);
criterion_main!(benches);
