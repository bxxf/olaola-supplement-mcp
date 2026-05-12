import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function readFixture(name: string): Promise<string> {
  return readFile(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), "utf8");
}
