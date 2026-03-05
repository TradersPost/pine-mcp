import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Package root is one level up from either src/ or dist/
export const PACKAGE_ROOT = resolve(__dirname, "..");

export const MANUAL_PATH = resolve(PACKAGE_ROOT, "data", "manual");
export const DOCS_PATH = resolve(PACKAGE_ROOT, "data", "docs");
export const REFERENCE_JSON_PATH = resolve(
  PACKAGE_ROOT,
  "data",
  "reference",
  "language-reference.json"
);
