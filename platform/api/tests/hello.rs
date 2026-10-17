//! Scenario: the real `hello` binary, launched as production launches it, driven over the engine's own client.

#[cfg(test)]
mod tests {

    use std::io::{BufRead as _, BufReader, Error as IoError, Result as IoResult};
    use engine::http::{Client, Header, Method, Request};
    use std::process::{Child, Command, Stdio, id};
    use std::fs::{read_to_string, remove_file};
    use std::path::{Path, PathBuf};
    use engine::thread::Runtime;
    use engine::process::Cargo;
    use engine::error::Result;
    use core::time::Duration;
    use std::env::temp_dir;
    use std::thread::spawn;

    type Ended = ( String, String, bool );

    type Refusal = ( Option<i32>, String );

    type Seen = ( u16, String, bool );

    struct Running {
        child: Child,
        base:  String,
        audit: PathBuf,
        logs:  PathBuf,
    }

    fn root () -> PathBuf {

        Path::new(env!("CARGO_MANIFEST_DIR")).join("..")

    }

    fn hello () -> IoResult<Command> {

        Cargo::command(&root(), "hello", false, "HELLO_").map_err(|failure| IoError::other(failure.to_string()))

    }

    fn unique ( name: &str ) -> PathBuf {

        temp_dir().join(format!("hello-{}-{name}.log", id()))

    }

    fn launch ( name: &str ) -> IoResult<Running> {

        let audit = unique(&format!("{name}-audit"));
        let logs  = unique(&format!("{name}-logs"));

        let mut child = hello()?
            .env("HELLO_ADDR", "127.0.0.1:0")
            .env("HELLO_WORKERS", "2")
            .env("HELLO_LOG", "info")
            .env("HELLO_AUDIT", &audit)
            .env("HELLO_LOG_FILE", &logs)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()?;

        let stderr = child.stderr.take().ok_or_else(|| IoError::other("no stderr"))?;
        let mut lines = BufReader::new(stderr).lines();

        let listening = lines.find_map(|line| line.ok().filter(|line| line.contains(" hello: listening addr=")));
        let addr = listening.and_then(|line| line.rsplit_once("addr=").map(|( _, addr )| addr.trim().to_owned())).ok_or_else(|| IoError::other("hello never said it was listening"))?;

        spawn(move || lines.for_each(drop));

        Ok(Running { child, base: format!("http://{addr}"), audit, logs })

    }

    fn stop ( mut running: Running ) -> IoResult<Ended> {

        let graceful = Running::terminate(&running.child);
        let status   = running.child.wait()?;
        let audit    = read_to_string(&running.audit)?;
        let logs     = read_to_string(&running.logs)?;

        remove_file(&running.audit)?;
        remove_file(&running.logs)?;

        Ok(( audit, logs, graceful && status.success() ))

    }

    impl Running {

        #[cfg(unix)]
        fn terminate ( child: &Child ) -> bool {

            Command::new("kill").arg("-TERM").arg(child.id().to_string()).status().is_ok_and(|status| status.success())

        }

        #[cfg(not(unix))]
        fn terminate ( child: &Child ) -> bool {

            drop(Command::new("taskkill").args(["/F", "/PID", &child.id().to_string()]).status());

            false

        }

    }

    async fn ask ( client: &Client, method: Method, uri: &str ) -> Result<Seen> {

        let mut response = client.send(Request::build(method, uri)?).await?;
        let tagged = response.head(&Header::REQUEST_ID).is_some();

        Ok(( response.code(), response.text_body(4096).await?, tagged ))

    }

    async fn drive ( base: &str ) -> Result<Vec<Seen>> {

        let client = Client::new().timeout(Duration::from_secs(5));

        Ok(vec![
            ask(&client, Method::GET, &format!("{base}/")).await?,
            ask(&client, Method::GET, &format!("{base}/health")).await?,
            ask(&client, Method::GET, &format!("{base}/nowhere")).await?,
            ask(&client, Method::POST, &format!("{base}/")).await?,
        ])

    }

    fn checked ( seen: &[Seen] ) -> bool {

        seen.iter().all(|( _, _, tagged )| *tagged)
            && seen.iter().map(|( code, _, _ )| *code).eq([200, 200, 404, 405])
            && seen.first().is_some_and(|( _, text, _ )| text == "hello world")
            && seen.get(1).is_some_and(|( _, text, _ )| text == "ok")
            && seen.get(2).is_some_and(|( _, text, _ )| text.contains("\"key\":\"no_route\""))
            && seen.get(3).is_some_and(|( _, text, _ )| text.contains("\"key\":\"method_not_allowed\""))

    }

    #[test]
    fn the_whole_lifecycle_boots_serves_audits_and_stops () {

        let running = launch("lifecycle").ok();
        let Some(running) = running else { return assert!(running.is_some()); };

        let seen  = Runtime::block_on(drive(&running.base)).ok().and_then(Result::ok).unwrap_or_default();
        let ended = stop(running).ok();

        let Some(( audit, logs, graceful )) = ended else { return assert!(ended.is_some()); };

        assert!(checked(&seen), "{seen:?}");
        assert!(audit.contains("\"action\":\"start\",\"actor\":\"operator\",\"outcome\":\"done\""), "{audit}");
        assert!(logs.contains("\"message\":\"listening\""));
        assert_eq!(logs.matches("\"message\":\"request\"").count(), 4);
        assert!(logs.contains("\"path\":\"/nowhere\",\"status\":404"));
        assert!(!graceful || (audit.contains("\"action\":\"stop\"") && logs.contains("\"message\":\"stopped\"")));
        assert!(!cfg!(unix) || graceful);

    }

    fn refused ( env: &[( &str, &str )] ) -> Option<Refusal> {

        let output = hello().ok()?.envs(env.iter().copied()).output().ok()?;

        Some(( output.status.code(), String::from_utf8_lossy(&output.stderr).into_owned() ))

    }

    #[test]
    fn misconfiguration_and_arguments_fail_before_listening () {

        let arg     = hello().ok().and_then(|mut command| command.arg("--x").output().ok());
        let version = hello().ok().and_then(|mut command| command.arg("--version").output().ok());

        assert_eq!(arg.as_ref().and_then(|output| output.status.code()), Some(64));
        assert!(arg.is_some_and(|output| String::from_utf8_lossy(&output.stderr).starts_with("usage [usage] http 400 exit 64: hello takes no arguments")));
        assert!(version.is_some_and(|output| output.status.success() && String::from_utf8_lossy(&output.stdout).trim() == format!("hello {}", env!("CARGO_PKG_VERSION"))));
        assert!(refused(&[( "HELLO_ADDR", "nope" )]).is_some_and(|( code, text )| code == Some(78) && text.contains("not an address") && text.contains("on: HELLO_ADDR")));
        assert!(refused(&[( "HELLO_LOG", "loud" )]).is_some_and(|( code, text )| code == Some(78) && text.contains("HELLO_LOG is not a level")));
        assert!(refused(&[( "HELLO_WORKERS", "many" )]).is_some_and(|( code, text )| code == Some(78) && text.contains("HELLO_WORKERS")));

    }

}
