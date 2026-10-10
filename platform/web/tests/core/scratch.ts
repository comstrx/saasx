import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export function scratch ( files: Record<string, string | Buffer> = {} ) {

    const root = mkdtempSync(join(tmpdir(), "web-tests-"));

    for ( const [name, content] of Object.entries(files) ) {

        mkdirSync(dirname(join(root, name)), { recursive: true });
        writeFileSync(join(root, name), content);

    }

    return { root, dispose: () => rmSync(root, { recursive: true, force: true }) };

}
