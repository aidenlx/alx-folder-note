import { promises } from "fs";

const { copyFile, rename, writeFile } = promises;

/** @type import("esbuild").Plugin */
const obPlugin = {
  name: "obsidian-plugin",
  setup: (build) => {
    build.onEnd(async () => {
      // fix default css output file name
      const { outfile } = build.initialOptions;
      try {
        await rename(
          outfile.replace(/\.js$/, ".css"),
          outfile.replace(/main\.js$/, "styles.css"),
        );
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }

      // copy manifest.json to build dir
      await copyFile("manifest.json", "build/manifest.json");

      // create .hotreload if it doesn't exist
      try {
        await writeFile("build/.hotreload", "", { flag: "wx" });
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      console.log("build finished");
    });
  },
};
export default obPlugin;
