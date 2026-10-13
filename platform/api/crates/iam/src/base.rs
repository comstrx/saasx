use engine::http::{Limit, Response, Router, Server, Timeout, Trace};
use engine::error::{Code, Failure, Result};
use engine::process::{Args, Boot, Env};
use engine::net::{Address, Runtime};
use alloc::sync::Arc;

use crate::arch::{Iam, Service, Store};

impl Iam {

    pub(crate) fn run () -> Result<()> {

        Failure::ensure(Args::current().is_bare(), Code::Usage, "iam takes no arguments; it is configured by IAM_* variables")?;

        let env = Runtime::block_on(Boot::env())??;
        let iam = Self::configure(&env)?;

        iam.serve()

    }

    fn configure ( env: &Env ) -> Result<Self> {

        let address  = env.text("IAM_ADDR").map_or_else(|| Address::parse("127.0.0.1:8080"), |text| Address::parse(&text)).map_err(|failure| failure.coded(Code::Config).about("IAM_ADDR"))?;
        let workers  = env.usize("IAM_WORKERS", Runtime::cores())?.max(1);
        let password = env.text("IAM_PASSWORD").unwrap_or_else(|| "correct-horse-battery".to_owned());

        Failure::ensure(password.len() >= 8, Code::Config, "IAM_PASSWORD needs at least 8 characters").map_err(|failure| failure.about("IAM_PASSWORD"))?;

        Ok(Self { address, workers, password: password.into(), log: Boot::log(env, "IAM", "iam")?, store: Arc::new(Store::new(10_000)) })

    }

    fn serve ( self ) -> Result<()> {

        let stop = Boot::stop();

        self.log.info("starting").field("addr", &self.address.to_string()).field("workers", self.workers).emit();
        self.log.audit("start").actor("operator").commit()?;

        let service = Service { log: self.log.clone(), store: Arc::clone(&self.store), password: self.password.clone() };
        let outcome = Server::bind(self.address.clone()).workers(self.workers).run(move |worker| service.router(worker), stop.clone(), |local| self.log.info("listening").field("addr", &local.to_string()).emit());

        stop.raise();

        self.log.info("stopped").field("sessions", self.store.len()).emit();
        self.log.audit("stop").actor("operator").commit()?;
        self.log.flush()?;

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

impl Clone for Service {

    fn clone ( &self ) -> Self {

        Self { log: self.log.clone(), store: Arc::clone(&self.store), password: self.password.clone() }

    }

}
