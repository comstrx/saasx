/// Zero-sized namespace for the type utilities.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[non_exhaustive]
pub struct Typing;

impl Typing {

    /// The greeting [`Typing::hello_world`] returns.
    pub const GREETING: &str = "Hello, world!";

    /// Returns [`Typing::GREETING`] without allocating.
    #[inline]
    #[must_use]
    pub const fn hello_world () -> &'static str {

        Self::GREETING

    }

}
