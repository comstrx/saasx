use error::{Detail, Fault, Faults as ErrorFaults, Problem};

use crate::{Faults, Number};

impl Number<'_> {

    /// At least `floor`.
    #[inline]
    pub fn at_least ( &mut self, floor: i64 ) -> &mut Self {

        self.say(self.value >= floor, Faults::TOO_SMALL, format!("must be at least {floor}"))

    }

    /// At most `ceiling`.
    #[inline]
    pub fn at_most ( &mut self, ceiling: i64 ) -> &mut Self {

        self.say(self.value <= ceiling, Faults::TOO_LARGE, format!("must be at most {ceiling}"))

    }

    /// Within `floor..=ceiling`.
    #[inline]
    pub fn between ( &mut self, floor: i64, ceiling: i64 ) -> &mut Self {

        self.say((floor..=ceiling).contains(&self.value), ErrorFaults::OUT_OF_RANGE, format!("must be between {floor} and {ceiling}"))

    }

    /// Strictly above zero.
    #[inline]
    pub fn positive ( &mut self ) -> &mut Self {

        self.rule(self.value > 0, Faults::NOT_POSITIVE)

    }

    /// Passes the caller's own test, else fails with the caller's own declared fault.
    #[inline]
    pub fn satisfies ( &mut self, test: impl FnOnce(i64) -> bool, fault: Fault ) -> &mut Self {

        let holds = test(self.value);

        self.rule(holds, fault)

    }

    /// Whether every rule so far held.
    #[inline]
    #[must_use]
    pub const fn ok ( &self ) -> bool {

        !self.failed

    }

    fn rule ( &mut self, holds: bool, fault: Fault ) -> &mut Self {

        self.say(holds, fault, fault.detail())

    }

    fn say ( &mut self, holds: bool, fault: Fault, detail: impl Into<Detail> ) -> &mut Self {

        if self.failed || holds { return self; }

        self.failed = true;
        self.form.problems.push(Problem::new(self.field, fault, detail));

        self

    }

}
