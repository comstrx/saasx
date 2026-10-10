"use client";

import CountrySelect from "@/elements/country-select";
import Field from "@/elements/field";
import Flag from "@/elements/flag";
import Text from "@/elements/text";
import { usePhoneField } from "@/hooks/use-phone-field";
import { useLocale, useTranslations } from "@/lib/providers/intl";
import { type Phone, typedPhone } from "@/lib/providers/phone";

type Props = { id: string; value: Phone; error?: string; disabled?: boolean; onChange: ( value: Phone ) => void };

export default function PhoneField ({ id, value, error, disabled, onChange }: Props) {

    const t = useTranslations("auth");
    const options = usePhoneField(useLocale());
    const selected = options.find(( option ) => option.value === value.country);

    return (

        <Field
            id={id}
            label={t("phone")}
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            controlDirection="ltr"
            dir="ltr"
            value={value.number}
            error={error}
            disabled={disabled}
            onChange={( event ) => onChange(typedPhone(event.target.value, value))}
            start={(

                <CountrySelect
                    label={t("country")}
                    value={value.country}
                    options={options}
                    disabled={disabled}
                    onValueChange={( country ) => onChange({ ...value, country })}
                >

                    <Flag code={value.country} />
                    <Text as="span" size="small">{selected?.detail}</Text>

                </CountrySelect>

            )}
        />

    );

}
