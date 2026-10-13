use engine::error::Result;
use std::io::{Write as _, stdout};
use engine::process::{Args, Boot};
use engine::thread::Runtime;

use crate::arch::{Faults, Skill};

impl Skill {

    const USAGE: &str = "skill doctor | env [--file <path>] <NAME>... | exec [--deadline <duration>] [--cwd <dir>] -- <program> [args]...";

    pub(crate) fn run () -> Result<()> {

        let env   = Runtime::run(Boot::env())?;
        let skill = Self { args: Args::current(), log: Boot::log(&env, "SKILL", "skill")? };

        Runtime::run(skill.dispatch())

    }

    async fn dispatch ( &self ) -> Result<()> {

        let text = match self.args.command() {
            Some("doctor") => self.doctor().await?,
            Some("env")    => self.env().await?,
            Some("exec")   => self.exec().await?,
            Some(_)        => return Err(self.args.unknown().context(Self::USAGE)),
            None           => return Err(Faults::NO_COMMAND.fail().context(Self::USAGE)),
        };

        stdout().lock().write_all(text.as_bytes())?;
        self.log.flush()?;

        Ok(())

    }

}
