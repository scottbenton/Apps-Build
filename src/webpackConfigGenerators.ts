import { Configuration } from "webpack";
import "webpack-dev-server";
// @ts-ignore
import portFinderSync from "portfinder-sync";

import { ConfigParams } from "./types";
import { getPlugins } from "./helpers/plugins";
import { getModuleRules } from "./helpers/modules";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

const BASE_PORT = 3001;
const BASE_MODULE_PORT = 3002;

export function constructModuleWebpackConfig(
  params: ConfigParams
): Configuration[] {
  const port = portFinderSync.getPort(BASE_MODULE_PORT);

  return [
    {
      output: {
        publicPath: "auto",
      },

      resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
        plugins: [new TsconfigPathsPlugin()],
      },

      devServer: {
        host: "localhost",
        hot: false,
        liveReload: true,
        client: {
          webSocketURL: `ws://localhost:${port}/ws`,
        },
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        allowedHosts: "all",
        port,
        historyApiFallback: true,
      },
      module: getModuleRules(),
      plugins: getPlugins(params),
    },
  ];
}

export function constructBaseWebpackConfig(
  params: ConfigParams
): Configuration {
  return {
    output: {
      publicPath: "/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
      plugins: [new TsconfigPathsPlugin()],
    },

    devServer: {
      port: portFinderSync.getPort(BASE_PORT),
      historyApiFallback: true,
      hot: true,
    },

    module: getModuleRules(),

    plugins: getPlugins(params),
  };
}
