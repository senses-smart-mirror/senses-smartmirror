import { ISetting, IBasicSetting } from "./Setting";

export interface IWidgetData {
  id?: string;
  name: string;
  icon: string;
  helper: any;
  settings: ISetting[] | IBasicSetting[];

  version?: string;
  custom?: boolean;
  author?: string;
  link?: string;
  url?: string;
  isLoading?: boolean;
  speech?: string;
}