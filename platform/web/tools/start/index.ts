import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { root, task } from "../core/index.ts";

const server = resolve(root, ".next/standalone/server.js");

function forward ( child: ChildProcess ): void {

    for ( const signal of ["SIGINT", "SIGTERM"] as const ) {

        process.once(signal, () => child.kill(signal));

    }

    child.once("exit", ( code ) => { process.exitCode = code ?? 1; });
    child.once("error", ( error ) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });

}
function start (): void {

    if ( !existsSync(server) ) throw new Error("Build the release first with pnpm build.");

    forward(spawn(process.execPath, [server], {
        stdio: "inherit",
        env: { ...process.env, PORT: process.env.PORT ?? "3001", HOSTNAME: "0.0.0.0" },
    }));

}

task(import.meta.url, start);
