import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';

import { IWidget } from "../types/Widget";
import { ISetting, IBasicSetting } from "../types/Setting";
import Logger from '../helpers/logger';
import { IWidgetData } from '../types/WidgetData';
import SmartMirrorAPI from './Api';
import { ISpeechConfig } from '../types/Speech';

export default class Widget implements IWidget {
  id: string;
  name: string;
  icon: string;
  helper: boolean;
  settings: ISetting[];
  helperClass: any;
  speech?: string | ISpeechConfig[];

  custom?: boolean;
  author?: string;
  link?: string;
  url?: string;
  version?: string;

  constructor(data: IWidgetData) {
    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.helper = data.helper || false;
    // @ts-ignore
    this.settings = data.settings;
    this.custom = data.custom;
    this.speech = data.speech;

    this.author = data.author;
    this.version = data.version;

    SmartMirrorAPI.addWidget(data);
  }

  /*
  *
  */
  reload() {
    if (!this.helperClass) return;
    this.helperClass.reload(this);
  }


  /*
 * update settings
 */
  saveSettings(newSettings: (ISetting | IBasicSetting)[]): (ISetting | IBasicSetting)[] {
    // @ts-ignore
    this.settings = this.mergeSettings(newSettings);
    return this.settings;
  }

  /*
  *
  */
  stop(): void {
    if (!this.helperClass) return;

    this.helperClass.stop();
  }

  /*
  * getWithoutHelper
  */
  getWithoutHelper(): Widget {
    const widget: Widget = _.cloneDeep(this);
    delete widget.helperClass;
    return widget;
  }

  /*
 *
 */
  getFormattedSettings(): IBasicSetting[] {
    return this.formatSettings(this.settings);
  }


  /*
  * return simplified object of the widget
  */
  // @ts-ignore
  getSimplified(): IWidgetData {
    return {
      id: this.getId(),
      name: this.getName(),
      icon: this.icon,
      settings: this.formatSettings(this.settings),
      helper: this.hasHelper(),
      speech: this.speech as string
    };
  }

  /*
   * returns settings formatted to only name and value
   */
  formatSettings(settings: ISetting[]): IBasicSetting[] {
    let retVal: IBasicSetting[] = [];
    _.forEach(settings, (s) => {
      if (!s.displayOnly) {
        retVal.push({
          name: s.name,
          // @ts-ignore
          value: s.value
        });
      }
    });
    return retVal;
  }

  /*
  * merge settings
  */
  mergeSettings(newSettings: ISetting[]): ISetting[] {
    const settings = _.cloneDeep(this.settings);

    settings.forEach((setting: ISetting) => {
      newSettings.forEach((newSetting: ISetting) => {
        if (setting.name == newSetting.name) {
          setting.value = newSetting.value;
        }
      });
    });

    return settings;
  }

  /*
   * set new id on the widget
   */
  setId(id: string): void {
    this.id = id;
  }

  /*
  * create new id
  */
  createId() {
    this.id = uuid();
  }


  /*
   * return the widget id
   */
  getId(shortId: boolean = false): string {
    return shortId ? this.id.substring(0, 8) : this.id;
  }

  /*
   * return if this widget uses has a helper or not
   */
  hasHelper(): boolean {
    return this.helper || false;
  }

  /*
  *
  */
  getSettings(): ISetting[] {
    return this.settings;
  }

  /*
   * getSettingValue
   */
  getSettingValue(name: string): any {
    const r = _.find(this.settings, { name: name });
    if (r) return r.value;
  }

  /*
   * initiate widget helper
   */
  initiateWigetHelper() {
    if (!this.hasHelper()) return;

    let Helper;
    let helperPath = path.join(__dirname, `../../widgets/${this.name}/${this.name}-helper.js`);

    if (this.custom) {
      helperPath = path.join(__dirname, `../../../widgets/${this.name}/${this.name}-helper.js`);
    }

    try {
      if (fs.existsSync(helperPath)) {
        Helper = require(helperPath);
      } else {
        helperPath = helperPath.replace('.js', '.ts');
        fs.existsSync(helperPath)
        Helper = require(helperPath);
      }
    }
    catch (e) {
      console.log(e)
      Logger.error(`------> [${this.name}] helper class file failed to load or is not present.`);
      return;
    }

    if ( Helper.default ) {
      Helper = Helper.default;
    }

    if (this.isConstructor(Helper)) {
      this.helperClass = new Helper({
        id: this.getId(),
        settings: this.getSettings(),
        name: this.getName(),
        speech: this.speech
      });

      Logger.log(`------> [${this.name}] helper class initiated.`);
    } else {
      Logger.error(`------> [${this.name}] Helper class unable to load.`);
    }
  }


  /*
  * start
  */
  start() {
    if (!this.helperClass) return;

    this.helperClass.start(this);

    Logger.log(`------> [${this.name}] helper started`);
  }

  /*
   * return the name of the widget
   */
  getName(): string {
    return this.name;
  }

  private isConstructor(f: any): boolean {
    try {
      new f();
    } catch (err) {
      if (err.message.indexOf('is not a constructor') >= 0) {
        return false;
      }
    }
    return true;
  }

  /*
  * updateSetting
  */
  updateSetting(settingName: string, value: any) {
    this.settings.forEach((_setting:ISetting) => {
      if ( _setting.name === settingName ) {
        _setting.value = value;
      }
    });
  }
}
