import type { ReactNode } from "react";

type Reaction = { emoji: string; count: number; mine: boolean };
type Note = { key: string; label: string; icon?: ReactNode; quiet?: boolean };
type Props = {
    side: "mine" | "theirs";
    author: string;
    time?: string | null;
    avatar?: ReactNode;
    quote?: { author: string; text: string } | null;
    notes?: readonly Note[];
    reactions?: readonly Reaction[];
    reactionLabel?: ( reaction: Reaction ) => string;
    menu?: ReactNode;
    removed?: boolean;
    onReact?: ( emoji: string ) => void;
    children: ReactNode;
};

export default function Bubble ({
    side, author, time, avatar, quote, notes = [], reactions = [], reactionLabel, menu, removed, onReact, children,
}: Props) {

    return (

        <li className="bubble-row" data-side={side} data-removed={removed || undefined}>

            {avatar ? <span className="bubble-avatar">{avatar}</span> : null}

            <span className="bubble-stack">

                <span className="bubble-meta">

                    <span className="bubble-author" dir="auto">{author}</span>

                    {time ? <span>{time}</span> : null}

                    {notes.map(( note ) => (

                        <span key={note.key} className="bubble-flag">

                            {note.icon}

                            {note.quiet ? <span className="sr-only">{note.label}</span> : note.label}

                        </span>

                    ))}

                </span>

                <span className="bubble-line">

                    <span className="bubble" dir="auto">

                        {quote ? (

                            <span className="bubble-quote">

                                <span className="bubble-quote-author" dir="auto">{quote.author}</span>

                                <span className="bubble-quote-text" dir="auto">{quote.text}</span>

                            </span>

                        ) : null}

                        {children}

                    </span>

                    {menu ? <span className="bubble-menu">{menu}</span> : null}

                </span>

                {reactions.length ? (

                    <span className="bubble-reactions">

                        {reactions.map(( reaction ) => (

                            <button
                                key={reaction.emoji}
                                type="button"
                                aria-pressed={reaction.mine}
                                aria-label={reactionLabel?.(reaction)}
                                className="bubble-reaction"
                                onClick={() => onReact?.(reaction.emoji)}
                            >

                                <span aria-hidden="true">{reaction.emoji}</span>

                                <span aria-hidden="true">{reaction.count}</span>

                            </button>

                        ))}

                    </span>

                ) : null}

            </span>

        </li>

    );

}
