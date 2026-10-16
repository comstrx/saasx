//! Scenario: the real `iam` binary, launched as production launches it, driven over the engine's own client.

#[cfg(test)]
mod tests {

    use std::io::{BufRead as _, BufReader, Error as IoError, Result as IoResult};
    use engine::http::{Body, Client, Header, Method, Request, Response};
    use std::process::{Child, Command, Stdio, id};
    use std::fs::{read_to_string, remove_file};
    use engine::error::{Code, Failure, Result};
    use engine::net::{Address, Dial};
    use std::path::{Path, PathBuf};
    use engine::thread::Runtime;
    use engine::crypto::Digest;
    use engine::process::Cargo;
    use core::time::Duration;
    use std::env::temp_dir;
    use std::thread::spawn;

    const PASSWORD: &str = "correct-horse-battery";

    const USER: &str = "ada@example.com";

    const FORM: &str = "application/x-www-form-urlencoded";

    type Ended = ( String, String, bool );

    type Refusal = ( Option<i32>, String );

    struct Running {
        child: Child,
        base:  String,
        local: Address,
        audit: PathBuf,
        logs:  PathBuf,
    }

    fn root () -> PathBuf {

        Path::new(env!("CARGO_MANIFEST_DIR")).join("..")

    }

    fn iam () -> IoResult<Command> {

        Cargo::command(&root(), "iam", false, "IAM_").map_err(|failure| IoError::other(failure.to_string()))

    }

    fn unique ( name: &str ) -> PathBuf {

        temp_dir().join(format!("iam-{}-{name}.log", id()))

    }

