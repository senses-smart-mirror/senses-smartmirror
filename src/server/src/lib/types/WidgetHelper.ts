import { ISetting, IBasicSetting } from "./Setting";
import { ISpeechConfig } from './Speech';

export interface IWidgetHelper {
  interval?: ReturnType<typeof setInterval>;
  id?: string;
  name?: string;
  settings?: (ISetting | IBasicSetting)[];
  speech?: ISpeechConfig[] | string;
  cache?: {[key:string]: any};
}

