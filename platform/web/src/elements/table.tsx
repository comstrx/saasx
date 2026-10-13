import type { KeyboardEvent, ReactNode } from "react";

export type Column = { key: string; label: string; align?: "start" | "end" | undefined };
export type Row = { key: string; cells: Record<string, ReactNode> };
type Props = { columns: readonly Column[]; rows: readonly Row[]; caption?: string | undefined; selected?: string | undefined; onSelect?: (( key: string ) => void) | undefined };

export default function Table ({ columns, rows, caption, selected, onSelect }: Props) {

    const pick = ( event: KeyboardEvent<HTMLTableRowElement>, key: string ): void => {

        if ( event.key !== "Enter" && event.key !== " " ) return;

        event.preventDefault();
        onSelect?.(key);

    };

    return (

        <div className="table-scroll">

            <table className="table" data-selectable={onSelect ? "" : undefined}>

                {caption ? <caption className="table-caption">{caption}</caption> : null}

                <thead>

                    <tr>{columns.map(( column ) => <th key={column.key} scope="col" className="table-head" data-align={column.align ?? "start"}>{column.label}</th>)}</tr>

                </thead>

                <tbody>

                    {rows.map(( row ) => (

                        <tr
                            key={row.key}
                            className="table-row"
                            tabIndex={onSelect ? 0 : undefined}
                            aria-selected={onSelect ? row.key === selected : undefined}
                            onClick={onSelect ? () => onSelect(row.key) : undefined}
                            onKeyDown={onSelect ? ( event ) => pick(event, row.key) : undefined}
                        >

                            {columns.map(( column ) => <td key={column.key} className="table-cell" data-align={column.align ?? "start"}>{row.cells[column.key]}</td>)}

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}
