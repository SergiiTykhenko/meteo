export default {
  entry: ["server/index.ts"],
  outDir: "dist/server",
  target: "node20",
  format: ["esm"],
  external: [
    "express",
    "fs",
    "node:fs/promises",
    "vite",
    "compression",
    "sirv",
  ],
};
