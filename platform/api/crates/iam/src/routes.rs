use engine::http::{Header, Message, Request, Response, Socket, Upgrade};
use engine::crypto::{Secret, Token};
use engine::error::Result;
use core::future::{Ready, ready};
use engine::validate::Form;
use engine::log::Outcome;
use engine::thread::Task;

use crate::arch::{Faults, Operator, Service};

impl Service {

    pub(crate) async fn login ( self, mut request: Request ) -> Result<Response> {

        let posted   = request.posted().await?;
        let email    = posted.get("email").unwrap_or_default();
        let password = posted.get("password").unwrap_or_default();

        let mut form = Form::new();

        form.text("email", email).required().email().max(254);
        form.text("password", password).required().max(128);
        form.finish()?;

        if !self.operator.admits(email, password) {

            self.log.audit("login").actor(email).outcome(Outcome::Denied).commit()?;

            return Err(Faults::BAD_CREDENTIALS.fail());

        }

        let session = self.store.open(email)?;

        self.log.audit("login").actor(email).outcome(Outcome::Done).field("session", &Token::fingerprint(&session.token)).commit()?;

        Ok(Response::json(&session.json()).with_status(201))

    }

    pub(crate) fn show ( self, request: Request ) -> Ready<Result<Response>> {

        let session = Self::bearer(&request).and_then(|token| self.store.find(token).ok_or_else(|| Faults::NO_SESSION.fail()));

        drop(request);

        ready(session.map(|session| Response::json(&session.json())))

    }

    pub(crate) fn logout ( self, request: Request ) -> Ready<Result<Response>> {

        let outcome = Self::bearer(&request).and_then(|token| self.closed(token));

        drop(request);

        ready(outcome)

    }

    fn bearer ( request: &Request ) -> Result<&str> {

        let token = request.head(&Header::AUTHORIZATION).and_then(|value| value.strip_prefix("Bearer ")).map(str::trim).ok_or_else(|| Faults::NO_BEARER.fail())?;

        Faults::BAD_BEARER.ensure(Token::looks_like(token))?;

        Ok(token)

    }

    fn closed ( &self, token: &str ) -> Result<Response> {

        let session = self.store.close(token).ok_or_else(|| Faults::NO_SESSION.fail())?;

        self.log.audit("logout").actor(&session.email).outcome(Outcome::Done).commit()?;

        Ok(Response::no_content())

    }

    pub(crate) fn echo ( mut request: Request ) -> Ready<Result<Response>> {

        ready(Socket::accept(&mut request).map(|( response, upgrade )| { drop(Task::spawn(Self::pump(upgrade))); response }))

    }

    async fn pump ( upgrade: Upgrade ) {

        let Ok(mut socket) = upgrade.ready().await else { return; };
        let mut alive = true;

        while alive { alive = Self::bounce(&mut socket).await; }

    }

    #[expect(clippy::wildcard_enum_match_arm, reason = "`Message` is non-exhaustive; control frames and anything new are not echoed")]
    async fn bounce ( socket: &mut Socket ) -> bool {

        let Ok(Some(message)) = socket.recv().await else { return false; };

        let answer = match message {
            Message::Text(text)    => Message::Text(text),
            Message::Binary(bytes) => Message::Binary(bytes),
            _                      => return !socket.is_closed(),
        };

        socket.send(answer).await.is_ok()

    }

}

impl Operator {

    fn admits ( &self, email: &str, password: &str ) -> bool {

        let person = email.eq_ignore_ascii_case(&self.email);
        let secret = Secret::equal(password.as_bytes(), self.password.as_bytes());

        person && secret

    }

}
