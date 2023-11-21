const request = require("request");
import { IWidgetData } from "src/lib/types";

interface IVersion {
  version: string;
}

export class ViewerViewer extends WidgetHelper {
  constructor(data: IWidgetData) {
    super(data);

    this.addSocketListener();
  }

  /*
   *
   */
  afterStart(data: IWidgetData): void {
    this.settings = data.settings;
  }

  /*
   *
   */
  afterReload() {
    this.addSocketListener();
  }


  /*
   *
   */
  private addSocketListener(): void {
    super.addSocketListener("REQUEST_VERSION_DATA", this.handleListener.bind(this));
  }

  /*
   *
   */
  private handleListener(): void {

    const cacheItem = this.getFromCache();
    if ( cacheItem ) {
      this.addEmitter("BROADCAST_VERSION_DATA", cacheItem.data);
      return;
    }


    this.fetchLastVersion().then((data: IVersion) => {
      const version = {
        current: this.getVersion(),
        latest: data.version,
      };

      const cacheItem = {
        timestamp: Date.now(),
        data: version
      }

      this.addToCache(cacheItem);
      this.addEmitter("BROADCAST_VERSION_DATA", version);
    });
  }

  private fetchLastVersion(): Promise<any> {
    return new Promise((resolve, reject) => {
      request("https://senses-smartmirror.com/version/version.txt", { json: true }, (err: any, res: any, body: any) => {
        if (body) {
          resolve(body);
        } else {
          reject(err);
        }
      });
    });
  }
}

module.exports = ViewerViewer;
