use engine::http::{Limit, Response, Router, Server, Timeout, Trace};
use engine::error::{Code, Failure, Result};
use engine::process::{Args, Boot, Env};
use engine::thread::Runtime;
use engine::net::Address;
use engine::log::Log;
use std::io::{Write as _, stdout};

use crate::arch::Hello;

impl Hello {

    const GREETING: &str = "hello world";

    pub(crate) fn run () -> Result<()> {

        let args = Args::current();

        if let Some(line) = args.version("hello", env!("CARGO_PKG_VERSION")) {

            stdout().lock().write_all(line.as_bytes())?;
            return Ok(());

        }

        Failure::ensure(args.is_bare(), Code::Usage, "hello takes no arguments; it is configured by HELLO_* variables")?;

        let env   = Runtime::run(Boot::env())?;
        let hello = Self::configure(&env)?;

        hello.serve()

    }

    fn configure ( env: &Env ) -> Result<Self> {

        let address = env.text("HELLO_ADDR").map_or_else(|| Address::parse("127.0.0.1:8080"), |text| Address::parse(&text)).map_err(|failure| failure.coded(Code::Config).about("HELLO_ADDR"))?;
        let workers = env.usize("HELLO_WORKERS", Runtime::cores())?.max(1);
        let log     = Boot::log(env, "HELLO", "hello")?;

        Ok(Self { address, workers, log })

    }

    fn serve ( self ) -> Result<()> {

        let Self { address, workers, log } = self;
        let stop = Boot::stop();

        log.info("starting").field("addr", &address.to_string()).field("workers", workers).emit();
        log.audit("start").actor("operator").commit()?;

        let routes  = log.clone();
        let outcome = Server::bind(address).workers(workers).run(move |worker| Self::router(&routes, worker), stop.clone(), |local| log.info("listening").field("addr", &local.to_string()).emit());

        stop.raise();

        log.info("stopped").emit();
        log.audit("stop").actor("operator").commit()?;
        log.flush()?;

        outcome

    }

    fn router ( log: &Log, worker: u16 ) -> Router {

        Router::new()
            .worker(worker)
            .get("/", |_request| async { Ok(Response::text(Self::GREETING)) })
            .get("/health", |_request| async { Ok(Response::text("ok")) })
            .layer(Trace::new(log.clone()))
            .layer(Timeout::secs(10))
            .layer(Limit::bytes(64 * 1024))

    }

}
