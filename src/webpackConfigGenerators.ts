import { Configuration, container } from "webpack";
import "webpack-dev-server";
// @ts-ignore
import portFinderSync from "portfinder-sync";
// @ts-ignore
import ExternalTemplateRemotesPlugin from "external-remotes-plugin";
import {
  ModuleScope,
  modules as moduleDefinitions,
} from "@scottbenton/apps-config";

import HtmlWebPackPlugin from "html-webpack-plugin";
import WebpackRemoteTypesPlugin from "webpack-remote-types-plugin";
import DotEnv from "dotenv-webpack";

const { ModuleFederationPlugin } = container;

const BASE_PORT = 3001;
const BASE_MODULE_PORT = 3002;

const singletonDependencies = {
  react: {
    singleton: true,
    requiredVersion: "18.2.0",
  },
  "react-dom": {
    singleton: true,
    requiredVersion: "18.2.0",
  },
  "react-router-dom": {
    singleton: true,
    requiredVersion: "6.22.0",
  },
  "react-helmet-async": {
    singleton: true,
    requiredVersion: "2.0.4",
  },
};

interface ConfigParams {
  name: string;
  modules?: ModuleScope[];
  dependencies: Record<string, string>;
}

interface ModuleConfigParams extends ConfigParams {
  exposes: Record<string, string>;
}

export function constructModuleWebpackConfig(
  params: ModuleConfigParams
): Configuration[] {
  const { name, modules, dependencies, exposes } = params;

  const port = portFinderSync.getPort(BASE_MODULE_PORT);

  const remoteModules: Partial<Record<ModuleScope, string>> = {};
  const deployedRemoteModules: Partial<Record<ModuleScope, string>> = {};

  modules?.forEach((scope) => {
    const module = moduleDefinitions[scope];
    remoteModules[
      scope
    ] = `${scope}@[window.${scope}_url]/remoteEntry.js?v=[Date.now()]`;
    deployedRemoteModules[
      scope
    ] = `${scope}@${module.defaultUrl}/remoteEntry.js`;
  });

  return [
    {
      output: {
        publicPath: "auto",
      },

      resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
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

      module: {
        rules: [
          {
            test: /\.m?js/,
            type: "javascript/auto",
            resolve: {
              fullySpecified: false,
            },
          },
          {
            test: /\.(css|s[ac]ss)$/i,
            use: ["style-loader", "css-loader", "postcss-loader"],
          },
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
            },
          },
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            exclude: /node_modules/,
            type: "asset/resource",
          },
        ],
      },

      plugins: [
        new ModuleFederationPlugin({
          name: name,
          filename: "remoteEntry.js",
          remotes: remoteModules,
          exposes,
          shared: {
            ...dependencies,
            ...singletonDependencies,
          },
        }),
        new WebpackRemoteTypesPlugin({
          remotes: deployedRemoteModules,
          outputDir: "types", // supports [name] as the remote name
          remoteFileName: "[name]-dts.tgz", // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
        }),
        new HtmlWebPackPlugin({
          template: "./src/index.html",
        }),
        new DotEnv(),
      ],
    },
    {
      name: "dts",
      entry: Object.values(exposes),
      mode: "development",
      output: {
        publicPath: "auto",
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.(css|s[ac]ss)$/i,
            use: ["style-loader", "css-loader", "postcss-loader"],
          },
          {
            test: /\.tsx?$/,
            loader: "babel-loader",
            exclude: /node_modules/,
            options: {
              presets: ["@babel/preset-react", "@babel/preset-typescript"],
            },
          },
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
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
          {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            exclude: /node_modules/,
            type: "asset/resource",
          },
        ],
      },
    },
  ];
}

export function constructBaseWebpackConfig(
  params: ConfigParams
): Configuration {
  const { name, modules, dependencies } = params;

  const remoteModules: Partial<Record<ModuleScope, string>> = {};

  const deployedRemoteModules: Partial<Record<ModuleScope, string>> = {};

  modules?.forEach((scope) => {
    const module = moduleDefinitions[scope];
    remoteModules[
      scope
    ] = `${scope}@[window.${scope}_url]/remoteEntry.js?v=[Date.now()]`;
    deployedRemoteModules[
      scope
    ] = `${scope}@${module.defaultUrl}/remoteEntry.js`;
  });

  return {
    output: {
      publicPath: "/",
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: portFinderSync.getPort(BASE_PORT),
      historyApiFallback: true,
      hot: true,
    },

    module: {
      rules: [
        {
          test: /\.m?js/,
          type: "javascript/auto",
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.(css|s[ac]ss)$/i,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          exclude: /node_modules/,
          type: "asset/resource",
        },
        { test: /\.json$/, type: "json" },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: "remoteEntry.js",
        remotes: remoteModules,
        exposes: {},
        shared: {
          ...dependencies,
          ...singletonDependencies,
        },
      }),
      new WebpackRemoteTypesPlugin({
        remotes: deployedRemoteModules,
        outputDir: "types", // supports [name] as the remote name
        remoteFileName: "[name]-dts.tgz", // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
      }),
      new ExternalTemplateRemotesPlugin(),
      new HtmlWebPackPlugin({
        template: "./index.html",
      }),
      new DotEnv(),
    ],
  };
}
