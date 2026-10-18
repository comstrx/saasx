use engine::process::Tool;
use engine::error::Result;

use crate::arch::Skill;

impl Skill {

    const USAGE: &str = "skill hello";

    const GREETING: &str = "hello world\n";

    pub(crate) fn run () -> Result<()> {

        let skill = Self { tool: Tool::boot("SKILL", "skill", Self::USAGE)? };

        skill.dispatch()

    }

    fn dispatch ( &self ) -> Result<()> {

        if let Some(line) = self.tool.args().version("skill", env!("CARGO_PKG_VERSION")) { return self.tool.answer(&line); }

        match self.tool.command()? {
            "hello" => self.hello(),
            _       => Err(self.tool.unknown()),
        }

    }

    fn hello ( &self ) -> Result<()> {

        self.tool.log().info("hello").emit();
        self.tool.answer(Self::GREETING)

    }

}
