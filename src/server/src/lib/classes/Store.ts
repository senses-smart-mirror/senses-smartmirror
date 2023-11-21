import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';

import { IWidgetData } from "../types/WidgetData";
import Logger from "../helpers/logger";

export default class Store {
  static widgets: IWidgetData[] = [];

  /*
  * add widget to store
  */
  static addWidget(widgetData: IWidgetData): void {
    let index = _.findIndex(this.widgets, {
      name: widgetData.name,
    });

    if (index === -1) {
      this.widgets.push(widgetData);
    } else {
      this.widgets[index] = widgetData;
    }

    Logger.log("[Store] - Widget stored:", widgetData.name);

    this.save().then((res) => {
      if (res) {
        Logger.log('[Store] - Store configration file succesfully saved');
      }
    }).catch((err) => {
      Logger.error('[Store] - Saving store (components) failed.', err);
    })
  };

  /*
  * retreive widget from store
  */
  static getWidget(widgetName: string): IWidgetData | undefined {
    this.load();

    const result = _.find(this.widgets, { name: widgetName });

    if (result) {
      Logger.log("[Store] - Found widget in store:", result.name);
      return result;
    } else {
      Logger.log("[Store] - Widget not found in store:", widgetName);
    }
  }


  /*
  * save store
  */
  static save(): Promise<any> {
    const contents = `${JSON.stringify(this.widgets, null, 2)}`;

    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(global.CONFIG_PATH, "stored-components.json"), contents, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      }
      );
    });
  }

  /*
  * load store
  */
  static load(): void {
    const PATH = path.join(global.CONFIG_PATH, "stored-components.json");

    try {
      if (fs.existsSync(PATH)) {
        Logger.log("[Store] - Opening Widget Storage..");
        // @ts-ignore
        this.widgets = JSON.parse(fs.readFileSync(PATH), "utf-8");
      } else {
        this.widgets = [];
      }
    } catch (e) {
      this.widgets = [];
    }
  }
}