    fn launch ( name: &str ) -> IoResult<Running> {

        let audit = unique(&format!("{name}-audit"));
        let logs  = unique(&format!("{name}-logs"));

        let mut child = iam()?
            .env("IAM_ADDR", "127.0.0.1:0")
            .env("IAM_WORKERS", "2")
            .env("IAM_LOG", "info")
            .env("IAM_USER", USER)
            .env("IAM_PASSWORD", PASSWORD)
            .env("IAM_AUDIT", &audit)
            .env("IAM_LOG_FILE", &logs)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()?;

        let stderr = child.stderr.take().ok_or_else(|| IoError::other("no stderr"))?;
        let mut lines = BufReader::new(stderr).lines();

        let listening = lines.find_map(|line| line.ok().filter(|line| line.contains(" iam: listening addr=")));
        let addr = listening.and_then(|line| line.rsplit_once("addr=").map(|( _, addr )| addr.trim().to_owned())).ok_or_else(|| IoError::other("iam never said it was listening"))?;
        let local = Address::parse(&addr).map_err(|failure| IoError::other(failure.to_string()))?;

        spawn(move || lines.for_each(drop));

        Ok(Running { child, base: format!("http://{local}"), local, audit, logs })

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

    async fn posted ( client: &Client, base: &str, form: impl Into<Body> ) -> Result<( u16, String )> {

        let mut response = client.post(&format!("{base}/sessions"), form, FORM).await?;

        Ok(( response.code(), response.text_body(4096).await? ))

    }

    async fn bearer ( client: &Client, method: Method, uri: &str, token: &str ) -> Result<Response> {

        client.send(Request::build(method, uri)?.header(Header::AUTHORIZATION, &format!("Bearer {token}"))?).await

    }

    async fn drive ( base: &str ) -> Result<Vec<( u16, String )>> {

        let client     = Client::new().timeout(Duration::from_secs(5));
        let mut health = client.get(&format!("{base}/health")).await?;
        let mut seen   = vec![( health.code(), health.text_body(1024).await? )];

        seen.push(posted(&client, base, "email=nope&password=").await?);
        seen.push(posted(&client, base, "email=ada%40example.com&password=not-the-one").await?);
        seen.push(posted(&client, base, format!("email=eve%40example.com&password={PASSWORD}")).await?);

        let mut opened = client.post(&format!("{base}/sessions"), format!("email=ada%40example.com&password={PASSWORD}"), FORM).await?;
        let tagged = opened.head(&Header::REQUEST_ID).is_some();
        let body   = opened.text_body(4096).await?;
        let token  = body.split("\"token\":\"").nth(1).and_then(|rest| rest.split('"').next()).unwrap_or_default().to_owned();
        let named  = body.contains("\"email\":\"ada@example.com\"");

        seen.push(( opened.code(), format!("{tagged}:{named}") ));

        let session   = format!("{base}/session");
        let mut shown = bearer(&client, Method::GET, &session, &token).await?;

        seen.push(( shown.code(), shown.text_body(4096).await?.contains(&token).to_string() ));
        seen.push(( bearer(&client, Method::DELETE, &session, &token).await?.code(), String::new() ));
        seen.push(( bearer(&client, Method::GET, &session, &token).await?.code(), String::new() ));
        seen.push(( client.get(&session).await?.code(), String::new() ));
        seen.push(( client.get(&format!("{base}/nowhere")).await?.code(), String::new() ));

        Ok(seen)

    }

    async fn echoed ( local: &Address ) -> Result<Vec<u8>> {

        let mut stream = Dial::connect(local, Duration::from_secs(5)).await?;

        let nonce = Digest::base64(b"the sample nonce");

        stream.send(format!("GET /echo HTTP/1.1\r\nHost: {local}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: {nonce}\r\n\r\n").as_bytes()).await?;

        let mut head = [0u8; 512];
        let came     = stream.recv(&mut head).await?;

        Failure::ensure(head.get(..came).unwrap_or_default().starts_with(b"HTTP/1.1 101"), Code::Internal, "no upgrade")?;

        stream.send(&[0x81, 0x82, 1, 2, 3, 4, b'h' ^ 1, b'i' ^ 2]).await?;

        let mut back = [0u8; 4];

        stream.fill(&mut back).await?;

        Ok(back.to_vec())

    }

    fn checked ( seen: &[( u16, String )] ) -> bool {

        seen.iter().map(|( code, _ )| *code).eq([200, 400, 401, 401, 201, 200, 204, 404, 401, 404])
            && seen.first().is_some_and(|( _, text )| text == "ok")
            && seen.get(1).is_some_and(|( _, text )| text.contains("\"key\":\"invalid_fields\"") && text.contains("\"email\":{\"key\":\"not_email\"") && text.contains("\"password\":{\"key\":\"required\""))
            && seen.get(2).is_some_and(|( _, text )| text.contains("\"key\":\"bad_credentials\""))
            && seen.get(3).is_some_and(|( _, text )| text.contains("\"key\":\"bad_credentials\""))
            && seen.get(4).is_some_and(|( _, text )| text == "true:true")
            && seen.get(5).is_some_and(|( _, text )| text == "true")

    }

    fn audited ( audit: &str ) -> bool {

        audit.contains("\"action\":\"start\",\"actor\":\"operator\",\"outcome\":\"done\"")
            && audit.contains("\"action\":\"login\",\"actor\":\"ada@example.com\",\"outcome\":\"denied\"")
            && audit.contains("\"action\":\"login\",\"actor\":\"eve@example.com\",\"outcome\":\"denied\"")
            && audit.contains("\"action\":\"login\",\"actor\":\"ada@example.com\",\"outcome\":\"done\",\"fields\":{\"session\":\"")
            && audit.contains("\"action\":\"logout\",\"actor\":\"ada@example.com\",\"outcome\":\"done\"")

    }

    #[test]
    fn the_whole_lifecycle_boots_serves_audits_and_stops () {

        let running = launch("lifecycle").ok();
        let Some(running) = running else { return assert!(running.is_some()); };

        let seen  = Runtime::block_on(drive(&running.base)).ok().and_then(Result::ok).unwrap_or_default();
        let ended = stop(running).ok();

        let Some(( audit, logs, graceful )) = ended else { return assert!(ended.is_some()); };

        assert!(checked(&seen), "{seen:?}");
        assert!(audited(&audit), "{audit}");
        assert!(logs.contains("\"message\":\"listening\""));
        assert_eq!(logs.matches("\"message\":\"request\"").count(), 10);
        assert!(!logs.contains("Bearer ") && !audit.contains("\"token\""));
        assert!(logs.contains("\"path\":\"/sessions\",\"status\":401"));
        assert!(!graceful || (audit.contains("\"action\":\"stop\"") && logs.contains("\"message\":\"stopped\"")));
        assert!(!cfg!(unix) || graceful);

    }

    #[test]
    fn the_echo_socket_upgrades_and_answers () {

        let running = launch("echo").ok();
        let Some(running) = running else { return assert!(running.is_some()); };

        let bytes = Runtime::block_on(echoed(&running.local)).ok().and_then(Result::ok).unwrap_or_default();
        let ended = stop(running).ok();

        assert_eq!(bytes, b"\x81\x02hi".to_vec());
        assert!(ended.is_some());

    }

    fn refused ( env: &[( &str, &str )] ) -> Option<Refusal> {

        let output = iam().ok()?.envs(env.iter().copied()).output().ok()?;

        Some(( output.status.code(), String::from_utf8_lossy(&output.stderr).into_owned() ))

    }

    #[test]
    fn misconfiguration_and_arguments_fail_before_listening () {

        let arg = iam().ok().and_then(|mut command| command.arg("--x").output().ok());
        let ok  = [( "IAM_USER", USER ), ( "IAM_PASSWORD", PASSWORD )];

        assert_eq!(arg.as_ref().and_then(|output| output.status.code()), Some(64));
        assert!(arg.is_some_and(|output| String::from_utf8_lossy(&output.stderr).starts_with("usage [usage] http 400 exit 64: iam takes no arguments")));
        assert!(refused(&[( "IAM_USER", USER )]).is_some_and(|( code, text )| code == Some(78) && text.contains("IAM_PASSWORD is not set")));
        assert!(refused(&[( "IAM_PASSWORD", PASSWORD )]).is_some_and(|( code, text )| code == Some(78) && text.contains("IAM_USER is not set")));
        assert!(refused(&[( "IAM_USER", USER ), ( "IAM_PASSWORD", "too-short" )]).is_some_and(|( code, text )| code == Some(78) && text.contains("field IAM_PASSWORD [too_short]")));
        assert!(refused(&[( "IAM_USER", "not-an-email" ), ( "IAM_PASSWORD", PASSWORD )]).is_some_and(|( code, text )| code == Some(78) && text.contains("field IAM_USER [not_email]")));
        assert!(refused(&[ok[0], ok[1], ( "IAM_ADDR", "nope" )]).is_some_and(|( code, text )| code == Some(78) && text.contains("not an address") && text.contains("on: IAM_ADDR")));

    }

}
