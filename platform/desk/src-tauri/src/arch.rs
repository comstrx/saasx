use serde::Serialize;
use engine::log::Log;

pub(crate) struct Desk {
    pub(crate) log: Log,
}

pub(crate) struct Faults;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub(crate) struct Info {
    pub(crate) platform: &'static str,
    pub(crate) arch:     &'static str,
    pub(crate) version:  String,
    pub(crate) name:     String,
}
