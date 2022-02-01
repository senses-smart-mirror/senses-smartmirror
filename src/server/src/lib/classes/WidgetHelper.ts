import _ from "lodash";

import { Response } from 'express';

import SmartMirrorAPI from './Api';
import Logger from "../helpers/logger";
import { IWidget } from "../types/Widget";
import { IBasicSetting, ISetting } from "../types/Setting";
import { IWidgetHelper } from "../types/WidgetHelper";
import { ISpeechConfig } from "../types/Speech";
import { IWidgetData } from "../types";

/*
 * Component class
 */
abstract class WidgetHelper implements IWidgetHelper {
  interval?: ReturnType<typeof setInterval>;
  id: string;
  name: string;
  settings: ISetting[] | IBasicSetting[];
  cache: { [key: string]: any; };
  speech: ISpeechConfig[] | string;

  constructor(data: IWidget) {
    this.id = data.id;
    this.name = data.name;
    this.settings = data.settings;
    this.cache = {};
    this.speech = data.speech;
  }

  abstract afterReload(input: ISetting[]): void;

  abstract afterStart(input: IWidget): void;

  abstract afterStop(input: IWidget): void;


  /*
  *
  */
  addSpeechListeners(data: { functionName: string, function: Function }) {
    if (!data || !data.function) return;

    if (this.speech && Array.isArray(this.speech)) {
      this.speech.forEach((_s: ISpeechConfig) => {
        if (_s.functionName === data.functionName) {
          _s.function = data.function;
          SmartMirrorAPI.addSpeechListeners(_s);
        }
      });
    }
  }


  /*
   * reload widget data & settings
   */
  reload(widgetData: IWidget): void {
    this.settings = widgetData.getSettings();

    if (this.afterReload) {
      this.afterReload(widgetData.getSettings());
    }

    if ( ! this.getSettingValue('show') ) {
      this.stop(widgetData);
    } else {
      this.start(widgetData);
    }

    this.clearCache();

    Logger.log('[Widget Helper] - Widget reloaded:', this.name);
  }

  /*
  *
  */
  start(widgetData: IWidget): void {
    this.id = widgetData.id;

    if (this.afterStart) {
      this.afterStart(widgetData);
    }
  }

  /*
   * Stop any active interval on the component
   */
  stop(widgetData?: IWidget): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.afterStop) {
      this.afterStop(widgetData);
    }

    Logger.log('[Widget Helper] ------> Widget helper stopped:', this.name);
  }


  /*
   * getSetting
   */
  getSetting(name: string): ISetting | undefined {
    return _.find(this.settings, { name: name });
  }

  /*
  * returns current installed version.
  */
  getVersion() {
    return SmartMirrorAPI.getVersion();
  }

  /*
   * getSettingValue
   */
  getSettingValue(name: string): any {
    const r = _.find(this.settings, { name: name });
    // TODO: refactor this
    // Some setting are saved as object {value: string, label:string}
    // For those cases we use: value.value
    if (r) return r.value && r.value.value ? r.value.value : r.value;
  }

  /*
  * save widget
  */
  save() {
    Logger.log('[Widget helper] - saving widget method called.')
    SmartMirrorAPI.saveWidget(this);
  }

  /*
  *
  */
  getId(): string {
    return this.id;
  }

  /*
  *
  */
  getName(): string {
    return this.name || '';
  }

  /*
  *
  */
  addToCache(item: {timestamp: string, data: object}): void {
    this.cache[this.name] = item;
  }

  /*
  *
  */
  clearCache(): void {
    Logger.log('[Widget Helper] - Cache cleared for:', this.name);
    delete this.cache[this.name];

    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].name === this.name) {
        delete this.cache[key];
      }
    });
  }

  /*
  *
   */
  getFromCache(): any {
    const timestamp = Date.now();

    if (!this.cache) return false;

    const item = this.cache[this.name];

    if (item && item.timestamp && timestamp - item.timestamp < 60000) {
      Logger.log(`[Widget Helper] - [${this.name}]: Fetching items from cache.`);
      return item;
    } else {
      return false;
    }
  }

  /*
  * add to cache with a specific id
  */
  addToCacheById(item: any): void {
    this.cache[item.id] = item;
  }

  /*
  * widget is loading
  */
  broadcastWidgetIsLoading() {
    const hash = this.id.substring(0, 8);
    SmartMirrorAPI.emit(`BROADCAST_IS_LOADING-${hash}`, {loading: true});
  }

  /*
  * get item from cache based on given id
  */
  // TODO: refactor this timestamp duplicated code and use other getFromCache method.
  getFromCacheById(id: string | number) {
    if (!this.cache) return false;

    const timestamp = Date.now();
    const item = this.cache[id];

    if (item && item.timestamp && timestamp - item.timestamp < 30000) {
      Logger.log(`[Widget Helper] - [${this.name}]: Fetching items from cache by id.`);
      return item;
    } else {
      return false;
    }
  }

  /*
  *
  */
  addSocketListener(name: string, callback: Function): void {
    const hash = this.id.substring(0, 8);
    SmartMirrorAPI.addSocketListener(name + '-' + hash, callback);
  }

  /*
  *
  */
  addGlobalListener(name: string, callback: Function): void {
    SmartMirrorAPI.addSocketListener(name, callback);
  }

  /*
  *
  */
  addGetRoute(path: string, handler: Function) {
    SmartMirrorAPI.addGetRoute(path, handler);
  }

  /*
  *
  */
  addPostRoute(path: string, handler: Function) {
    SmartMirrorAPI.addPostRoute(path, handler);
  }

  /*
  *
  */
  sendResponse(res: Response, status: number, data: any): Response {
    if (_.isArray(data.data)) {
      data.data = data.data.map(function (item: any) {
        return item;
      });
    }
    return res.status(status).send(data);
  }

  /*
  *
  */
  addEmitter(name: string, data: any): void {
    const hash = this.id.substring(0, 8);
    SmartMirrorAPI.emit(name + '-' + hash, data);
  }

  /*
  *
  */
  addGlobalEmitter(name: string, data: any): void {
    SmartMirrorAPI.emit(name, data);
  }

  /*
   * setSetting
   */
  updateSetting(setting: ISetting): void {
    if (!setting.name) return;

    const item = _.find(this.settings, { name: setting.name });

    if (item) {
      _.forEach(this.settings, (s) => {
        if (s.name === setting.name) {
          s.value = setting.value;
        }
      });
    } else {
      Logger.log('[Widget Helper] - Adding setting on widget:', this.name);
      this.settings.push(setting);
    }
  }

  /*
  *
  */
  getProfile() {
    return SmartMirrorAPI.getProfile();
  }
}

export default WidgetHelper;
