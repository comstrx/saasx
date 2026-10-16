use std::collections::HashMap;
use std::time::SystemTime;
use engine::net::Address;
use std::sync::Mutex;
use alloc::sync::Arc;
use engine::log::Log;

pub(crate) type Sessions = HashMap<Box<str>, Session>;

pub(crate) struct Faults;

pub(crate) struct Iam {
    pub(crate) address: Address,
    pub(crate) workers: usize,
    pub(crate) service: Service,
}

pub(crate) struct Operator {
    pub(crate) email:    Box<str>,
    pub(crate) password: Box<str>,
}

pub(crate) struct Store {
    pub(crate) sessions: Mutex<Sessions>,
    pub(crate) limit:    usize,
}

#[derive(Clone)]
pub(crate) struct Session {
    pub(crate) token: Box<str>,
    pub(crate) email: Box<str>,
    pub(crate) since: SystemTime,
}

#[derive(Clone)]
pub(crate) struct Service {
    pub(crate) log:      Log,
    pub(crate) store:    Arc<Store>,
    pub(crate) operator: Arc<Operator>,
}
