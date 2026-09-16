import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const TEST_DB_PATH = "prisma/test.db";

export default function setup() {
  rmSync(TEST_DB_PATH, { force: true });
  rmSync(`${TEST_DB_PATH}-journal`, { force: true });

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: `file:./${TEST_DB_PATH}` },
  });

  return () => {
    if (existsSync(TEST_DB_PATH)) {
      rmSync(TEST_DB_PATH, { force: true });
      rmSync(`${TEST_DB_PATH}-journal`, { force: true });
    }
  };
}
