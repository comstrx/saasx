use engine::http::{Limit, Response, Router, Server, Timeout, Trace};
use engine::error::{Code, Failure, Result};
use engine::process::{Args, Boot, Env};
use engine::thread::Runtime;
use engine::net::Address;
use engine::validate::Form;
use std::io::{Write as _, stdout};
use alloc::sync::Arc;

use crate::arch::{Iam, Operator, Service, Store};

impl Iam {

    pub(crate) fn run () -> Result<()> {

        let args = Args::current();

        if let Some(line) = args.version("iam", env!("CARGO_PKG_VERSION")) {

            stdout().lock().write_all(line.as_bytes())?;
            return Ok(());

        }

        Failure::ensure(args.is_bare(), Code::Usage, "iam takes no arguments; it is configured by IAM_* variables")?;

        let env = Runtime::run(Boot::env())?;
        let iam = Self::configure(&env)?;

        iam.serve()

    }

    fn configure ( env: &Env ) -> Result<Self> {

        let address  = env.text("IAM_ADDR").map_or_else(|| Address::parse("127.0.0.1:8080"), |text| Address::parse(&text)).map_err(|failure| failure.coded(Code::Config).about("IAM_ADDR"))?;
        let workers  = env.usize("IAM_WORKERS", Runtime::cores())?.max(1);
        let email    = env.need("IAM_USER")?;
        let password = env.need("IAM_PASSWORD")?;

        let mut form = Form::new();

        form.text("IAM_USER", &email).email().max(254);
        form.text("IAM_PASSWORD", &password).min(12).max(128);
        form.finish().map_err(|failure| failure.coded(Code::Config))?;

        let operator = Arc::new(Operator { email: email.into(), password: password.into() });
        let service  = Service { log: Boot::log(env, "IAM", "iam")?, store: Arc::new(Store::new(10_000)), operator };

        Ok(Self { address, workers, service })

    }

    fn serve ( self ) -> Result<()> {

        let Self { address, workers, service } = self;
        let stop = Boot::stop();
        let log  = &service.log;

        log.info("starting").field("addr", &address.to_string()).field("workers", workers).emit();
        log.audit("start").actor("operator").commit()?;

        let routes  = service.clone();
        let outcome = Server::bind(address).workers(workers).run(move |worker| routes.router(worker), stop.clone(), |local| log.info("listening").field("addr", &local.to_string()).emit());

        stop.raise();

        log.info("stopped").field("sessions", service.store.len()).emit();
        log.audit("stop").actor("operator").commit()?;
        log.flush()?;

        outcome

    }

}

impl Service {

    pub(crate) fn router ( &self, worker: u16 ) -> Router {

        let ( login, show, logout ) = ( self.clone(), self.clone(), self.clone() );

        Router::new()
            .worker(worker)
            .get("/health", |_request| async { Ok(Response::text("ok")) })
            .post("/sessions", move |request| login.clone().login(request))
            .get("/session", move |request| show.clone().show(request))
            .delete("/session", move |request| logout.clone().logout(request))
            .get("/echo", Self::echo)
            .layer(Trace::new(self.log.clone()))
            .layer(Timeout::secs(10))
            .layer(Limit::bytes(64 * 1024))

    }

}
