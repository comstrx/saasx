//! The floor every later measurement is calibrated against.

use core::hint::black_box;

use base::Typing;
use criterion::{Criterion, criterion_group, criterion_main};

fn bench_infra(harness: &mut Criterion) {
    let mut group = harness.benchmark_group("infra");

    group.bench_function("Typing::hello_world", |bencher| {
        bencher.iter(|| black_box(Typing::hello_world()));
    });

    group.finish();
}

criterion_group!(benches, bench_infra);
criterion_main!(benches);
