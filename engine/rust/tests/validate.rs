//! Public-API contract of `validate`: forms collect every failed field into one keyed failure.

#[cfg(test)]
mod tests {

    use error::{Code, Problem};
    use validate::Form;

    #[test]
    fn a_clean_form_finishes_with_nothing () {

        let mut form = Form::new();

        form.text("email", "a@b.co").required().email().max(255);
        form.number("age", 30).between(18, 120).positive();
        form.check("terms", true, "must_accept", "accept the terms");

        assert!(form.is_clean());
        assert_eq!(form.finish().ok(), Some(()));

    }

    #[test]
    fn every_failed_field_is_collected_once () {

        let mut form = Form::new();

        form.text("email", "nope").required().email().max(2);
        form.text("name", "  ").required().min(2);
        form.number("age", 7).at_least(18).at_most(5);
        form.check("terms", false, "must_accept", "accept the terms");

        let failure = form.finish().err().map(|failure| ( failure.code(), failure.key(), failure.problems().iter().map(|problem| ( problem.field().to_owned(), problem.key() )).collect::<Vec<_>>() ));

        assert_eq!(failure, Some(( Code::Invalid, "invalid_fields", vec![( "email".to_owned(), "not_email" ), ( "name".to_owned(), "required" ), ( "age".to_owned(), "too_small" ), ( "terms".to_owned(), "must_accept" )] )));

    }

    #[test]
    fn text_rules_have_sharp_edges () {

        let mut form = Form::new();

        assert!(form.text("a", "\u{e9}\u{e9}").min(2).ok());
        assert!(!form.text("b", "\u{e9}\u{e9}\u{e9}").max(2).ok());
        assert!(form.text("c", "a@b.c").email().ok());
        assert!(!form.text("d", "a@b").email().ok());
        assert!(!form.text("e", "@b.c").email().ok());
        assert!(!form.text("f", "a@.c").email().ok());
        assert!(!form.text("g", "a b@c.d").email().ok());
        assert!(!form.text("h", "a@b@c.d").email().ok());
        assert_eq!(form.problems().len(), 6);

    }

    #[test]
    fn more_text_rules_have_sharp_edges () {

        let mut form = Form::new();

        assert!(form.text("i", "ok-slug_1").slug().ok());
        assert!(!form.text("j", "no slug").slug().ok());
        assert!(!form.text("k", "").slug().ok());
        assert!(form.text("l", "~tilde").ascii().ok());
        assert!(!form.text("m", "tab\t").ascii().ok());
        assert!(form.text("n", "b").one_of(&["a", "b"]).ok());
        assert!(!form.text("o", "c").one_of(&["a", "b"]).ok());
        assert!(!form.text("p", "x").satisfies(|value| value.len() > 3, "custom", "too short for me").ok());
        assert_eq!(form.problems().len(), 5);

    }

    #[test]
    fn number_rules_have_sharp_edges () {

        let mut form = Form::new();

        assert!(form.number("a", 18).at_least(18).ok());
        assert!(!form.number("b", 17).at_least(18).ok());
        assert!(form.number("c", 5).at_most(5).ok());
        assert!(!form.number("d", 6).at_most(5).ok());
        assert!(!form.number("e", 0).positive().ok());
        assert!(!form.number("f", 121).between(18, 120).ok());
        assert!(form.number("g", 4).satisfies(|value| value % 2 == 0, "odd", "must be even").ok());
        assert_eq!(form.problems().iter().map(Problem::key).collect::<Vec<_>>(), ["too_small", "too_large", "not_positive", "out_of_range"]);
        assert!(form.problems().iter().all(|problem| !problem.detail().is_empty()));

    }

    #[test]
    fn the_wire_body_lists_every_field () {

        let mut form = Form::new();

        form.text("email", "").required();
        form.number("age", 1).at_least(2);

        assert_eq!(form.finish().err().map(|failure| failure.wire().to_string()), Some("{\"code\":\"invalid\",\"key\":\"invalid_fields\",\"message\":\"some fields are invalid\",\"fields\":{\"email\":{\"key\":\"required\",\"message\":\"is required\"},\"age\":{\"key\":\"too_small\",\"message\":\"must be at least 2\"}}}".to_owned()));
        assert_eq!(Form::default(), Form::new());

    }

}
