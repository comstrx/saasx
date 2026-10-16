use engine::process::{Run, System};
use core::fmt::Write as _;
use engine::error::Result;

use crate::arch::Skill;

impl Skill {

    pub(crate) async fn doctor ( &self ) -> Result<String> {

        let mut out = String::with_capacity(256);

        writeln!(out, "platform={} distro={} arch={} cores={}", System::platform(), System::distro().await, System::arch(), System::cores())?;
        writeln!(out, "user={} pid={}", System::user(), System::pid())?;

        for tool in ["cargo", "git", "bun", "docker"] { writeln!(out, "{tool}={}", Run::which(tool).map_or_else(|| "absent".to_owned(), |path| path.display().to_string()))?; }

        self.tool.log().info("doctor").field("platform", System::platform().name()).emit();

        Ok(out)

    }

}
