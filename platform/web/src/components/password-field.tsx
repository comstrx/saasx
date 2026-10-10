"use client";

import type { ComponentProps } from "react";
import Button from "@/elements/button";
import Field from "@/elements/field";
import { usePasswordField } from "@/hooks/use-password-field";
import Icon from "@/icons/icon";
import { useTranslations } from "@/lib/providers/intl";

type Props = Omit<ComponentProps<typeof Field>, "type" | "end" | "start">;

export default function PasswordField ( props: Props ) {

    const t = useTranslations("auth");
    const { shown, toggle } = usePasswordField();

    return (

        <Field
            {...props}
            type={shown ? "text" : "password"}
            end={(

                <Button variant="ghost" onClick={toggle} aria-label={t("show")} aria-pressed={shown} disabled={props.disabled}>

                    <Icon name={shown ? "eye-off" : "eye"} />

                </Button>

            )}
        />

    );

}
