#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Get paths relative to this package
const generatorPath = join(__dirname, "generators", "TypeGenerator.js");
const templateDirectory = join(__dirname, "template");

// Parse arguments - everything after the script name
const args = process.argv.slice(2);

// Find the position of '--' separator if it exists
const separatorIndex = args.indexOf("--");
const beforeSeparator = separatorIndex >= 0 ? args.slice(0, separatorIndex + 1) : args;
const afterSeparator = separatorIndex >= 0 ? args.slice(separatorIndex + 1) : [];

// Build the command arguments for npm init
// npm init @api-platform/client expects: entrypoint outputDir -- --generator ... --template-directory ...
const commandArgs = [
  "init",
  "@api-platform/client",
  ...beforeSeparator,
  ...afterSeparator,
  "--generator",
  generatorPath,
  "--template-directory",
  templateDirectory,
];

// Spawn npm with init command
const child = spawn("npm", commandArgs, {
  stdio: "inherit",
  shell: false,
});

child.on("error", (error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
