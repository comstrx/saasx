//! Scenario: what the real `skill` binary costs to boot and answer `doctor`, and what its plumbing costs alone.

use criterion::{Criterion, criterion_group, criterion_main};
use engine::process::{Args, Cargo};
use core::hint::black_box;
use engine::parse::Parse;
use std::path::Path;

fn bench_skill ( harness: &mut Criterion ) {

    let mut group = harness.benchmark_group("skill");

    if let Ok(mut doctor) = Cargo::command(Path::new(env!("CARGO_MANIFEST_DIR")), "skill", true, "SKILL_") {

        doctor.arg("doctor");
        group.bench_function("doctor", |bencher| bencher.iter(|| doctor.output().map(|output| output.status.success())));

    }

    group.bench_function("args/parse", |bencher| bencher.iter(|| Args::from_words(black_box(&["skill", "exec", "--deadline", "5s", "--", "cargo", "--version"])).command().map(str::len)));
    group.bench_function("parse/deadline", |bencher| bencher.iter(|| Parse::duration(black_box("5s")).ok()));
    group.finish();

}

criterion_group!(benches, bench_skill);
criterion_main!(benches);
