import { IBasicSetting, ISetting } from "./Setting";

export interface IModule {
  name: string;
  enabled: boolean;
  fn?: any;
  class?: any;
  started?: boolean;
  config?: any;
  icon?: string;
  settings?: ISetting[] | IBasicSetting[];
}

export interface IModuleConfig {
  name: string;
  icon: string;
  settings?: ISetting[] | IBasicSetting[];
}