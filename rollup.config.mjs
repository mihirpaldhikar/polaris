/*
 * Copyright (c) 2023 Mihir Paldhikar
 *
 * Polaris is a proprietary software owned, developed and
 * maintained by Mihir Paldhikar.
 *
 * No part of the software should be distributed or reverse
 * engineered in any form without the permission of the owner.
 *
 * Doing so will result into a legal action without any prior notice.
 *
 * All Rights Reserved.
 */

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import { readFileSync } from "fs";
import pluginPeerDepsExternalModule from "rollup-plugin-peer-deps-external";
import terser from "@rollup/plugin-terser";

const packageJsonURL = new URL("./package.json", import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonURL, "utf8"));

const rollupConfiguration = [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      postcss({
        extract: false,
      }),
      resolve({
        extensions: [".css"],
      }),
      commonjs({
        transformMixedEsModules: true,
        include: [],
      }),
      pluginPeerDepsExternalModule(),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["**/tests/", "**/*.test.ts", "**/*.test.tsx"],
      }),
      terser(),
    ],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];

export default rollupConfiguration;
