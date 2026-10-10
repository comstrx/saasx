/// Zero-sized namespace for the type utilities: one stable path, no state.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
#[non_exhaustive]
pub struct Typing;

impl Typing {
    /// The greeting [`Typing::hello_world`] returns, usable in `const` position.
    pub const GREETING: &str = "Hello, world!";

    /// Returns [`Typing::GREETING`]; no allocation, no work at run time.
    ///
    /// ```
    /// use base::Typing;
    ///
    /// assert_eq!(Typing::hello_world(), "Hello, world!");
    /// ```
    #[inline]
    #[must_use]
    pub const fn hello_world() -> &'static str {
        Self::GREETING
    }
}
