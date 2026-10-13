use engine::process::{Provider, Service, Spec, State, System};
use engine::error::{Failure, Result};
use engine::log::Outcome;
use std::path::PathBuf;

use crate::arch::Infra;

impl Infra {

    pub(crate) async fn service ( &self ) -> Result<String> {

        let action = self.action()?;
        let name   = self.name()?;

        match action {
            "show"      => Ok(self.spec(name)?.render(self.provider()?)),
            "status"    => Ok(format!("{}\n", Self::state(Service::over(self.provider()?, System::is_root().await).status(name).await?))),
            "install"   => self.change(name, "install").await,
            "uninstall" => self.change(name, "uninstall").await,
            "start"     => self.change(name, "start").await,
            "stop"      => self.change(name, "stop").await,
            "restart"   => self.change(name, "restart").await,
            other       => Err(Failure::usage(format!("{other} is not a service action")).keyed("unknown_action")),
        }

    }

    async fn change ( &self, name: &str, action: &str ) -> Result<String> {

        let manager = Service::over(self.provider()?, System::is_root().await);
        let actor   = System::user();

        let outcome = match action {
            "install" => manager.install(&self.spec(name)?).await,
            "uninstall" => manager.uninstall(name).await,
            "start"   => manager.start(name).await,
            "stop"    => manager.stop(name).await,
            _         => manager.restart(name).await,
        };

        self.log.audit(action).actor(&actor).outcome(if outcome.is_ok() { Outcome::Done } else { Outcome::Failed }).field("service", name).commit()?;
        outcome?;

        Ok(format!("{action} {name}: done\n"))

    }

    fn spec ( &self, name: &str ) -> Result<Spec> {

        let command = PathBuf::from(self.args.need("command")?);
        let mut spec = Spec::new(name, command);

        for arg in self.args.all("arg") { spec = spec.arg(arg); }

        for ( key, value ) in self.args.all("env").filter_map(|pair| pair.split_once('=')) { spec = spec.env(key, value); }

        if let Some(cwd) = self.args.get("cwd") { spec = spec.cwd(cwd); }

        if let Some(description) = self.args.get("description") { spec = spec.description(description); }

        Ok(spec)

    }

    fn provider ( &self ) -> Result<Provider> {

        match self.args.get("provider") {
            Some("systemd") => Ok(Provider::Systemd),
            Some("launchd") => Ok(Provider::Launchd),
            Some("windows") => Ok(Provider::Windows),
            Some(other)     => Err(Failure::usage(format!("{other} is not a provider: systemd, launchd or windows")).keyed("unknown_provider")),
            None            => Provider::detect(),
        }

    }

    const fn state ( state: State ) -> &'static str {

        match state {
            State::Running => "running",
            State::Stopped => "stopped",
            State::Missing => "missing",
            _              => "unknown",
        }

    }

}
