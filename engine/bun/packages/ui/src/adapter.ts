export type Tone = "default" | "muted" | "primary" | "danger" | "success";
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type TextProps = {
    text: string;
    tone?: Tone | undefined;
    size?: Size | undefined;
    align?: "start" | "center" | "end" | undefined;
};
export type PressProps = {
    label: string;
    onPress: () => void;
    tone?: Tone | undefined;
    disabled?: boolean | undefined;
    busy?: boolean | undefined;
};
export type ImageProps = { src: string | null | undefined; alt: string; ratio?: number | undefined };
export type IconProps = { name: string; size?: Size | undefined; tone?: Tone | undefined };
export type InputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string | undefined;
    kind?: "text" | "email" | "password" | "number" | "search" | undefined;
    invalid?: boolean | undefined;
    disabled?: boolean | undefined;
};
/**
 * The primitives a surface must provide, each rendered with its own libraries; features speak
 * these props and never the library behind them.
 */
export type Adapter<N> = {
    text: (props: TextProps) => N;
    press: (props: PressProps) => N;
    image: (props: ImageProps) => N;
    icon: (props: IconProps) => N;
    input: (props: InputProps) => N;
};

export function defineAdapter<N>(adapter: Adapter<N>): Adapter<N> {
    return adapter;
}
