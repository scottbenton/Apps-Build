import { Configuration, container } from "webpack";
import "webpack-dev-server";
// @ts-ignore
import ExternalTemplateRemotesPlugin from "external-remotes-plugin";
import {
  ModuleScope,
  modules as moduleDefinitions,
} from "@scottbenton/apps-config";

import HtmlWebPackPlugin from "html-webpack-plugin";
import DotEnv from "dotenv-webpack";
import { ConfigParams } from "../types";
import { FederatedTypesPlugin } from "@module-federation/typescript";
import { ModuleFederationPluginOptions } from "@module-federation/typescript/src/types";

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

  const federationConfig: ModuleFederationPluginOptions = {
    name,
    filename: "remoteEntry.js",
    remotes: remoteModules,
    exposes,
    shared: {
      ...dependencies,
      ...singletonDependencies,
    },
  };

  return [
    new ModuleFederationPlugin(federationConfig),
    new ExternalTemplateRemotesPlugin(),
    new FederatedTypesPlugin({
      federationConfig: { ...federationConfig, remotes: deployedRemoteModules },
    }),
    new HtmlWebPackPlugin({
      template: "./public/index.html",
    }),
    new DotEnv(),
  ];
}
