use engine::error::Result;
use std::io::{Write as _, stdout};
use engine::process::{Args, Boot};
use engine::thread::Runtime;

use crate::arch::{Faults, Infra};

impl Infra {

    const USAGE: &str = "infra doctor | service <show|install|uninstall|start|stop|restart|status> <name> [--command <path>] [--arg=<x>]... [--cwd <dir>] [--env K=V]... [--provider systemd|launchd|windows] | package <install|uninstall|check> <name>";

    pub(crate) fn run () -> Result<()> {

        let env   = Runtime::run(Boot::env())?;
        let infra = Self { args: Args::current(), log: Boot::log(&env, "INFRA", "infra")? };

        Runtime::run(infra.dispatch())

    }

    async fn dispatch ( &self ) -> Result<()> {

        let text = match self.args.command() {
            Some("doctor")  => self.doctor().await?,
            Some("service") => self.service().await?,
            Some("package") => self.package().await?,
            Some(_)         => return Err(self.args.unknown().context(Self::USAGE)),
            None            => return Err(Faults::NO_COMMAND.fail().context(Self::USAGE)),
        };

        stdout().lock().write_all(text.as_bytes())?;
        self.log.flush()?;

        Ok(())

    }

    pub(crate) fn name ( &self ) -> Result<&str> {

        self.args.positional(1).ok_or_else(|| Faults::NO_NAME.fail().context(Self::USAGE))

    }

    pub(crate) fn action ( &self ) -> Result<&str> {

        self.args.positional(0).ok_or_else(|| Faults::NO_ACTION.fail().context(Self::USAGE))

    }

}
