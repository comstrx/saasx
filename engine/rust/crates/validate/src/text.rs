use error::{Detail, Problem};

use crate::Text;

impl Text<'_, '_> {

    /// Not empty once trimmed.
    #[inline]
    pub fn required ( &mut self ) -> &mut Self {

        self.rule(!self.value.trim().is_empty(), "required", "is required")

    }

    /// At least `count` characters.
    #[inline]
    pub fn min ( &mut self, count: usize ) -> &mut Self {

        self.rule(self.value.chars().count() >= count, "too_short", format!("needs at least {count} characters"))

    }

    /// At most `count` characters.
    #[inline]
    pub fn max ( &mut self, count: usize ) -> &mut Self {

        self.rule(self.value.chars().count() <= count, "too_long", format!("allows at most {count} characters"))

    }

    /// Shaped like an address: one `@`, something on each side, a dot in the domain, no spaces.
    #[inline]
    pub fn email ( &mut self ) -> &mut Self {

        self.rule(Self::looks_like_email(self.value), "not_email", "is not an email address")

    }

    /// Printable ASCII only.
    #[inline]
    pub fn ascii ( &mut self ) -> &mut Self {

        self.rule(self.value.bytes().all(|byte| (b' '..=b'~').contains(&byte)), "not_ascii", "allows only printable ASCII")

    }

    /// Letters, digits, `_` and `-` only, like a handle.
    #[inline]
    pub fn slug ( &mut self ) -> &mut Self {

        self.rule(!self.value.is_empty() && self.value.bytes().all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-'), "not_slug", "allows only letters, digits, _ and -")

    }

    /// One of the allowed values, exactly.
    #[inline]
    pub fn one_of ( &mut self, allowed: &[&str] ) -> &mut Self {

        self.rule(allowed.contains(&self.value), "not_allowed", "is not one of the allowed values")

    }

    /// Passes the caller's own test, else fails with this key and detail.
    #[inline]
    pub fn satisfies ( &mut self, test: impl FnOnce(&str) -> bool, key: &'static str, detail: impl Into<Detail> ) -> &mut Self {

        let holds = test(self.value);

        self.rule(holds, key, detail)

    }

    /// Whether every rule so far held.
    #[inline]
    #[must_use]
    pub const fn ok ( &self ) -> bool {

        !self.failed

    }

    fn rule ( &mut self, holds: bool, key: &'static str, detail: impl Into<Detail> ) -> &mut Self {

        if self.failed || holds { return self; }

        self.failed = true;
        self.form.problems.push(Problem::new(self.field, key, detail));

        self

    }

    fn looks_like_email ( value: &str ) -> bool {

        let Some(( local, domain )) = value.split_once('@') else { return false; };

        !local.is_empty()
            && domain.contains('.')
            && !domain.starts_with('.')
            && !domain.ends_with('.')
            && !domain.contains('@')
            && value.bytes().all(|byte| byte > b' ' && byte != 0x7f)

    }

}
