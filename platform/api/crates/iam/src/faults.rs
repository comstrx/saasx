use engine::error::{Code, Fault};

use crate::arch::Faults;

impl Faults {

    pub(crate) const BAD_CREDENTIALS: Fault = Fault::new("bad_credentials", Code::Unauthenticated, "the email or the password is wrong");
    pub(crate) const NO_BEARER: Fault       = Fault::new("no_bearer", Code::Unauthenticated, "a bearer token is required");
    pub(crate) const BAD_BEARER: Fault      = Fault::new("bad_bearer", Code::Unauthenticated, "the bearer token is malformed");
    pub(crate) const NO_SESSION: Fault      = Fault::new("no_session", Code::NotFound, "no such session");
    pub(crate) const SESSIONS_FULL: Fault   = Fault::new("sessions_full", Code::Exhausted, "no room for another session");

}
