import { spawn } from "child_process";
import { access, unlink } from "fs/promises";
import { afterEach, test, expect } from "vitest";

afterEach(async () => {
  try {
    await access("sitemap.xml");
    await unlink("sitemap.xml");
  } catch {
    // File doesn't exist, nothing to clean up
  }
});

interface CommandResult {
  stdout: string;
  stderr: string;
}

async function runCommand(args: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (err: Error) => {
      reject(err);
    });

    child.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\n${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

test("should create sitemap file", async () => {
  await runCommand([
    "dist/index.js",
    "http://example.com",
    "-f",
    "sitemap.xml",
  ]);

  await expect(access("sitemap.xml")).resolves.toBeUndefined();
}, 20000);

test("should write to stdout in verbose mode", async () => {
  const result = await runCommand([
    "dist/index.js",
    "http://example.com",
    "-f",
    "sitemap.xml",
    "--verbose",
  ]);

  expect(result.stdout).not.toBe("");
}, 20000);
