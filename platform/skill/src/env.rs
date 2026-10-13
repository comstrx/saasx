use engine::error::{Code, Failure, Result};
use core::fmt::Write as _;
use engine::process::Env;
use std::path::Path;

use crate::arch::Skill;

impl Skill {

    pub(crate) async fn env ( &self ) -> Result<String> {

        let env = match self.args.get("file") {
            Some(file) => Env::with_file(Path::new(file)).await?,
            None       => Env::system(),
        };

        Failure::ensure(!self.args.rest().is_empty(), Code::Usage, "at least one NAME is required").map_err(|failure| failure.keyed("no_name"))?;

        let mut out = String::new();

        for name in self.args.rest() { writeln!(out, "{name}={}", env.need(name)?)?; }

        self.log.info("env").field("names", self.args.rest().len()).field("loaded", env.loaded()).emit();

        Ok(out)

    }

}
