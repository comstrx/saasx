//! Public-API contract of `net`: addresses, listeners with hooks, streams, dialing, resolving, workers and stop.

#[cfg(test)]
mod tests {

    use net::{Address, Bind, Dial, Listener, Peer, Protocol, Resolve, Runtime, Stop, Workers};
    use tokio::io::{AsyncReadExt as _, AsyncWriteExt as _};
    use core::net::{IpAddr, Ipv4Addr, SocketAddr};
    use error::{Code, Failure, Result};
    use core::time::Duration;
    use tokio::time::timeout;

    const LOOPBACK: Address = Address::Tcp(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 0));

    #[test]
    fn addresses_parse_and_print () {

        assert_eq!(Address::parse("127.0.0.1:8080").ok(), Some(Address::Tcp(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 8080))));
        assert_eq!(Address::parse("[::1]:443").ok().and_then(|address| address.port()), Some(443));
        assert_eq!(Address::parse("unix:/tmp/x.sock").ok(), Some(Address::Unix("/tmp/x.sock".into())));
        assert_eq!(Address::parse("api.internal:9000").ok(), Some(Address::Name("api.internal".into(), 9000)));
        assert_eq!(Address::parse("[fe80::1%eth0]:80").ok(), Some(Address::Name("fe80::1%eth0".into(), 80)));
        assert_eq!(Address::parse("nope").err().map(|failure| ( failure.code(), failure.key() )), Some(( Code::Invalid, "not_address" )));
        assert_eq!(Address::parse("host:port").err().map(|failure| failure.key()), Some("not_address"));
        assert_eq!(Address::parse(":80").err().map(|failure| failure.key()), Some("not_address"));
        assert_eq!(Address::parse("unix: ").err().map(|failure| failure.key()), Some("not_address"));
    }

    #[test]
    fn addresses_know_their_parts () {

        assert_eq!(Address::parse("10.0.0.1:1").map(|address| address.to_string()).ok(), Some("10.0.0.1:1".to_owned()));
        assert_eq!(Address::Unix("/s".into()).to_string(), "unix:/s");
        assert_eq!(Address::Name("h".into(), 1).to_string(), "h:1");
        assert_eq!(Address::Unix("/s".into()).port(), None);
        assert_eq!(LOOPBACK.host(), Some(IpAddr::V4(Ipv4Addr::LOCALHOST)));
        assert!(LOOPBACK.is_local() && Address::Name("LocalHost".into(), 1).is_local() && !Address::Name("example.com".into(), 1).is_local());
        assert_eq!(Address::from(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 5)).port(), Some(5));
        assert_eq!(Peer::new(LOOPBACK).to_string(), "127.0.0.1:0");
        assert_eq!(Protocol::default(), Protocol::Http1);
        assert!(Bind::new().reuse(true).shared() && !Bind::default().shared());

    }

    async fn echoed () -> Result<( Vec<u8>, bool, bool )> {

        let listener = Listener::bind(&LOOPBACK, Bind::new().backlog(16))?;
        let local    = listener.local().clone();
        let bound    = local.port().is_some_and(|port| port > 0);

        let server = tokio::spawn(async move {

            let ( mut stream, peer ) = listener.accept().await?;
            let mut buf = [0u8; 5];

            stream.read_exact(&mut buf).await.map_err(Failure::from)?;
            stream.write_all(&buf).await.map_err(Failure::from)?;

            Ok::<bool, Failure>(peer.host() == Some(IpAddr::V4(Ipv4Addr::LOCALHOST)) && stream.is_tcp())

        });

        let mut client = Dial::connect(&local, Duration::from_secs(5)).await?;

        client.write_all(b"hello").await.map_err(Failure::from)?;

        let mut back = vec![0u8; 5];

        client.read_exact(&mut back).await.map_err(Failure::from)?;

        let confirmed = server.await.map_err(|error| Failure::internal(error.to_string()))??;

        Ok(( back, bound, confirmed ))

    }

    #[test]
    fn a_listener_accepts_what_a_dial_connects () {

        assert_eq!(Runtime::block_on(echoed()).ok().and_then(Result::ok), Some(( b"hello".to_vec(), true, true )));

    }

    async fn refused () -> Result<( bool, bool )> {

        let listener = Listener::bind(&LOOPBACK, Bind::new())?.hook(|peer: &Peer| peer.host() != Some(IpAddr::V4(Ipv4Addr::LOCALHOST)));
        let local    = listener.local().clone();

        let dialed = Dial::connect(&local, Duration::from_secs(5)).await.is_ok();
        let waited = timeout(Duration::from_millis(300), listener.accept()).await.is_err();

        Ok(( dialed, waited ))

    }

    #[test]
    fn a_hook_refuses_a_peer_before_a_byte_is_read () {

        assert_eq!(Runtime::block_on(refused()).ok().and_then(Result::ok), Some(( true, true )));

    }

    #[test]
    fn dialing_nothing_times_out_or_is_unavailable () {

        let dead = Address::Tcp(SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 1));
        let code = Runtime::block_on(Dial::connect(&dead, Duration::from_secs(2))).ok().and_then(|outcome| outcome.err().map(|failure| failure.code()));

        assert!(matches!(code, Some(Code::Unavailable | Code::Timeout)));
        assert_eq!(Listener::bind(&Address::Name("x".into(), 1), Bind::new()).err().map(|failure| failure.code()), Some(Code::Usage));

    }

    #[test]
    fn names_resolve_to_addresses () {

        let found = Runtime::block_on(Resolve::lookup("localhost", 80)).ok().and_then(Result::ok).unwrap_or_default();

        assert!(found.iter().all(|addr| addr.port() == 80 && addr.ip().is_loopback()));
        assert_ne!(found.len(), 0);

    }

    #[test]
    fn workers_run_one_runtime_each_and_report_the_first_failure () {

        let fine = Runtime::workers(3, |index| async move { Failure::ensure(index < 3, Code::Internal, "no") });

        assert_eq!(fine.map(|workers| ( workers.len(), workers.is_empty() )).ok(), Some(( 3, false )));
        assert_eq!(Runtime::workers(2, |_index| async { Ok(()) }).and_then(Workers::join).ok(), Some(()));
        assert_eq!(Runtime::workers(2, |index| async move { Failure::ensure(index != 1, Code::Config, "bad") }).and_then(Workers::join).err().map(|failure| failure.code()), Some(Code::Config));
        assert_eq!(Runtime::block_on(async { 41 + 1 }).ok(), Some(42));
        assert!(Runtime::cores() >= 1);

    }

    async fn signaled () -> ( bool, bool, bool, bool, bool ) {

        let stop  = Stop::new();
        let other = stop.clone();

        let before = stop.raised();
        let quiet  = timeout(Duration::from_millis(50), other.wait()).await.is_err();

        stop.raise();

        let after = other.raised();
        let woke  = timeout(Duration::from_millis(50), other.wait()).await.is_ok();

        ( before, quiet, after, woke, Stop::default().raised() )

    }

    #[test]
    fn a_stop_signal_reaches_every_clone () {

        assert_eq!(Runtime::block_on(signaled()).ok(), Some(( false, true, true, true, false )));

    }

}
