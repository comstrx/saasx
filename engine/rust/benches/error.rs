//! What a failure costs: made, framed, converted, shown, reported, sent, logged.

use std::io::{Error as IoError, ErrorKind, Result as IoResult, sink};
use criterion::{Criterion, criterion_group, criterion_main};
use error::{Code, Fail as _, Failure, Result};
use log::{Level, Record, Setup, Shape, Sink};
use core::fmt::Write as _;
use core::hint::black_box;
use memory::Stack;

struct Null;

impl Sink for Null {

    fn write ( &mut self, record: &Record<'_> ) -> IoResult<()> {

        Shape::Json.render(record, &mut sink())

    }

    fn flush ( &mut self ) -> IoResult<()> {

        Ok(())

    }

}

fn read () -> Result<()> {

    Err(IoError::new(black_box(ErrorKind::NotFound), "disk").into())

}

fn sample () -> Failure {

    Failure::conflict("taken").keyed("email_taken").context("saving").context("handling").caused_by(IoError::other("disk"))

}

fn bench_failure ( harness: &mut Criterion ) {

    let mut group = harness.benchmark_group("failure");
    let log       = Setup::new().level(Level::Trace).sink(Null).build("bench");
    let ready     = sample();

    group.bench_function("new", |bencher| bencher.iter(|| Failure::new(black_box(Code::NotFound))));
    group.bench_function("static-detail", |bencher| bencher.iter(|| Failure::invalid(black_box("the email is taken"))));
    group.bench_function("owned-detail", |bencher| bencher.iter(|| Failure::invalid(black_box("the email").to_owned())));
    group.bench_function("two-frames", |bencher| bencher.iter(|| Failure::invalid("x").context(black_box("a")).context("b")));
    group.bench_function("from-io", |bencher| bencher.iter(|| read().context(black_box("reading")).or_fail(Code::Config)));
    group.bench_function("display", |bencher| bencher.iter(|| { let mut out = Stack::<128>::new(); black_box(write!(out, "{}", black_box(&ready))) }));
    group.bench_function("report", |bencher| bencher.iter(|| { let mut out = Stack::<256>::new(); black_box(write!(out, "{}", black_box(&ready).report())) }));
    group.bench_function("wire", |bencher| bencher.iter(|| { let mut out = Stack::<256>::new(); black_box(write!(out, "{}", black_box(&ready).wire())) }));
    group.bench_function("log", |bencher| bencher.iter(|| black_box(&ready).emit(&log)));
    group.finish();

}

fn bench_code ( harness: &mut Criterion ) {

    let mut group = harness.benchmark_group("code");

    group.bench_function("from-io", |bencher| bencher.iter(|| Code::from_io(black_box(ErrorKind::BrokenPipe))));
    group.bench_function("from-http", |bencher| bencher.iter(|| Code::from_http(black_box(418))));
    group.bench_function("parse", |bencher| bencher.iter(|| Code::parse(black_box("unavailable"))));
    group.finish();

}

criterion_group!(benches, bench_failure, bench_code);
criterion_main!(benches);
