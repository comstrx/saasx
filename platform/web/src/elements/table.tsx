import type { ReactNode } from "react";
import { tv, type VariantProps } from "@/lib/providers/variants";

type Column = { key: string; label: string; align?: "start" | "end" | "center"; numeric?: boolean; width?: string; action?: boolean };
type Row = { key: string; cells: Record<string, ReactNode>; current?: boolean; muted?: boolean };
type Props = VariantProps<typeof table> & { caption: string; columns: readonly Column[]; rows: readonly Row[]; captionVisible?: boolean };

const table = tv({
    slots: { frame: "data-table-frame", grid: "data-table" },
    variants: {
        stack: { true: { frame: "data-table-stack", grid: "data-table-stacked" } },
        align: { middle: {}, top: { grid: "data-table-top" } },
    },
    defaultVariants: { align: "middle" },
});

export default function Table ({ caption, columns, rows, captionVisible = false, stack, align }: Props) {

    const styles = table({ stack, align });

    return (

        <div className={styles.frame()}>

            <table className={styles.grid()}>

                <caption className={captionVisible ? "data-table-caption" : "sr-only"}>{caption}</caption>

                {columns.some(( column ) => column.width) ? (

                    <colgroup>

                        {columns.map(( column ) => (

                            <col key={column.key} style={column.width ? { inlineSize: column.width } : undefined} />

                        ))}

                    </colgroup>

                ) : null}

                <thead>

                    <tr>

                        {columns.map(( column ) => (

                            <th key={column.key} scope="col" data-align={column.align ?? "start"}>{column.label}</th>

                        ))}

                    </tr>

                </thead>

                <tbody>

                    {rows.map(( row ) => (

                        <tr key={row.key} data-current={row.current ? "" : undefined} data-muted={row.muted ? "" : undefined}>

                            {columns.map(( column ) => (

                                <td
                                    key={column.key}
                                    data-label={column.action ? undefined : column.label}
                                    data-align={column.align ?? "start"}
                                    data-numeric={column.numeric ? "" : undefined}
                                >

                                    {row.cells[column.key]}

                                </td>

                            ))}

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}
