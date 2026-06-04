import { mkdtemp, readdir, rename, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadsDir = path.join(rootDir, "public", "uploads");
const sipsPath = "/usr/bin/sips";
const skipDirectories = new Set(["_unsorted-originals"]);
const jpegExtensions = new Set([".jpg", ".jpeg"]);

const defaultMaxEdge = 2400;
const coverMaxEdge = 1800;
const defaultQuality = 80;
const coverQuality = 74;
const minBytesToOptimize = 900 * 1024;

const formatBytes = (value) => `${(value / (1024 * 1024)).toFixed(2)} MB`;

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (skipDirectories.has(entry.name)) {
        continue;
      }

      files.push(...(await listFiles(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function optimizeJpeg(filePath) {
  const fileStat = await stat(filePath);
  if (fileStat.size < minBytesToOptimize) {
    return null;
  }

  const isCover = filePath.includes(`${path.sep}_covers${path.sep}`);
  const maxEdge = isCover ? coverMaxEdge : defaultMaxEdge;
  const quality = isCover ? coverQuality : defaultQuality;
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "portfolio-opt-"));
  const tempFile = path.join(tempDir, "optimized.jpg");

  const result = spawnSync(
    sipsPath,
    ["-Z", String(maxEdge), "-s", "format", "jpeg", "-s", "formatOptions", String(quality), filePath, "--out", tempFile],
    { encoding: "utf8" }
  );

  if (result.status !== 0) {
    await rm(tempDir, { recursive: true, force: true });
    throw new Error(result.stderr || `Failed to optimize ${path.basename(filePath)}`);
  }

  const optimizedStat = await stat(tempFile);
  if (optimizedStat.size >= fileStat.size) {
    await rm(tempDir, { recursive: true, force: true });
    return null;
  }

  await rename(tempFile, filePath);
  await rm(tempDir, { recursive: true, force: true });

  return {
    filePath,
    before: fileStat.size,
    after: optimizedStat.size
  };
}

async function main() {
  const files = await listFiles(uploadsDir);
  const jpegFiles = files.filter((filePath) =>
    jpegExtensions.has(path.extname(filePath).toLowerCase())
  );

  const results = [];

  for (const filePath of jpegFiles) {
    const outcome = await optimizeJpeg(filePath);
    if (outcome) {
      results.push(outcome);
      console.log(
        `${path.relative(rootDir, outcome.filePath)}: ${formatBytes(outcome.before)} -> ${formatBytes(outcome.after)}`
      );
    }
  }

  const totalBefore = results.reduce((sum, item) => sum + item.before, 0);
  const totalAfter = results.reduce((sum, item) => sum + item.after, 0);

  console.log("");
  console.log(`Optimized ${results.length} file(s).`);
  console.log(`Saved ${formatBytes(totalBefore - totalAfter)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
