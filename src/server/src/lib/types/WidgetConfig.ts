
import { ISetting } from "./Setting";
import { ISpeechConfig } from "./Speech";

export interface IWidgetConfig {
  id?: string;
  name: string;
  icon: string;
  settings: ISetting[];

  speech?: string | ISpeechConfig[];
  helper?: any;
  version?: string;
  custom?: boolean;
  author?: string;
  link?: string;
  url?: string;
  isLoading?: boolean;
  hide?: boolean;
}