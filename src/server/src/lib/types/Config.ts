
import { IBasicSetting } from './Setting';
import { IWidgetData } from './WidgetData';
import { IModule } from './Module';
import { IProfile } from './Profile';

export interface IColumn {
  id: String;
  name?: String
  rowSettings?: {[key:string]: string};
  topComponents: IWidgetData[];
  bottomComponents: IWidgetData[];
}

export interface IConfig {
  profiles: IProfile[];
  settings: IBasicSetting[];
  columns: IColumn[];
  lastUpdate: string | null;
  version: string;
  customWidgets: IWidgetData[];
  modules: IModule[];
  profile?: IProfile;
}