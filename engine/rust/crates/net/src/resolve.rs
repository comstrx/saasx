use error::{Code, Failure, Result};
use tokio::net::lookup_host;
use core::net::SocketAddr;

use crate::Resolve;

impl Resolve {

    /// Every address `host` resolves to, with `port`, `IPv4` before `IPv6`.
    ///
    /// # Errors
    /// `Unavailable` keyed `no_address` when nothing resolves.
    #[inline]
    pub async fn lookup ( host: &str, port: u16 ) -> Result<Vec<SocketAddr>> {

        let found = lookup_host(( host, port )).await.map_err(|error| Failure::from(error).coded(Code::Unavailable).keyed("no_address").context(format!("resolving {host}")))?;
        let mut addrs: Vec<SocketAddr> = found.collect();

        addrs.sort_by_key(SocketAddr::is_ipv6);

        if addrs.is_empty() { return Err(Failure::unavailable("the name resolved to nothing").keyed("no_address").context(host.to_owned())); }

        Ok(addrs)

    }

}
