import { defineConfig } from "vite";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import uniBundle from "@dcloudio/vite-plugin-uni";

const uni = "default" in uniBundle ? uniBundle.default : uniBundle;
const uniInjectedCssVars =
  /page\{--status-bar-height:25px;--top-window-height:0px;--window-top:0px;--window-bottom:0px;--window-left:0px;--window-right:0px;--window-magin:0px\}/g;
const uniXInjectedCssVars =
  /page\{--top-window-height:0px;--window-top:0px;--window-bottom:0px;--window-left:0px;--window-right:0px;--window-magin:0px;--uni-safe-area-inset-top:0px;--uni-safe-area-inset-left:0px;--uni-safe-area-inset-right:0px;\}/g;

function stripInjectedCssVars(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(uniInjectedCssVars, "")
    .replace(uniXInjectedCssVars, "");
}

function stripWxssFiles(dir: string) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      stripWxssFiles(file);
      continue;
    }
    if (file.endsWith(".wxss")) {
      const source = readFileSync(file, "utf8");
      const next = stripInjectedCssVars(source);
      if (next !== source) {
        writeFileSync(file, next);
      }
    }
  }
}

export default defineConfig({
  plugins: [
    uni(),
    {
      name: "pet-ai-strip-mp-css-vars",
      generateBundle(_, bundle) {
        for (const asset of Object.values(bundle)) {
          if (asset.type === "asset" && asset.fileName.endsWith(".wxss") && typeof asset.source === "string") {
            asset.source = stripInjectedCssVars(asset.source);
          }
        }
      },
      writeBundle(options) {
        if (options.dir) {
          stripWxssFiles(options.dir);
        }
      }
    }
  ]
});
