type Props = { level: 1 | 2 | 3; text: string; id?: string | undefined };

export default function Heading ({ level, text, id }: Props) {
    const Tag = `h${level}` as const;

    return <Tag id={id} className="heading" data-level={level}>{text}</Tag>;
}
