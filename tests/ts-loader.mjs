import { register } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";

const loaderCode = `
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = ${JSON.stringify(process.cwd())};

function tryFileWithExtensions(basePath) {
  const candidates = [
    basePath,
    basePath + ".ts",
    basePath + ".tsx",
    basePath + ".js",
    basePath + ".mjs",
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return pathToFileURL(c).href;
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = path.join(ROOT, "src", specifier.slice(2));
    const found = tryFileWithExtensions(target);
    if (found) {
      return { url: found, shortCircuit: true };
    }
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL &&
    context.parentURL.startsWith("file:")
  ) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const target = path.resolve(parentDir, specifier);
    const found = tryFileWithExtensions(target);
    if (found) {
      return { url: found, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
`;

void path;
void fs;
void pathToFileURL;
void fileURLToPath;

register(
  `data:text/javascript;base64,${Buffer.from(loaderCode, "utf8").toString(
    "base64"
  )}`
);

