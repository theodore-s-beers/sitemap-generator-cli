import { spawn } from "child_process";
import { access, unlink, readFile } from "fs/promises";
import { afterEach, test, expect } from "vitest";

afterEach(async () => {
  try {
    await access("sitemap.xml");
    await unlink("sitemap.xml");
  } catch {
    // File doesn't exist, nothing to clean up
  }
});

async function runCommand(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}\n${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

test("should create sitemap file", async () => {
  await runCommand(["index.js", "http://example.com", "-f", "sitemap.xml"]);

  await expect(access("sitemap.xml")).resolves.toBeUndefined();
}, 20000);

test("should write to stdout in verbose mode", async () => {
  const result = await runCommand([
    "index.js",
    "http://example.com",
    "-f",
    "sitemap.xml",
    "--verbose",
  ]);

  expect(result.stdout).not.toBe("");
}, 20000);

test("should add last-mod header to xml", async () => {
  await runCommand([
    "index.js",
    "http://example.com",
    "-f",
    "sitemap.xml",
    "--last-mod",
  ]);

  const data = await readFile("sitemap.xml", "utf8");
  expect(data).toContain("<lastmod>");
}, 20000);
