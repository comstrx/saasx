//! Scenario: what the real `desk` binary costs to boot and answer `--version`, and what its argument parsing costs alone.

use criterion::{Criterion, criterion_group, criterion_main};
use engine::process::{Args, Cargo};
use core::hint::black_box;
use std::path::Path;

fn bench_desk ( harness: &mut Criterion ) {

    let mut group = harness.benchmark_group("desk");

    if let Ok(mut version) = Cargo::command(Path::new(env!("CARGO_MANIFEST_DIR")), "desk", true, "DESK_") {

        version.arg("--version");
        group.bench_function("version", |bencher| bencher.iter(|| version.output().map(|output| output.status.success())));

    }

    group.bench_function("args/parse", |bencher| bencher.iter(|| Args::from_words(black_box(&["desk", "--version"])).has("version")));
    group.finish();

}

criterion_group!(benches, bench_desk);
criterion_main!(benches);
