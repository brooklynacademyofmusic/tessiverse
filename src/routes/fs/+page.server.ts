import type { PageServerLoad } from "./$types";
import { readdir } from 'node:fs/promises';
import { spawnSync } from "node:child_process";

export const load: PageServerLoad = () => {
    let dir = readdir(".", {recursive: false})
    let tq = spawnSync("bin/tq",{encoding: "utf8"})

    return { dir, tq: {stdout: tq.stdout, stderr: tq.stderr, error: JSON.stringify(tq.error)} }
}