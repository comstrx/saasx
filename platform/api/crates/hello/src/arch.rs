use engine::net::Address;
use engine::log::Log;

pub(crate) struct Hello {
    pub(crate) address: Address,
    pub(crate) workers: usize,
    pub(crate) log:     Log,
}
