//! Public-API contract of `http`: a loopback server, its client, routes, failures, middleware, h2c, `WebSocket`s, stop.

#[cfg(test)]
mod tests {

    use http::{Client, Digest, Limit, Message, Request, Response, Router, Server, Settings, Socket, Timeout, Token, Trace};
    use http::header::{CONTENT_TYPE, HeaderName, RETRY_AFTER};
    use tokio::io::{AsyncReadExt as _, AsyncWriteExt as _};
    use net::{Address, Dial, Protocol, Runtime, Stop};
    use core::net::{IpAddr, Ipv4Addr, SocketAddr};
    use tokio::task::{LocalSet, spawn_local};
    use std::sync::mpsc::{Sender, channel};
    use std::thread::{JoinHandle, spawn};
    use error::{Code, Failure, Result};
    use tokio::time::{sleep, timeout};
    use log::{Capture, Level, Setup};
    use std::collections::HashSet;
    use core::iter::repeat_with;
    use core::time::Duration;
    use std::time::Instant;

    const LOOPBACK: Address = Address::Tcp(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 0));

    const REQUEST_ID: HeaderName = HeaderName::from_static("x-request-id");

    type Run = ( Stop, JoinHandle<Result<()>> );

    type Seen = ( u16, String, bool );

    fn routes ( capture: &Capture ) -> Router {

        let log = Setup::new().level(Level::Trace).sink(capture.clone()).build("test");

        Router::new()
            .get("/health", |_request| async { Ok(Response::text("ok")) })
            .get("/users/{id}", |request: Request| async move { Ok(Response::json(&format!("{{\"id\":\"{}\"}}", request.param("id").unwrap_or_default()))) })
            .post("/echo", |mut request: Request| async move { let body = request.text().await?; Ok(Response::text(body)) })
            .post("/form", |mut request: Request| async move { Ok(Response::text(request.posted().await?.get("name").unwrap_or_default().to_owned())) })
            .get("/fail", |_request| async { Err::<Response, Failure>(Failure::forbidden("not yours").keyed("not_owner").retry_after(7)) })
            .get("/slow", |_request| async { sleep(Duration::from_millis(400)).await; Ok(Response::text("late")) })
            .get("/query", |request: Request| async move { Ok(Response::text(request.arg("q")?.unwrap_or_default())) })
            .get("/ws", |mut request: Request| async move { upgraded(&mut request) })
            .layer(Trace::new(log))
            .layer(Timeout::after(Duration::from_millis(200)))
            .layer(Limit::bytes(16))

    }

    fn upgraded ( request: &mut Request ) -> Result<Response> {

        let ( response, upgrade ) = Socket::accept(request)?;

        drop(spawn_local(async move { echo(upgrade.ready().await).await; }));

        Ok(response)

    }

    async fn echo ( socket: Result<Socket> ) {

        let Ok(mut socket) = socket else { return; };
        let mut alive = true;

        while alive { alive = step(&mut socket).await; }

    }

    #[expect(clippy::wildcard_enum_match_arm, reason = "`Message` is non-exhaustive; anything new is ignored here")]
    async fn step ( socket: &mut Socket ) -> bool {

        let Ok(Some(message)) = socket.recv().await else { return false; };

        let answer = match message {
            Message::Text(text)                 => Message::Text(format!("echo:{text}")),
            Message::Binary(bytes)              => Message::Binary(bytes),
            Message::Close(_)                   => return false,
            _                                   => return true,
        };

        socket.send(answer).await.is_ok()

    }

    fn host ( runs: &mut Vec<Run> ) -> ( Address, Capture ) {

        let capture = Capture::json();
        let stop    = Stop::new();
        let ( tell, hear ) = channel::<Address>();
        let ( halt, log ) = ( stop.clone(), capture.clone() );

        let handle = spawn(move || Runtime::block_on(Server::bind(LOOPBACK).settings(Settings::new().drain(Duration::from_millis(500))).serve(routes(&log), halt, |local| tell.send(local.clone()).unwrap_or_default()))?);

        let local = hear.recv_timeout(Duration::from_secs(5)).unwrap_or(LOOPBACK);

        runs.push(( stop, handle ));

        ( local, capture )

    }

    fn finish ( runs: Vec<Run> ) -> bool {

        runs.into_iter().all(|( stop, handle )| { stop.raise(); handle.join().is_ok_and(|outcome| outcome.is_ok()) })

    }

    const fn kind ( path: &str ) -> &'static str {

        if path.len() == 5 { "application/x-www-form-urlencoded" } else { "text/plain" }

    }

    async fn exchange ( base: &str ) -> Result<Vec<Seen>> {

        let client = Client::new().timeout(Duration::from_secs(5));
        let mut seen = Vec::new();

        for ( method, path, body ) in [( "GET", "/health", "" ), ( "GET", "/users/42", "" ), ( "POST", "/echo", "hello" ), ( "POST", "/form", "name=Ada+L&x=1" ), ( "GET", "/fail", "" ), ( "GET", "/missing", "" ), ( "DELETE", "/health", "" ), ( "GET", "/slow", "" ), ( "POST", "/echo", "this body is longer than sixteen bytes" ), ( "GET", "/query?q=a%20b", "" ), ( "HEAD", "/health", "" )] {

            let request = match method {
                "POST" => Request::post(&format!("{base}{path}"), body, kind(path))?,
                other  => Request::build(other.parse().map_err(|_error| Failure::internal("method"))?, &format!("{base}{path}"))?,
            };

            let mut response = client.send(request).await?;
            let tagged = response.head(HeaderName::from_static("x-request-id")).is_some();
            let text = response.text_body(1 << 16).await?;

            seen.push(( response.code(), text, tagged ));

        }

        Ok(seen)

    }

    #[test]
    fn a_server_routes_fails_limits_and_times_out_as_promised () {

        let mut runs = Vec::new();
        let ( local, capture ) = host(&mut runs);
        let base = format!("http://{local}");

        let seen  = Runtime::block_on(exchange(&base)).ok().and_then(Result::ok).unwrap_or_default();
        let lines = capture.contents();
        let codes: Vec<u16> = seen.iter().map(|( code, _, _ )| *code).collect();
        let exact: Vec<( usize, &str )> = seen.iter().enumerate().filter(|( index, _ )| ![7, 8].contains(index)).map(|( index, ( _, text, _ ) )| ( index, text.as_str() )).collect();

        assert!(finish(runs));
        assert_eq!(codes, [200, 200, 200, 200, 403, 404, 405, 504, 413, 200, 200]);
        assert_eq!(exact, [
            ( 0, "ok" ),
            ( 1, "{\"id\":\"42\"}" ),
            ( 2, "hello" ),
            ( 3, "Ada L" ),
            ( 4, "{\"code\":\"forbidden\",\"key\":\"not_owner\",\"message\":\"not yours\",\"retry_after\":7}" ),
            ( 5, "{\"code\":\"not_found\",\"key\":\"no_route\",\"message\":\"/missing: no such route\"}" ),
            ( 6, "{\"code\":\"method\",\"key\":\"method_not_allowed\",\"message\":\"the method is not allowed on this path\"}" ),
            ( 9, "a b" ),
            ( 10, "" ),
        ]);
        assert!(seen.get(7).is_some_and(|( _, text, _ )| text.contains("request_timeout")));
        assert!(seen.get(8).is_some_and(|( _, text, _ )| text.contains("body_too_large")));
        assert!(seen.iter().all(|( _, _, tagged )| *tagged));
        assert_eq!(lines.matches("\"message\":\"request\"").count(), 11);
        assert!(lines.contains("\"path\":\"/fail\",\"status\":403"));
        assert!(lines.contains("\"level\":\"warn\",\"scope\":\"test\",\"message\":\"not yours\""));

    }

    async fn over_h2 ( base: &str ) -> Result<( u16, String, bool )> {

        let client = Client::new().protocol(Protocol::Http2).timeout(Duration::from_secs(5));
        let mut response = client.get(&format!("{base}/users/h2")).await?;
        let version = response.inner().version() == http::Version::HTTP_2;
        let text = response.text_body(1024).await?;

        Ok(( response.code(), text, version ))

    }

    #[test]
    fn http2_cleartext_is_served_by_prior_knowledge () {

        let mut runs = Vec::new();
        let ( local, _ ) = host(&mut runs);
        let seen = Runtime::block_on(over_h2(&format!("http://{local}"))).ok().and_then(Result::ok);

        assert!(finish(runs));
        assert_eq!(seen, Some(( 200, "{\"id\":\"h2\"}".to_owned(), true )));

    }

    fn masked ( opcode: u8, payload: &[u8] ) -> Vec<u8> {

        let key = [0x37, 0xfa, 0x21, 0x3d];
        let mut frame = vec![0x80 | opcode];

        match payload.len() {
            0..=125 => frame.push(0x80 | u8::try_from(payload.len()).unwrap_or(125)),
            len     => { frame.push(0x80 | 0x7E); frame.extend_from_slice(&u16::try_from(len).unwrap_or(u16::MAX).to_be_bytes()); }
        }

        frame.extend_from_slice(&key);
        frame.extend(payload.iter().enumerate().map(|( index, byte )| byte ^ key.get(index % 4).copied().unwrap_or_default()));

        frame

    }

    async fn talk ( local: &Address ) -> Result<( String, Vec<u8>, Vec<u8>, Vec<u8> )> {

        let mut stream = Dial::connect(local, Duration::from_secs(5)).await?;
        let nonce      = Digest::base64(b"the sample nonce");
        let handshake  = format!("GET /ws HTTP/1.1\r\nHost: {local}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: {nonce}\r\n\r\n");

        stream.write_all(handshake.as_bytes()).await?;

        let mut head = vec![0u8; 512];
        let came = stream.read(&mut head).await?;
        let head = String::from_utf8_lossy(head.get(..came).unwrap_or_default()).into_owned();

        stream.write_all(&masked(0x1, b"hi")).await?;

        let mut first = vec![0u8; 64];
        let came = stream.read(&mut first).await?;
        let first = first.get(..came).unwrap_or_default().to_vec();

        let big = vec![b'x'; 300];

        stream.write_all(&masked(0x2, &big)).await?;

        let mut second = vec![0u8; 400];
        let mut got = 0;

        while got < 304 { got += stream.read(second.get_mut(got..).unwrap_or_default()).await?; }

        stream.write_all(&masked(0x8, &1000u16.to_be_bytes())).await?;

        let mut close = [0u8; 16];
        let mut came = 0;

        while came < 4 { came += stream.read(close.get_mut(came..).unwrap_or_default()).await?; }

        Ok(( head, first, second.get(..4).unwrap_or_default().to_vec(), close.get(..came).unwrap_or_default().to_vec() ))

    }

    #[test]
    fn websockets_handshake_echo_and_close () {

        let mut runs = Vec::new();
        let ( local, _ ) = host(&mut runs);
        let seen = Runtime::block_on(talk(&local)).ok().and_then(Result::ok);

        assert!(finish(runs));

        let Some(( head, first, second, close )) = seen else { return assert!(seen.is_some()); };

        assert!(head.starts_with("HTTP/1.1 101 Switching Protocols\r\n"));
        assert!(head.to_ascii_lowercase().contains("sec-websocket-accept: s3pplmbitxaq9kygzzhzrbk+xoo=\r\n"));
        assert_eq!(first, b"\x81\x07echo:hi".to_vec());
        assert_eq!(second, vec![0x82, 126, 0x01, 0x2c]);
        assert_eq!(close, vec![0x88, 0x02, 0x03, 0xe8]);

    }

    async fn spread ( uri: &str ) -> Result<HashSet<String>> {

        let client = Client::new().timeout(Duration::from_secs(5));
        let mut workers = HashSet::new();

        for _ in 0..30 {

            let response = client.get(uri).await?;

            workers.insert(response.head(REQUEST_ID).and_then(|ident| ident.split_once('-')).map(|( worker, _ )| worker.to_owned()).unwrap_or_default());

        }

        Ok(workers)

    }

    #[test]
    fn every_worker_takes_connections_on_one_port () {

        let stop = Stop::new();
        let halt = stop.clone();
        let ( tell, hear ) = channel::<Address>();

        let server = spawn(move || Server::bind(LOOPBACK).workers(3).run(|worker| Router::new().worker(worker).get("/who", |_request| async { Ok(Response::text("ok")) }), halt, |local| tell.send(local.clone()).unwrap_or_default()));
        let local  = hear.recv_timeout(Duration::from_secs(5)).unwrap_or(LOOPBACK);
        let seen   = Runtime::block_on(spread(&format!("http://{local}/who"))).ok().and_then(Result::ok).unwrap_or_default();

        stop.raise();

        assert!(server.join().is_ok_and(|outcome| outcome.is_ok()));
        assert!(seen.len() >= 2, "{seen:?}");

    }

    #[test]
    fn digests_match_the_known_vectors () {

        assert_eq!(Digest::sha1(b"abc"), [0xa9, 0x99, 0x3e, 0x36, 0x47, 0x06, 0x81, 0x6a, 0xba, 0x3e, 0x25, 0x71, 0x78, 0x50, 0xc2, 0x6c, 0x9c, 0xd0, 0xd8, 0x9d]);
        assert_eq!(Digest::sha1(b""), [0xda, 0x39, 0xa3, 0xee, 0x5e, 0x6b, 0x4b, 0x0d, 0x32, 0x55, 0xbf, 0xef, 0x95, 0x60, 0x18, 0x90, 0xaf, 0xd8, 0x07, 0x09]);
        assert_eq!(Digest::sha1(&[b'a'; 1000]).first(), Some(&0x29));
        assert_eq!(Digest::base64(b""), "");
        assert_eq!(Digest::base64(b"f"), "Zg==");
        assert_eq!(Digest::base64(b"ab"), "YWI=");
        assert_eq!(Digest::base64(b"foo"), "Zm9v");
        assert_eq!(Digest::base64(b"foobar"), "Zm9vYmFy");
        assert_eq!(Digest::base64(&Digest::sha1(b"dGhlIHNhbXBsZSBub25jZQ==258EAFA5-E914-47DA-95CA-C5AB0DC85B11")), "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=");

    }

    #[test]
    fn tokens_are_shaped_unique_and_url_safe () {

        let fresh: HashSet<String> = repeat_with(Token::fresh).take(2000).collect();

        assert_eq!(fresh.len(), 2000);
        assert!(fresh.iter().all(|token| Token::looks_like(token) && token.len() == Token::LEN));
        assert!(!Token::looks_like("short") && !Token::looks_like(&"+".repeat(27)));
        assert_eq!(Token::fingerprint("abc").len(), 8);
        assert_eq!(Token::fingerprint("abc"), Token::fingerprint("abc"));
        assert_ne!(Token::fingerprint("abc"), Token::fingerprint("abx"));

    }

    #[test]
    fn responses_and_requests_speak_the_vocabulary () {

        let response = Response::text("hi").with_status(201).header(HeaderName::from_static("x-a"), "b");

        assert_eq!(( response.code(), response.head(CONTENT_TYPE), response.head(HeaderName::from_static("x-a")) ), ( 201, Some("text/plain; charset=utf-8"), Some("b") ));
        assert_eq!(Response::redirect("/next").code(), 303);
        assert_eq!(Response::no_content().code(), 204);
        assert_eq!(Response::from(Failure::throttled("wait").retry_after(3)).head(RETRY_AFTER), Some("3"));
        assert_eq!(Response::html("<p>").head(CONTENT_TYPE), Some("text/html; charset=utf-8"));
        assert_eq!(Request::get("http://h:8080/a/b?x=1").ok().map(|request| ( request.path().to_owned(), request.query().to_owned(), request.host().map(str::to_owned), request.peer().to_string() )), Some(( "/a/b".to_owned(), "x=1".to_owned(), Some("h".to_owned()), "h:8080".to_owned() )));
        assert_eq!(Request::get("/relative").err().map(|failure| failure.key()), Some("not_uri"));
        assert_eq!(Request::get("http://h/").ok().and_then(|request| request.param("id").map(str::to_owned)), None);
        assert_eq!(Client::default().timeout(Duration::from_secs(1)), Client::new().timeout(Duration::from_secs(1)));

    }

    fn ignore ( _sender: Sender<()> ) {}

    #[test]
    fn a_stopped_server_drains_and_returns () {

        let mut runs = Vec::new();
        let ( local, _ ) = host(&mut runs);
        let started = Instant::now();
        let probe = Runtime::block_on(async { timeout(Duration::from_secs(5), Client::new().get(&format!("http://{local}/health"))).await.ok().and_then(Result::ok).map(|response| response.code()) }).ok().flatten();

        assert_eq!(probe, Some(200));
        assert!(finish(runs));
        assert!(started.elapsed() < Duration::from_secs(10));

        let ( sender, _receiver ) = channel::<()>();

        ignore(sender);
        drop(LocalSet::new());
        assert_eq!(Code::Timeout.http(), 504);

    }

}
