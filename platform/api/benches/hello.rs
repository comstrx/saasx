//! Scenario: the cost of reaching the foundation from a service.

use core::hint::black_box;

use base::Typing;
use criterion::{Criterion, criterion_group, criterion_main};

fn bench_hello(harness: &mut Criterion) {
    let mut group = harness.benchmark_group("hello");

    group.bench_function("Typing::hello_world", |bencher| {
        bencher.iter(|| black_box(Typing::hello_world()));
    });

    group.finish();
}

criterion_group!(benches, bench_hello);
criterion_main!(benches);
