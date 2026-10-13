use engine::error::Result;
use core::fmt::Write as _;
use engine::process::Env;
use std::path::Path;

use crate::arch::{Faults, Skill};

impl Skill {

    pub(crate) async fn env ( &self ) -> Result<String> {

        let env = match self.args.get("file") {
            Some(file) => Env::with_file(Path::new(file)).await?,
            None       => Env::system(),
        };

        Faults::NO_NAME.ensure(!self.args.rest().is_empty())?;

        let mut out = String::new();

        for name in self.args.rest() { writeln!(out, "{name}={}", env.need(name)?)?; }

        self.log.info("env").field("names", self.args.rest().len()).field("loaded", env.loaded()).emit();

        Ok(out)

    }

}
