"use client";

import { useId, useState } from "react";
import Button from "@/elements/button";
import Form from "@/elements/form";
import Input from "@/elements/input";
import Stack from "@/elements/stack";

type Props = { initial: string; placeholder: string; go: string; onSearch: ( value: string ) => void };

export default function SearchBar ({ initial, placeholder, go, onSearch }: Props) {
    const id = useId();
    const [value, setValue] = useState(initial);

    return (

        <Form name="search" onSubmit={() => onSearch(value.trim())}>

            <Stack direction="row" gap={2}>

                <Input id={`${id}-query`} name="search" kind="search" value={value} placeholder={placeholder} onChange={setValue} />

                <Button label={go} type="submit" />

            </Stack>

        </Form>

    );
}
