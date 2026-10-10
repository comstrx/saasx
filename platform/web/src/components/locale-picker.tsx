"use client";

import Choices from "@/elements/choices";
import Currency from "@/elements/currency";
import Flag from "@/elements/flag";
import Popover from "@/elements/popover";
import Stack from "@/elements/stack";
import Tabs from "@/elements/tabs";
import Text from "@/elements/text";
import { useLocalePicker } from "@/hooks/use-locale-picker";

export default function LocalePicker () {

    const picker = useLocalePicker();
    const languages = picker.languages.map(( option ) => ({ ...option, media: <Flag code={option.flag} size="medium" /> }));
    const currencies = picker.currencies.map(( option ) => ({
        ...option,
        media: option.flag ? <Flag code={option.flag} size="medium" /> : undefined,
    }));

    return (

        <Popover
            label={picker.label}
            title={picker.title}
            look="button"
            width="locale"
            padding="tight"
            open={picker.open}
            onOpenChange={picker.setOpen}
            trigger={

                <>

                    <Flag code={picker.flag} />

                    <Stack as="span" direction="row" align="center" gap={2} visibility="narrow">

                        <Text as="span" size="small" weight="semibold">{picker.language}</Text>

                        <Text as="span" size="small" tone="muted">·</Text>

                    </Stack>

                    <Currency code={picker.currency} glyph={picker.glyph} />

                </>

            }
        >

            <Tabs
                label={picker.title}
                value={picker.tab}
                width="full"
                onValueChange={picker.setTab}
                tabs={[
                    {
                        value: "language",
                        label: picker.tabs.language,
                        panel: (

                            <Choices
                                label={picker.tabs.language}
                                value={picker.locale}
                                options={languages}
                                disabled={picker.pending}
                                columns={2}
                                look="pick"
                                onValueChange={picker.chooseLanguage}
                            />

                        ),
                    },
                    {
                        value: "currency",
                        label: picker.tabs.currency,
                        panel: (

                            <Choices
                                label={picker.tabs.currency}
                                value={picker.currency}
                                options={currencies}
                                disabled={picker.pending}
                                columns={2}
                                look="pick"
                                onValueChange={picker.chooseCurrency}
                            />

                        ),
                    },
                ]}
            />

            {picker.failed ? <Text size="small" tone="danger" role="alert">{picker.failed}</Text> : null}

        </Popover>

    );

}
