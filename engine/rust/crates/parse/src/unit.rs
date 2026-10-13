use error::{Failure, Result};
use core::time::Duration;

use crate::Parse;

impl Parse {

    /// Bytes from a size with an optional binary unit: `512`, `64k`, `10mb`, `2 GiB`.
    ///
    /// # Errors
    /// `not_size`.
    #[inline]
    pub fn size ( text: &str ) -> Result<u64> {

        let ( number, unit ) = Self::split(text);

        let scale: u64 = match unit.to_ascii_lowercase().as_str() {
            "" | "b"                    => 1,
            "k" | "kb" | "kib"          => 1 << 10,
            "m" | "mb" | "mib"          => 1 << 20,
            "g" | "gb" | "gib"          => 1 << 30,
            "t" | "tb" | "tib"          => 1 << 40,
            _                           => return Err(Failure::invalid("not a size: a number with b, k, m, g or t").keyed("not_size")),
        };

        Self::u64(number)
            .map_err(|failure| failure.keyed("not_size").detailed("not a size: a number with b, k, m, g or t"))?
            .checked_mul(scale)
            .ok_or_else(|| Failure::invalid("the size does not fit").keyed("not_size"))

    }

    /// A duration with a unit: `250ms`, `30s`, `5m`, `2h`, `1d`; a bare number is seconds.
    ///
    /// # Errors
    /// `not_duration`.
    #[inline]
    pub fn duration ( text: &str ) -> Result<Duration> {

        let ( number, unit ) = Self::split(text);

        let ( scale, unit_ms ): ( u64, bool ) = match unit.to_ascii_lowercase().as_str() {
            "ms"                        => ( 1, true ),
            "" | "s" | "sec" | "secs"   => ( 1, false ),
            "m" | "min" | "mins"        => ( 60, false ),
            "h" | "hr" | "hrs"          => ( 3600, false ),
            "d" | "day" | "days"        => ( 86_400, false ),
            _                           => return Err(Failure::invalid("not a duration: a number with ms, s, m, h or d").keyed("not_duration")),
        };

        let count = Self::u64(number).map_err(|failure| failure.keyed("not_duration").detailed("not a duration: a number with ms, s, m, h or d"))?;
        let total = count.checked_mul(scale).ok_or_else(|| Failure::invalid("the duration does not fit").keyed("not_duration"))?;

        Ok(if unit_ms { Duration::from_millis(total) } else { Duration::from_secs(total) })

    }

    fn split ( text: &str ) -> ( &str, &str ) {

        let trimmed = text.trim();
        let digits  = trimmed.bytes().take_while(u8::is_ascii_digit).count();

        trimmed.split_at_checked(digits).map_or(( trimmed, "" ), |( number, unit )| ( number, unit.trim() ))

    }

}
