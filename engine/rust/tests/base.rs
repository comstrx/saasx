//! Public-API contract of `base`, linked the way a consumer links.

#[cfg(test)]
mod tests {
    use base::prelude::*;

    #[test]
    fn hello_world_returns_the_canonical_greeting() {
        assert_eq!(Typing::hello_world(), "Hello, world!");
    }

    #[test]
    fn hello_world_is_stable_across_calls() {
        assert_eq!(Typing::hello_world().as_ptr(), Typing::hello_world().as_ptr());
    }

    #[test]
    fn prelude_exposes_the_namespace_type() {
        assert_eq!(Typing::default(), Typing::default());
    }
}
