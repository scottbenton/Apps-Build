import { ConfigParams } from "../types";
import path from "path";

const javascriptAuto = {
  test: /\.m?js/,
  type: "javascript/auto",
  resolve: {
    fullySpecified: false,
  },
};
const cssSass = {
  test: /\.(css|s[ac]ss)$/i,
  use: ["style-loader", "css-loader", "postcss-loader"],
};
const babelLoader = {
  test: /\.(ts|tsx|js|jsx)$/,
  loader: "babel-loader",
  exclude: /node_modules/,
  options: {
    presets: ["@babel/preset-react", "@babel/preset-typescript"],
  },
};
const imageLoader = {
  test: /\.(png|svg|jpg|jpeg|gif)$/i,
  exclude: /node_modules/,
  type: "asset/resource",
};
const jsonLoader = { test: /\.json$/, type: "json" };

export function getModuleRules() {
  return {
    rules: [javascriptAuto, cssSass, babelLoader, imageLoader, jsonLoader],
  };
}

export function getDTSRules(params: ConfigParams) {
  const { name, exposes } = params;
  return {
    rules: [
      javascriptAuto,
      cssSass,
      babelLoader,
      imageLoader,
      jsonLoader,
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, "./src"),
        use: [
          {
            loader: "dts-loader",
            options: {
              name: name,
              exposes: exposes,
            },
          },
        ],
      },
    ],
  };
}
