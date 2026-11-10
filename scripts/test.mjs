import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["--test", "tests/public-page.test.mjs"], { stdio: "inherit" });
process.exit(result.status ?? 1);
