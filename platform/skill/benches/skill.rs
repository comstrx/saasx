//! Scenario: what the real `skill` binary costs to boot and say hello, and what its argument parsing costs alone.

use criterion::{Criterion, criterion_group, criterion_main};
use engine::process::{Args, Cargo};
use core::hint::black_box;
use std::path::Path;

fn bench_skill ( harness: &mut Criterion ) {

    let mut group = harness.benchmark_group("skill");

    if let Ok(mut hello) = Cargo::command(Path::new(env!("CARGO_MANIFEST_DIR")), "skill", true, "SKILL_") {

        hello.arg("hello");
        group.bench_function("hello", |bencher| bencher.iter(|| hello.output().map(|output| output.status.success())));

    }

    group.bench_function("args/parse", |bencher| bencher.iter(|| Args::from_words(black_box(&["skill", "hello", "--SKILL_LOG=info"])).command().map(str::len)));
    group.finish();

}

criterion_group!(benches, bench_skill);
criterion_main!(benches);
