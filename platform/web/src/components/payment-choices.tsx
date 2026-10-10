"use client";

import Choices from "@/elements/choices";
import Emblem from "@/elements/emblem";
import Select from "@/elements/select";
import Stack from "@/elements/stack";
import Text from "@/elements/text";
import Thumb from "@/elements/thumb";
import Icon, { isIconName } from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Option = { value: string; label: string; detail?: string; icon: string; image: string | null };
type Props = {
    id: string; value: string; options: readonly Option[];
    currency: string; currencies: readonly string[]; disabled?: boolean;
    onChange: ( value: string ) => void; onCurrency: ( value: string ) => void;
};

export default function PaymentChoices ({ id, value, options, currency, currencies, disabled, onChange, onCurrency }: Props) {

    const t = useTranslations("checkout");

    return (

        <Stack gap={4}>

            <Choices
                label={t("paymentMethod")} value={value} disabled={disabled} onValueChange={onChange}
                options={options.map(( option ) => ({
                    value: option.value, label: option.label, detail: option.detail,
                    end: option.image
                        ? <Thumb src={option.image} alt="" fallback={isIconName(option.icon) ? <Icon name={option.icon} /> : null} />
                        : <Emblem size="small" tone={option.value === value ? "accent" : "neutral"}>
                            {isIconName(option.icon) ? <Icon name={option.icon} /> : null}
                        </Emblem>,
                }))}
            />

            {currencies.length ? (

                <Select
                    id={id} label={t("paymentCurrency")} value={currency} disabled={disabled}
                    options={[{ value: "", label: t("defaultCurrency") }, ...currencies.map(( code ) => ({ value: code, label: code }))]}
                    onValueChange={( value ) => onCurrency(value)}
                />

            ) : null}

            {value.startsWith("gateway:") ? <Text size="small" tone="muted">{t("gatewayHint")}</Text> : null}

        </Stack>

    );

}
