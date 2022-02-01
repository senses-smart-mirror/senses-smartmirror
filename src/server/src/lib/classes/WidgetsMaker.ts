import AdmZip from "adm-zip";
import rimraf from "rimraf";
import path from 'path';
import fs from 'fs';
import ip from 'ip';
import _ from "lodash";

import Logger from "../helpers/logger";
import Widget from "./Widget";
import { IBasicSetting, ISetting } from "../types/Setting";

import { DEFAULT_SETTINGS } from '../constants/widget-settings';

import requireUncached from '../helpers/requireUncached';
import { PORT } from "../constants/config";
import { IWidgetData } from "../types/WidgetData";

// registered widgets
import WIDGETS from '../constants/widgets';
import { IWidgetConfig } from "../types/WidgetConfig";
import { IWidget } from "../types/Widget";

class WidgetsMaker {
  private static customWidgets: IWidgetData[] = [];
  private static activeWidgets: Widget[] = [];
  private static widgetModels: IWidgetData[] = [];

  /*
  * set custom widgets
  */
  static setCustomWidget(customWidgets: IWidgetData[]): void {
    Logger.log("[Widgets] - Load all custom widgets:");
    this.customWidgets = customWidgets || [];

    this.customWidgets.forEach(widget => {
      Logger.log(`[Widgets] ---> Loading custom widget: ${widget.name}`);
      this.saveModel(widget);
    });
  }

  /*
  * get custom widgets
  */
  static getCustomWidgets(): IWidgetData[] {
    return this.customWidgets;
  }

  /*
  * get custom widgets simplified
  */
  // TODO: this currently doesn't work. We should seperate the custom widget model out and save that model. 
  // It is now saving this simplified version in the custom widgets which should be the case. IN customwidgets array we need the full widget + model
  static getCustomWidgetsSimplified(): IWidgetData[] {
    return this.customWidgets;
    // return this.customWidgets.map(widget => {
    //   const settings:IBasicSetting[] = widget.settings.map((setting:ISetting) => {
    //     return {
    //       name: setting.name,
    //       value: setting.value
    //     } as IBasicSetting
    //   });

    //   return {
    //     ...widget,
    //     settings,
    //   };
    // });
  }

  /*
  *
  */
  static getWidgetById(widgetId: string | undefined): Widget | undefined {
    const filter = this.activeWidgets.filter(
      (widget) => widget.getId() === widgetId
    );

    if (filter.length) {
      return filter[0];
    } else {
      Logger.error("[Widgets] - widget not found by id: ", widgetId);
      return;
    }
  }

  /*
  *
  */
  static getWidgets(): IWidgetData[] | [] {
    return this.customWidgets;
  }

  /*
  *
  */
  static getAllWidgets(): IWidgetData[] | [] {
    return [...this.widgetModels];
  }


  /*
  *
  */
  static createNewWidgets(widgetsData: IWidgetData[]): void {
    Logger.log("[Widgets] - Starting all active widgets..");

    widgetsData.forEach((widgetData: IWidgetData) => {
      if (widgetData) {
        this.createNewWidget(widgetData);
      }
    });
  }

  /*
   *
   */
  static stopAndRemoveWidget(widgetData: IWidgetData | Widget) {
    const widget: Widget = this.getWidgetById(widgetData.id) as Widget;

    if (widget && widget.hasHelper()) {
      widget.stop();
    }

    this.removeWidget(widget);
  }

  /*
  * stop and remove all widgets
  */
  static stopAndRemoveAllWidgets() {
    this.activeWidgets.forEach((widget) => {
      this.stopAndRemoveWidget(widget);
    });
  }


  /*
  * remove widget
  */
  static removeWidget(widget: Widget) {
    if (!widget) {
      Logger.log(`[Widgets] - Widget not found. Can't remove widget.`);
      return;
    }

    let i = _.findIndex(this.activeWidgets, { id: widget.getId() });
    this.activeWidgets.splice(i, 1);

    Logger.log(`[Widgets] - Widget removed: ${widget.getName()} id: ${widget.getId(true)}`);
  }

