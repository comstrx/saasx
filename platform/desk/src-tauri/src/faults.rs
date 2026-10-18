use engine::error::{Code, Fault};

use crate::arch::Faults;

impl Faults {

    pub(crate) const HOST_FAILED: Fault = Fault::new("host_failed", Code::Internal, "the window could not be opened");

}
