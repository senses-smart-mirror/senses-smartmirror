import { IWidget } from "./Widget";
import { IBasicSetting } from "./Setting";

export interface ISimplifiedWidget extends IWidget {
  settings: IBasicSetting[];
}

export interface ISimplifiedCustomWidget {
  name: string;
  url: string;
  id: string;
}