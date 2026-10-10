//! Scenario: a service consumes the foundation and nothing else.

#[cfg(test)]
mod tests {
    use base::prelude::*;

    #[test]
    fn hello_service_greets_through_the_foundation() {
        assert_eq!(Typing::hello_world(), "Hello, world!");
    }
}
