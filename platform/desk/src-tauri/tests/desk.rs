//! Scenario: the real `desk` binary answers `--version` and refuses arguments before any window is opened.

#[cfg(test)]
mod tests {

    use std::io::{Error as IoError, Result as IoResult};
    use engine::process::Cargo;
    use std::process::Output;
    use std::path::Path;

    fn run ( args: &[&str] ) -> IoResult<Output> {

        let mut command = Cargo::command(Path::new(env!("CARGO_MANIFEST_DIR")), "desk", false, "DESK_").map_err(|failure| IoError::other(failure.to_string()))?;

        command.args(args).output()

    }

    fn text ( bytes: &[u8] ) -> String {

        String::from_utf8_lossy(bytes).into_owned()

    }

    #[test]
    fn the_host_answers_its_version_without_a_window () {

        let output = run(&["--version"]).ok();

        assert_eq!(output.as_ref().and_then(|output| output.status.code()), Some(0));
        assert!(output.is_some_and(|output| text(&output.stdout).trim() == format!("desk {}", env!("CARGO_PKG_VERSION"))));

    }

    #[test]
    fn arguments_are_refused_as_usage () {

        let output = run(&["--x"]).ok();

        assert_eq!(output.as_ref().and_then(|output| output.status.code()), Some(64));
        assert!(output.is_some_and(|output| text(&output.stderr).contains("desk takes no arguments")));

    }

}
