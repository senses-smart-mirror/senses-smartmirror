
import { ISetting, IBasicSetting } from './Setting';
import { ISimplifiedWidget } from './SimplifiedWidget';
import { ISpeechConfig } from './Speech';

export interface IWidget {
  id: string;
  name: string;
  icon: string;
  helper: any;
  settings: ISetting[] | IBasicSetting[];
  isLoading?: boolean;
  speech?: string | ISpeechConfig[];

  custom?: boolean;
  author?: string;
  link?: string;
  url?: string;
  version?: string;

  saveSettings: Function;
  setId: Function;
  getId: Function;
  getName: Function;
  hasHelper: Function;
  initiateWigetHelper: Function;
  reload: (widgetData?: IWidget) => void;
  start: (widgetData?: IWidget) => void;
  stop: (widgetData?: IWidget) => void;
  getSimplified: () => ISimplifiedWidget;
}