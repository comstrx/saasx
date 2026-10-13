use error::Problem;

/// The checks of one input, collected; `finish` turns what failed into one failure.
#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct Form {
    pub(crate) problems: Vec<Problem>,
}

/// A text field under check; the first failed rule is kept, the rest are skipped.
#[derive(Debug)]
pub struct Text <'f, 'v> {
    pub(crate) form:   &'f mut Form,
    pub(crate) field:  &'static str,
    pub(crate) value:  &'v str,
    pub(crate) failed: bool,
}

/// A number field under check; the first failed rule is kept, the rest are skipped.
#[derive(Debug)]
pub struct Number <'f> {
    pub(crate) form:   &'f mut Form,
    pub(crate) field:  &'static str,
    pub(crate) value:  i64,
    pub(crate) failed: bool,
}

/// The failures this crate raises, the form as a whole and each field problem a client translates.
#[non_exhaustive]
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Faults;