  /*
  *
  */
  static loadAllWidgets() {
    Logger.log("[Widgets] - Load all default widgets:");

    WIDGETS.forEach((widgetName: string) => {
      Logger.log('[Widgets] ---> Loading widget:', widgetName);

      let configPath = path.join(__dirname, `../../widgets/${widgetName}/${widgetName}-config.js`);

      let config = this.loadWidgetConfig(configPath, widgetName);

      // add settings
      if (config) {
        config = this.applyDefaultSettings(config);
      }

      this.saveModel(config);
    });
  }


  /*
  *
  */
  static applyDefaultSettings(config: IWidgetData): IWidgetData {
    config.settings = config.settings.concat(DEFAULT_SETTINGS);
    return config;
  }

  /*
  *
  */
  static loadWidgetConfig(path: string, widgetName: string): IWidgetData {
    let config;

    // require widget files
    if (fs.existsSync(path)) {
      config = require(path);
    } else {
      path = path.replace('.js', '.ts');
      if (fs.existsSync(path)) {
        fs.existsSync(path)
        config = require(path);
      }
    }

    if (!config) {
      Logger.error("[Widgets] - Error: Widget configuration file not found:", widgetName)
    }

    return config;
  }

  /*
 * save new widget to the mirror
 */
  static saveCustomWidget(zipFile: any): string {
    Logger.log("[Widgets] - Received widget zipfile:", zipFile.name);

    const extractedName: string = zipFile.name.replace(".zip", "");
    const zip = new AdmZip(zipFile.data);

    // remove the correct widget folder
    this.removeWidgetFolder(extractedName);

    // extract files to fileserver
    zip.extractAllTo("./widgets/" + extractedName, true);

    return extractedName;
  }

  /*
  * initiate new custom widget
  */
  static initiateCustomWidget(widgetName: string): void {
    Logger.log('[Widgets] - Initiating new custom widget:', widgetName);
    let umdFile: string = "";

    fs.readdirSync("./widgets/" + widgetName).forEach((file: any) => {
      if (file.indexOf("umd") > 0) {
        umdFile = file;
      }
    });

    if (!umdFile) {
      Logger.error('[Widgets] - Error: Widget GUI file not found:', widgetName);
    }

    let configPath = path.join(__dirname, `../../../widgets/${widgetName}/${widgetName}-config.js`);

    // require widget files
    if (fs.existsSync(configPath)) {
      var config = requireUncached(configPath);
    } else {
      Logger.error('[Widgets] - Error: configuration for widget not found:', widgetName);
    }

    // apply default settings on widget
    config = this.applyDefaultSettings(config);

    let widgetData: IWidgetData = {
      ...config,
      url: `http://${ip.address()}:${PORT}/${widgetName}/${umdFile}`,
      custom: true,
      id: this.generateId()
    };

    config.custom = true;
    this.saveCustomModel(config);
    this.storeCustomWidget(widgetData as Widget);
  }

  /*
  * store custom widget
  */
  static storeCustomWidget(widget: Widget): void {
    const index = _.findIndex(this.customWidgets, { name: widget.name });
    if (index >= 0) {
      this.customWidgets.splice(index, 1);
    }
    this.customWidgets.push(widget);

    Logger.log('[Widgets] - Stored custom widget.', widget.name);
  }

  /*
  *
  */
  static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /*
   * return all available widgets
   */
  static getAvailableWidgets(): IWidgetData[] {
    return this.widgetModels;
  }

  /*
  * save widget model
  */
  static saveModel(config: IWidgetData): void {
    if (config) {
      this.widgetModels.push(config);
    }
  }

  /*
  *
  */
  static saveCustomModel(config: IWidgetData): void {
    if (config) {

      // if model already found, remove it.
      const widgetModel = this.widgetModels.find((widget: IWidgetData) => {
        return widget.name === config.name;
      });

      if (widgetModel) {
        this.removeWidgetModel(config.name);
      }

      this.saveModel(config);
    }
  }

  /*
  *
  */
  static removeWidgetModel(widgetName: string) {
    this.setWidgetModels(this.widgetModels.filter((widgetModel: IWidgetConfig) => {
      return widgetModel.name !== widgetName;
    }));
  }

  /*
  *
  */
  static setWidgetModels(widgetModels: IWidgetData[]) {
    this.widgetModels = widgetModels;
  }

