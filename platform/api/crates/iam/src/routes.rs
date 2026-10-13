use engine::http::{Message, Request, Response, Socket, Token, Upgrade};
use engine::error::{Code, Failure, Result};
use engine::http::header::AUTHORIZATION;
use core::future::{Ready, ready};
use engine::validate::Form;
use engine::log::Outcome;
use engine::net::Runtime;

use crate::arch::Service;

impl Service {

    pub(crate) async fn login ( self, mut request: Request ) -> Result<Response> {

        let posted   = request.posted().await?;
        let email    = posted.get("email").unwrap_or_default();
        let password = posted.get("password").unwrap_or_default();

        let mut form = Form::new();

        form.text("email", email).required().email().max(254);
        form.text("password", password).required().min(8).max(128);
        form.finish()?;

        if password != &*self.password {

            self.log.audit("login").actor(email).outcome(Outcome::Denied).commit()?;

            return Err(Failure::unauthenticated("the password is wrong").keyed("bad_password"));

        }

        let session = self.store.open(email)?;

        self.log.audit("login").actor(email).outcome(Outcome::Done).field("session", &Token::fingerprint(&session.token)).commit()?;

        Ok(Response::json(&session.json()).with_status(201))

    }

    pub(crate) fn show ( self, request: Request ) -> Ready<Result<Response>> {

        let session = Self::bearer(&request).and_then(|token| self.store.find(token).ok_or_else(|| Failure::not_found("no such session").keyed("no_session")));

        drop(request);

        ready(session.map(|session| Response::json(&session.json())))

    }

    pub(crate) fn logout ( self, request: Request ) -> Ready<Result<Response>> {

        let outcome = Self::bearer(&request).and_then(|token| self.closed(token));

        drop(request);

        ready(outcome)

    }

    fn bearer ( request: &Request ) -> Result<&str> {

        let token = request.head(AUTHORIZATION).and_then(|value| value.strip_prefix("Bearer ")).map(str::trim).ok_or_else(|| Failure::unauthenticated("a bearer token is required").keyed("no_bearer"))?;

        Failure::ensure(Token::looks_like(token), Code::Unauthenticated, "the bearer token is malformed").map_err(|failure| failure.keyed("bad_bearer"))?;

        Ok(token)

    }

    fn closed ( &self, token: &str ) -> Result<Response> {

        let session = self.store.close(token).ok_or_else(|| Failure::not_found("no such session").keyed("no_session"))?;

        self.log.audit("logout").actor(&session.email).outcome(Outcome::Done).commit()?;

        Ok(Response::no_content())

    }

    pub(crate) fn echo ( mut request: Request ) -> Ready<Result<Response>> {

        ready(Socket::accept(&mut request).map(|( response, upgrade )| { Runtime::spawn(Self::pump(upgrade)); response }))

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
