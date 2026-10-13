use core::sync::atomic::{AtomicU64, Ordering::Relaxed};
use std::time::{SystemTime, UNIX_EPOCH};
use core::hash::BuildHasher as _;
use memory::{Space as _, Stack};
use std::hash::RandomState;
use core::fmt::Write as _;
use std::io::Read as _;
use std::fs::File;

use crate::{Digest, Token};

static SERIAL: AtomicU64 = AtomicU64::new(0);

impl Token {

    /// How many characters a token has.
    pub const LEN: usize = 27;

    /// A fresh token: twenty-seven URL-safe characters carrying 160 bits straight from the
    /// operating system's entropy where a device offers it, else a SHA-1 over two OS-seeded hashes,
    /// a process-wide serial and the clock; unguessable to a peer, distinct across calls.
    #[inline]
    #[must_use]
    pub fn fresh () -> String {

        let mut raw = [0u8; 20];

        if !Self::entropy(&mut raw) { raw = Self::derived(); }

        Digest::base64(&raw).replace('+', "-").replace('/', "_").trim_end_matches('=').to_owned()

    }

    /// A short, non-reversible fingerprint of a token, for logs and audits.
    #[inline]
    #[must_use]
    pub fn fingerprint ( token: &str ) -> String {

        Digest::base64(&Digest::sha1(token.as_bytes())).get(..8).unwrap_or_default().replace('+', "-").replace('/', "_")

    }

    fn entropy ( raw: &mut [u8; 20] ) -> bool {

        cfg!(unix) && File::open("/dev/urandom").and_then(|mut device| device.read_exact(raw)).is_ok()

    }

    fn derived () -> [u8; 20] {

        let serial = SERIAL.fetch_add(1, Relaxed);
        let nanos  = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos();
        let salt   = ( RandomState::new().hash_one(serial), RandomState::new().hash_one(nanos) );

        let mut seed = Stack::<96>::new();

        write!(seed, "{serial}:{nanos}:{}:{}", salt.0, salt.1).unwrap_or_default();

        Digest::sha1(seed.as_bytes())

    }

    /// Whether `text` has the shape of a token: the length and the alphabet.
    #[inline]
    #[must_use]
    pub fn looks_like ( text: &str ) -> bool {

        text.len() == Self::LEN && text.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_')

    }

}
