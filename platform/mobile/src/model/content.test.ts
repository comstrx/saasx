import { clausesOf } from "@/model/content";

describe("a published page reads as clauses", () => {

    test("a short opening sentence becomes the clause's heading and numbering drops", () => {

        expect(clausesOf("1. The booking. A booking is confirmed once paid.\n\n2. Prices. Shown in your currency.")).toEqual([
            { key: "clause-0", lead: "The booking", text: "A booking is confirmed once paid." },
            { key: "clause-1", lead: "Prices", text: "Shown in your currency." },
        ]);

    });

    test("Arabic leads and Arabic-Indic numbering read the same way", () => {

        expect(clausesOf("١. الحجز. يُؤكَّد الحجز بمجرد الدفع.\n\nما نجمعه. اسمك وبياناتك.")).toEqual([
            { key: "clause-0", lead: "الحجز", text: "يُؤكَّد الحجز بمجرد الدفع." },
            { key: "clause-1", lead: "ما نجمعه", text: "اسمك وبياناتك." },
        ]);

    });

    test("a paragraph that opens with a full sentence keeps its words as they are", () => {

        expect(clausesOf("We are a travel desk built for the Kingdom: visas, stays and tours.\n\nEvery listing on this platform is operated by a verified partner. We hold it.")).toEqual([
            { key: "clause-0", lead: "", text: "We are a travel desk built for the Kingdom: visas, stays and tours." },
            { key: "clause-1", lead: "", text: "Every listing on this platform is operated by a verified partner. We hold it." },
        ]);

    });

});
