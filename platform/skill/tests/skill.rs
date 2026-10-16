//! Scenario: the real `skill` binary: doctor, typed environment with a dotenv file, programs run with a deadline, usage.

#[cfg(test)]
mod tests {

    use std::io::{Error as IoError, Result as IoResult};
    use std::fs::{remove_file, write};
    use std::process::{Output, id};
    use engine::process::Cargo;
    use std::env::temp_dir;
    use std::path::Path;

    fn run ( args: &[&str], env: &[( &str, &str )] ) -> IoResult<Output> {

        let mut command = Cargo::command(Path::new(env!("CARGO_MANIFEST_DIR")), "skill", false, "SKILL_").map_err(|failure| IoError::other(failure.to_string()))?;

        command.args(args).envs(env.iter().copied()).output()

    }

    fn text ( bytes: &[u8] ) -> String {

        String::from_utf8_lossy(bytes).into_owned()

    }

    #[test]
    fn doctor_reports_the_machine_and_its_tools () {

        let output = run(&["doctor"], &[]).ok();
        let stdout = output.as_ref().map(|output| text(&output.stdout)).unwrap_or_default();

        assert_eq!(output.and_then(|output| output.status.code()), Some(0));
        assert!(stdout.starts_with("platform=") && stdout.contains("\ncargo=") && !stdout.contains("\ncargo=absent"));

    }

    #[test]
    fn the_environment_is_read_typed_and_layered () {

        let file = temp_dir().join(format!("skill-sample-{}.env", id()));

        write(&file, "SKILL_SAMPLE_A=1\nSKILL_SAMPLE_B=\"two words\"\n").unwrap_or_default();

        let both    = run(&["env", "--file", &file.display().to_string(), "SKILL_SAMPLE_A", "SKILL_SAMPLE_B"], &[( "SKILL_SAMPLE_A", "override" )]).ok();
        let missing = run(&["env", "SKILL_SAMPLE_NOPE"], &[]).ok();
        let none    = run(&["env"], &[]).ok();

        remove_file(&file).unwrap_or_default();

        assert_eq!(both.as_ref().and_then(|output| output.status.code()), Some(0));
        assert_eq!(both.map(|output| text(&output.stdout)), Some("SKILL_SAMPLE_A=override\nSKILL_SAMPLE_B=two words\n".to_owned()));
        assert!(missing.is_some_and(|output| output.status.code() == Some(78) && text(&output.stderr).contains("SKILL_SAMPLE_NOPE is not set")));
        assert_eq!(none.and_then(|output| output.status.code()), Some(64));

    }

    #[test]
    fn programs_run_through_exec_with_their_exit_code_and_a_deadline () {

        let fine = run(&["exec", "--", "cargo", "--version"], &[]).ok();
        let bad  = run(&["exec", "--", "cargo", "definitely-not-a-command"], &[]).ok();
        let slow = if cfg!(windows) { run(&["exec", "--deadline", "300ms", "--", "cmd", "/C", "ping -n 4 127.0.0.1 > NUL"], &[]) } else { run(&["exec", "--deadline", "300ms", "--", "sleep", "3"], &[]) }.ok();
        let gone = run(&["exec", "--", "no-such-program-xyz"], &[]).ok();
        let none = run(&["exec"], &[]).ok();
        let odd  = run(&["exec", "--deadline", "soon", "--", "cargo"], &[]).ok();

        assert!(fine.is_some_and(|output| output.status.code() == Some(0) && text(&output.stdout).starts_with("cargo ")));
        assert!(bad.is_some_and(|output| output.status.code() == Some(70) && text(&output.stderr).contains("command_failed")));
        assert_eq!(slow.and_then(|output| output.status.code()), Some(75));
        assert_eq!(gone.and_then(|output| output.status.code()), Some(66));
        assert_eq!(none.and_then(|output| output.status.code()), Some(64));
        assert!(odd.is_some_and(|output| output.status.code() == Some(64) && text(&output.stderr).contains("not a duration")));

    }

}
