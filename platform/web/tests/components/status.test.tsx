import { describe, expect, test } from "bun:test";
import { Failure } from "@engine/error";
import { renderToString } from "react-dom/server";
import DataTable from "../../src/components/data-table";
import Status from "../../src/components/status";

describe("status", () => {

    test("loading shows a live spinner, failure its text, and an offline failure the offline text", () => {

        expect(renderToString(<Status status="loading" loading="Loading" failed="Failed" />)).toContain('role="status"');
        expect(renderToString(<Status status="failed" loading="Loading" failed="Failed" error={new Failure("http")} />)).toContain("Failed");
        expect(renderToString(<Status status="failed" loading="Loading" failed="Failed" offline="Offline" error={new Failure("network")} />)).toContain("Offline");
        expect(renderToString(<Status status="idle" loading="Loading" failed="Failed" />)).toBe("");

    });

});
describe("data table", () => {

    const columns = [
        { key: "id", label: "ID", kind: "number" as const },
        { key: "name", label: "Name" },
        { key: "type", label: "Type", kind: "badge" as const },
        { key: "featured", label: "Featured", kind: "boolean" as const },
        { key: "sale_price", label: "Price", kind: "money" as const },
        { key: "created_at", label: "Created", kind: "date" as const },
    ];

    test("renders every column kind from a row and the empty text without rows", () => {

        const html = renderToString(<DataTable locale="en" columns={columns} keyField="id" empty="Nothing" rows={[{ id: 7, name: "Tea", type: "hotel", featured: true, sale_price: { amount: "12.50", currency: "USD" }, created_at: "2026-10-13T00:00:00+00:00" }]} />);

        expect(html).toContain("Tea");
        expect(html).toContain('class="badge"');
        expect(html).toContain("12.50");
        expect(html).toContain("Oct");
        expect(html).toContain('aria-label="Featured"');
        expect(renderToString(<DataTable locale="en" columns={columns} keyField="id" empty="Nothing" rows={[]} />)).toContain("Nothing");

    });
    test("a selectable table marks the chosen row", () => {

        const html = renderToString(<DataTable locale="en" columns={columns} keyField="id" empty="Nothing" rows={[{ id: 7, name: "Tea" }]} selected="7" onSelect={() => undefined} />);

        expect(html).toContain('aria-selected="true"');

    });

});
