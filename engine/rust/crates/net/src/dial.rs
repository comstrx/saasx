use error::{Failure, Result};
use core::net::SocketAddr;
use tokio::net::TcpStream;
use core::time::Duration;
use tokio::time::timeout;

#[cfg(not(unix))]
use core::future::{Ready, ready};

use crate::{Address, Dial, Resolve, Stream, Tcp};

impl Dial {

    /// Connects within `deadline`; a name is resolved and each address tried in turn.
    ///
    /// # Errors
    /// `Timeout`, `Unavailable`, or the resolver's failure.
    #[inline]
    pub async fn connect ( address: &Address, deadline: Duration ) -> Result<Stream> {

        match address {
            Address::Tcp(addr)       => Self::tcp(*addr, deadline).await,
            Address::Unix(path)      => Self::unix(path, deadline).await,
            Address::Name(host, port) => Self::named(host, *port, deadline).await,
        }

    }

    async fn tcp ( addr: SocketAddr, deadline: Duration ) -> Result<Stream> {

        let connected = timeout(deadline, TcpStream::connect(addr)).await.map_err(|_elapsed| Failure::timeout("connecting took too long").context(addr.to_string()))?;
        let stream    = connected.map_err(|error| Failure::from(error).context(format!("connecting to {addr}")))?;

        Tcp::tune(&stream);

        Ok(Stream::Tcp(stream))

    }

    async fn named ( host: &str, port: u16, deadline: Duration ) -> Result<Stream> {

        let mut last = Failure::unavailable("the name resolved to nothing").keyed("no_address").context(format!("{host}:{port}"));

        for addr in Resolve::lookup(host, port).await? {

            match Self::tcp(addr, deadline).await {
                Ok(stream)   => return Ok(stream),
                Err(failure) => last = failure,
            }

        }

        Err(last)

    }

    #[cfg(unix)]
    async fn unix ( path: &str, deadline: Duration ) -> Result<Stream> {

        use tokio::net::UnixStream;

        let connected = timeout(deadline, UnixStream::connect(path)).await.map_err(|_elapsed| Failure::timeout("connecting took too long").context(format!("unix:{path}")))?;

        connected.map(Stream::Unix).map_err(|error| Failure::from(error).context(format!("connecting to unix:{path}")))

    }

    #[cfg(not(unix))]
    fn unix ( _path: &str, _deadline: Duration ) -> Ready<Result<Stream>> {

        ready(Err(Failure::unsupported("unix sockets are not available on this platform").keyed("no_unix_socket")))

    }

}
