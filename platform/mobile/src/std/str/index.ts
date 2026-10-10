const arabicDigits = /[٠-٩۰-۹]/g;
const arabicMarks = /[ً-ٰٟـ]/g;
const latinMarks = /[̀-ͯ]/g;
const spaces = /\s+/g;
const arabicScript = /\p{Script=Arabic}/u;

const arabicLetters: Record<string, string> = {
    "أ": "ا",
    "إ": "ا",
    "آ": "ا",
    "ٱ": "ا",
    "ى": "ي",
    "ة": "ه",
    "ؤ": "و",
    "ئ": "ي",
};

class Str {

    digits ( value: string ): string {

        return value.replace(arabicDigits, ( char ) => String((char.codePointAt(0) ?? 0) & 0xf));

    }
    fold ( value: string ): string {

        return this.digits(value)
            .normalize("NFKD")
            .replace(latinMarks, "")
            .replace(arabicMarks, "")
            .replace(/[آ-ٱ]/g, ( char ) => arabicLetters[char] ?? char)
            .toLowerCase()
            .replace(spaces, " ")
            .trim();

    }
    listed ( parts: readonly ( string | null | undefined )[] ): string {

        const kept = parts.filter(( part ): part is string => Boolean(part?.trim()) );
        const body = kept.join("");

        return kept.join(arabicScript.test(body) ? "، " : ", ");

    }
    first ( value?: string | null ): string {

        return value?.trim().split(spaces)[0] ?? "";

    }
    matches ( value: string, query: string ): boolean {

        const needle = this.fold(query);

        return needle.length === 0 || this.fold(value).includes(needle);

    }
    numeric ( value: string ): boolean {

        return /^\+?[\d\s-]+$/.test(this.digits(value).trim());

    }
    mask ( value: string, keep = 3 ): string {

        if ( value.length <= keep ) return value;

        return value.slice(0, keep) + "*".repeat(value.length - keep);

    }

}

export const str = new Str();
