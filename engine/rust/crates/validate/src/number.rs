use error::{Detail, Problem};

use crate::Number;

impl Number<'_> {

    /// At least `floor`.
    #[inline]
    pub fn at_least ( &mut self, floor: i64 ) -> &mut Self {

        self.rule(self.value >= floor, "too_small", format!("must be at least {floor}"))

    }

    /// At most `ceiling`.
    #[inline]
    pub fn at_most ( &mut self, ceiling: i64 ) -> &mut Self {

        self.rule(self.value <= ceiling, "too_large", format!("must be at most {ceiling}"))

    }

    /// Within `floor..=ceiling`.
    #[inline]
    pub fn between ( &mut self, floor: i64, ceiling: i64 ) -> &mut Self {

        self.rule((floor..=ceiling).contains(&self.value), "out_of_range", format!("must be between {floor} and {ceiling}"))

    }

    /// Strictly above zero.
    #[inline]
    pub fn positive ( &mut self ) -> &mut Self {

        self.rule(self.value > 0, "not_positive", "must be positive")

    }

    /// Passes the caller's own test, else fails with this key and detail.
    #[inline]
    pub fn satisfies ( &mut self, test: impl FnOnce(i64) -> bool, key: &'static str, detail: impl Into<Detail> ) -> &mut Self {

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

}
