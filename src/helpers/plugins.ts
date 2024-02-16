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
import { ConfigParams } from "../types";

const { ModuleFederationPlugin } = container;

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

export function getPlugins(params: ConfigParams): Configuration["plugins"] {
  const { name, modules, exposes, dependencies = {} } = params;

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
    new ExternalTemplateRemotesPlugin(),
    new WebpackRemoteTypesPlugin({
      remotes: deployedRemoteModules,
      outputDir: "./src/module-types", // supports [name] as the remote name
      remoteFileName: "[name]-dts.tgz", // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
    }),
    new DotEnv(),
  ];
}
