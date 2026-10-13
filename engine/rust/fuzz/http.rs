//! Digests are total and shaped right, and any text is a request URI or a keyed failure.

#![no_main]
#![expect(clippy::disallowed_methods, reason = "the libFuzzer entry macro expands to `expect`")]

use libfuzzer_sys::fuzz_target;
use http::{Digest, Request};
use core::hint::black_box;

fuzz_target!(|data: &[u8]| {

    let hash = Digest::sha1(data);
    let text = Digest::base64(data);

    assert_eq!(hash, Digest::sha1(data));
    assert_eq!(text.len(), data.len().div_ceil(3) * 4);
    assert!(text.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'+' || byte == b'/' || byte == b'='));
    assert_eq!(Digest::base64(&hash).len(), 28);

    let uri = String::from_utf8_lossy(data);

    match Request::get(&uri) {
        Ok(request)  => { black_box(( request.path().len(), request.query().len(), request.host().map(str::len), request.peer().to_string() )); }
        Err(failure) => assert_eq!(failure.key(), "not_uri"),
    }

});
