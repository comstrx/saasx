use engine::error::Result;
use std::time::{SystemTime, UNIX_EPOCH};
use std::sync::{Mutex, PoisonError};
use std::collections::HashMap;
use core::fmt::Write as _;
use engine::crypto::Token;
use engine::log::Json;

use crate::arch::{Faults, Session, Store};

impl Store {

    pub(crate) fn new ( limit: usize ) -> Self {

        Self { sessions: Mutex::new(HashMap::new()), limit }

    }

    pub(crate) fn open ( &self, email: &str ) -> Result<Session> {

        let token: Box<str> = Token::fresh()?.into();
        let session = Session { token: token.clone(), email: email.into(), since: SystemTime::now() };

        self.insert(token, session.clone())?;

        Ok(session)

    }

    pub(crate) fn find ( &self, token: &str ) -> Option<Session> {

        self.sessions.lock().unwrap_or_else(PoisonError::into_inner).get(token).cloned()

    }

    pub(crate) fn close ( &self, token: &str ) -> Option<Session> {

        self.sessions.lock().unwrap_or_else(PoisonError::into_inner).remove(token)

    }

    pub(crate) fn len ( &self ) -> usize {

        self.sessions.lock().unwrap_or_else(PoisonError::into_inner).len()

    }

    fn insert ( &self, token: Box<str>, session: Session ) -> Result<()> {

        let mut sessions = self.sessions.lock().unwrap_or_else(PoisonError::into_inner);
        let room = sessions.len() < self.limit;
        let kept = room.then(|| sessions.insert(token, session));

        drop(sessions);

        Faults::SESSIONS_FULL.ensure(kept.is_some())

    }

}

impl Session {

    pub(crate) fn json ( &self ) -> String {

        let since = self.since.duration_since(UNIX_EPOCH).unwrap_or_default().as_secs();
        let mut out = String::with_capacity(96);

        out.push_str("{\"token\":");
        Json::string(&mut out, &self.token).unwrap_or_default();
        out.push_str(",\"email\":");
        Json::string(&mut out, &self.email).unwrap_or_default();
        write!(out, ",\"since\":{since}}}").unwrap_or_default();

        out

    }

}
