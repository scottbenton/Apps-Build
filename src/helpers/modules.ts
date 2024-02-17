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
    presets: [
      "@babel/preset-typescript",
      [
        "@babel/preset-react",
        {
          runtime: "automatic",
        },
      ],
    ],
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
