import * as esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: [
    "./src/background.ts",
    "./src/content.ts",
    "./src/content.css",
    "./src/popup.tsx",
  ],
  bundle: true,
  minify: true,
  sourcemap: process.env.NODE_ENV !== "production",
  outdir: "./public/build",
  define: {
    "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
  },
});

await context.watch();
