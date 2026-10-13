import { useState } from "react";
import Button from "@/elements/button";
import Input from "@/elements/input";
import Stack from "@/elements/stack";

type Props = { initial: string; placeholder: string; go: string; onSearch: ( value: string ) => void };

export default function SearchBar ({ initial, placeholder, go, onSearch }: Props) {
    const [value, setValue] = useState(initial);
    const submit = (): void => onSearch(value.trim());

    return (

        <Stack direction="row" gap={2}>

            <Input name="search" kind="search" value={value} placeholder={placeholder} onChange={setValue} onSubmit={submit} />

            <Button label={go} onPress={submit} />

        </Stack>

    );
}