  /*
  *
  */
  static updateWidgetSetting(widgetName: string, setting: string, value: any) {
    let returnValueWidget;

    this.activeWidgets.forEach(widget => {
      if (widget.getName() === widgetName) {
        widget.updateSetting(setting, value);
        returnValueWidget = widget;
      }
    });

    return returnValueWidget;
  }

  /*
  *
  */
  private static getWidgetModel(widgetName: string): IWidgetData | undefined {
    const models = this.widgetModels;

    const widgetModel = models.find((widget: IWidgetData) => {
      return widget.name === widgetName;
    });

    if (!widgetModel) {
      Logger.error('[Widgets] - Error: Widget model not found:', widgetName);
    }

    return widgetModel;
  }

  /*
  *
  */
  static createNewWidget(widgetData: IWidgetData): Widget | undefined {
    const defaultWidgetModel: (IWidgetData | undefined) = this.getWidgetModel(widgetData.name);

    if (!defaultWidgetModel) return;

    //initiate new widget
    let widget: Widget = new Widget(defaultWidgetModel);

    // create id for new widget
    if (widgetData.id) {
      widget.setId(widgetData.id);
    } else {
      widget.createId();
    }

    if (widgetData.settings) {
      widget.saveSettings(widgetData.settings as ISetting[]);
    }

    Logger.log(`[Widgets] ---> [${widget.getName()}: ${widget.getId(true)}] created`);

    try {
      if (widget.hasHelper()) {
        widget.initiateWigetHelper();

        if (widget.getSettingValue('show')) {
          widget.start();
        }
      }
    } catch (e) {
      Logger.error('[Widgets] - Error starting widget:', e.stack || e);
    }


    this.activeWidgets.push(widget);
    return widget;
  }



  /*
  * remove widget from custom widgets list
  */
  static removeWidgetByName(widgetName: string) {
    // remove from custom widgets
    this.customWidgets.forEach((widget: IWidgetData, index: number) => {
      if (widget.name === widgetName) {
        this.customWidgets.splice(index, 1);
      }
    });

    // remove from active widgets
    this.activeWidgets.forEach((widget: Widget, index: number) => {
      if (widget.getName() === widgetName) {
        this.activeWidgets.splice(index, 1);
      }
    });
  }

  /*
   * return all registerd custom widgets
   */
  static getRegisteredCustomWidgets(): any[] {
    return this.customWidgets.map((widget: IWidgetData) => {
      return {
        name: widget.name,
        version: widget.version,
        icon: widget.icon,
        author: widget.author,
        link: widget.link,
      };
    });
  }

  /*
  *
  */
  static removeCustomWidget(widget: IWidgetData) {
    // stop all active widgets
    this.stopWidgetByName(widget.name);

    // remove from custom widgets list
    this.removeWidgetByName(widget.name);

    // remove folder
    this.removeWidgetFolder(widget.name);

    // remove widget model
    this.removeWidgetModel(widget.name);
  }

  /*
   * remove custom widget folder
   */
  static removeWidgetFolder(folderName: string): void {
    rimraf.sync("./widgets/" + folderName);
  }

  /*
  *
  */
  static stopAllWidgets(): void {
    this.activeWidgets.forEach((widget: Widget) => {
      this.stopWidgetByName(widget.getName());
    });
  }

  /*
  * start all widgets helpers
  */
  static startAllWidgets(): void {
    this.activeWidgets.forEach((widget: Widget) => {
      if (widget.hasHelper()) {
        widget.start();
      }
    });
  }

  /*
  * start a widget by name
  */
  static startWidgetByName(widgetName: string): void {
    Logger.log('[Widgets] - Starting widget:', widgetName);

    this.activeWidgets.forEach(widget => {
      if (widget.getName() === widgetName && widget.hasHelper()) {
        widget.start();
      }
    });
  }

  /*
  * stop a widget by name
  */
  static stopWidgetByName(widgetName: string) {
    let returnValueWidget;

    this.activeWidgets.forEach(widget => {
      if (widget.getName() === widgetName) {

        if (widget.hasHelper()) {
          widget.stop();
        }

        returnValueWidget = widget;
      }
    });

    return returnValueWidget;
  }
}

export default WidgetsMaker;