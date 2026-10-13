use engine::process::Args;
use engine::log::Log;

pub(crate) struct Infra {
    pub(crate) args: Args,
    pub(crate) log:  Log,
}
