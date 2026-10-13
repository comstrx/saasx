use engine::error::{Code, Failure, Result};
use std::io::{Write as _, stderr};
use engine::parse::Parse;
use engine::process::Run;

use crate::arch::Skill;

impl Skill {

    fn failed ( program: &str, code: i32, said: &str ) -> Failure {

        let failure = Failure::internal(format!("{program} exited with {code}")).keyed("command_failed");

        if said.is_empty() { failure } else { failure.context(said.to_owned()) }

    }

    pub(crate) async fn exec ( &self ) -> Result<String> {

        let ( program, args ) = self.args.rest().split_first().ok_or_else(|| Failure::usage("a program is required").keyed("no_program"))?;
        let deadline = self.args.get("deadline").map(Parse::duration).transpose().map_err(|failure| failure.coded(Code::Usage).about("deadline"))?;

        let mut run = Run::new(program).args(args);

        if let Some(deadline) = deadline { run = run.deadline(deadline); }

        if let Some(cwd) = self.args.get("cwd") { run = run.cwd(cwd); }

        let out = run.output().await?;

        stderr().lock().write_all(out.stderr())?;
        self.log.info("exec").field("program", program.as_str()).field("code", out.code().map(i64::from)).field("ms", u64::try_from(out.elapsed().as_millis()).unwrap_or(u64::MAX)).emit();

        match out.code() {
            Some(0)    => Ok(out.text()),
            Some(code) => Err(Self::failed(program, code, out.text().trim())),
            None       => Err(Failure::internal(format!("{program} was ended by a signal")).keyed("command_signaled")),
        }

    }

}
