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

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Packages without an "exports" map (e.g. next/headers) need an explicit .js suffix under ESM.
    if (
      err &&
      err.code === "ERR_MODULE_NOT_FOUND" &&
      !specifier.startsWith(".") &&
      !specifier.startsWith("node:") &&
      !path.extname(specifier)
    ) {
      return nextResolve(specifier + ".js", context);
    }
    throw err;
  }
}

let tsModule = null;
async function getTs() {
  if (!tsModule) {
    const mod = await import(
      pathToFileURL(path.join(ROOT, "node_modules", "typescript", "lib", "typescript.js")).href
    );
    tsModule = mod.default || mod;
  }
  return tsModule;
}

export async function load(url, context, nextLoad) {
  if (
    url.startsWith("file:") &&
    /\\.(ts|tsx)$/.test(url) &&
    !url.includes("/node_modules/")
  ) {
    const ts = await getTs();
    const filePath = fileURLToPath(url);
    const source = fs.readFileSync(filePath, "utf8");
    const out = ts.transpileModule(source, {
      fileName: filePath,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        isolatedModules: true,
      },
    });
    return { format: "module", source: out.outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
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

