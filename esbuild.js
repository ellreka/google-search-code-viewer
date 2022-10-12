const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: [
      "./src/background.ts",
      "./src/content.ts",
    ],
    bundle: true,
    minify: true,
    watch: process.argv.includes("--watch"),
    sourcemap: process.env.NODE_ENV !== "production",
    outdir: "./public/build",
    define: {
      "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`
    }
  })
  .catch(() => process.exit(1));