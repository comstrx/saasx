use engine::error::{Code, Fault};

use crate::arch::Faults;

impl Faults {

    pub(crate) const NO_COMMAND: Fault       = Fault::new("no_command", Code::Usage, "a command is required");
    pub(crate) const NO_NAME: Fault          = Fault::new("no_name", Code::Usage, "at least one NAME is required");
    pub(crate) const NO_PROGRAM: Fault       = Fault::new("no_program", Code::Usage, "a program is required");
    pub(crate) const COMMAND_SIGNALED: Fault = Fault::new("command_signaled", Code::Internal, "the program was ended by a signal");

}
