import { ModuleScope } from "@scottbenton/apps-config";

export interface ConfigParams {
  name: string;
  modules?: ModuleScope[];
  dependencies?: Record<string, string>;
  exposes?: Record<string, string>;
}
