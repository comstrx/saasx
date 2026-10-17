use engine::thread::Runtime;
use engine::process::Tool;
use engine::error::Result;

use crate::arch::Skill;

impl Skill {

    const USAGE: &str = "skill doctor | env [--file <path>] <NAME>... | exec [--deadline <duration>] [--cwd <dir>] -- <program> [args]...";

    pub(crate) fn run () -> Result<()> {

        let skill = Self { tool: Tool::boot("SKILL", "skill", Self::USAGE)? };

        Runtime::run(skill.dispatch())

    }

    async fn dispatch ( &self ) -> Result<()> {

        if let Some(line) = self.tool.args().version("skill", env!("CARGO_PKG_VERSION")) { return self.tool.answer(&line); }

        let text = match self.tool.command()? {
            "doctor" => self.doctor().await?,
            "env"    => self.env().await?,
            "exec"   => self.exec().await?,
            _        => return Err(self.tool.unknown()),
        };

        self.tool.answer(&text)

    }

}
