
import { ISetting, IBasicSetting } from '../types/Setting';
import { AppSettings } from '../constants/app-settings';

export default class Settings {
  private static globalSettings: ISetting[];

  /*
   * load global settings
   */
  static loadGlobalSettings() {
    this.globalSettings = AppSettings;
  }

  /*
   * get setting value based on name
   */
  static getSettingValue(settings: IBasicSetting[], name: string): any {
    const item:IBasicSetting[] = settings.filter(set => set.name === name);
    if ( item && item[0].value ) return item[0].value;
    return false;
  }

   /*
   * returns global settings
   */
  static getGlobalSettings(): ISetting[] {
    return this.globalSettings;
  }

  /*
   * saves global settings
   */
  static saveGlobalSettings(data: ISetting[]):IBasicSetting[] {
    this.globalSettings = data;
    return this.formatSettings(data);
  }

   /*
   * returns settings formatted to only name and value
   */
  private static formatSettings(settings: ISetting[]): IBasicSetting[] {
    const retVal: IBasicSetting[] = [];
    
    settings.forEach((s) => {
      if (!s.displayOnly) {
        retVal.push({
          name: s.name,
          value: s.value,
        });
      }
    });
    return retVal;
  }

}