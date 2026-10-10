//! Scenario: the binary's foundation answers as the engine promises.

#[cfg(test)]
mod tests {
    use base::Typing;

    #[test]
    fn greets_through_the_engine() {
        assert_eq!(Typing::hello_world(), "Hello, world!");
    }
}
