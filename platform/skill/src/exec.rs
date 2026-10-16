use engine::error::{Code, Failure, Result};
use std::io::{Write as _, stderr};
use engine::parse::Parse;
use engine::process::{Faults as Commands, Run};

use crate::arch::{Faults, Skill};

impl Skill {

    fn failed ( program: &str, code: i32, said: &str ) -> Failure {

        let failure = Commands::COMMAND_FAILED.because(format!("{program} exited with {code}"));

        if said.is_empty() { failure } else { failure.context(said.to_owned()) }

    }

    pub(crate) async fn exec ( &self ) -> Result<String> {

        let ( program, args ) = self.tool.args().rest().split_first().ok_or_else(|| Faults::NO_PROGRAM.fail())?;
        let deadline = self.tool.args().get("deadline").map(Parse::duration).transpose().map_err(|failure| failure.coded(Code::Usage).about("deadline"))?;

        let mut run = Run::new(program).args(args);

        if let Some(deadline) = deadline { run = run.deadline(deadline); }

        if let Some(cwd) = self.tool.args().get("cwd") { run = run.cwd(cwd); }

        let out = run.output().await?;

        stderr().lock().write_all(out.stderr())?;
        self.tool.log().info("exec").field("program", program.as_str()).field("code", out.code().map(i64::from)).field("ms", u64::try_from(out.elapsed().as_millis()).unwrap_or(u64::MAX)).emit();

        match out.code() {
            Some(0)    => Ok(out.text()),
            Some(code) => Err(Self::failed(program, code, out.text().trim())),
            None       => Err(Faults::COMMAND_SIGNALED.because(format!("{program} was ended by a signal"))),
        }

    }

}
