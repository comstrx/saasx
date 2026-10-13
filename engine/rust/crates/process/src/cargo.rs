use error::{Code, Failure, Result};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::env::var_os;

use crate::Cargo;

impl Cargo {

    /// Builds `package` in the workspace at `root` with this process's own Cargo and returns the
    /// binary it reports, in debug or release.
    ///
    /// # Errors
    /// Cargo cannot run, the build fails, or no binary is reported.
    #[inline]
    pub fn binary ( root: &Path, package: &str, release: bool ) -> Result<PathBuf> {

        let cargo   = var_os("CARGO").unwrap_or_else(|| "cargo".into());
        let profile: &[&str] = if release { &["--release"] } else { &[] };

        let built = Command::new(cargo).args(["build", "-p", package, "--locked", "--message-format=json"]).args(profile).current_dir(root).output().map_err(|error| Failure::from(error).context("running cargo build"))?;

        Failure::ensure(built.status.success(), Code::Internal, "cargo build failed").map_err(|failure| failure.keyed("build_failed").context(String::from_utf8_lossy(&built.stderr).trim().to_owned()))?;

        let lines = String::from_utf8_lossy(&built.stdout);
        let wanted = format!("\"name\":\"{package}\"");

        lines
            .lines()
            .filter(|line| line.contains(&wanted))
            .filter_map(|line| line.split_once("\"executable\":\"").map(|( _, tail )| tail))
            .filter_map(|tail| tail.split('"').next())
            .next_back()
            .map(|path| PathBuf::from(path.replace("\\\\", "\\")))
            .ok_or_else(|| Failure::not_found(format!("cargo reported no binary for {package}")).keyed("no_binary"))

    }

}
