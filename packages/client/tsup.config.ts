import { defineConfig } from "tsup"

export default defineConfig({
  target: "es2020",
  platform: 'browser',
  sourcemap: true,
  dts: true,
  format: ["esm"],
  injectStyle: true,
  clean: true
})