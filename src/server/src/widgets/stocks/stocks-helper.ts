import { IWidget } from "src/lib/types";
const request = require("request");

const BASE_URL =  "https://finnhub.io/api/v1/quote";

export class Stocks extends WidgetHelper {
  constructor(data: IWidget) {
    super(data);

    this.addSocketListener();
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
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
  afterStop() {}

  /*
   *
   */
  private addSocketListener() {
    super.addSocketListener("REQUEST_STOCKS", this.handleListener.bind(this));
  }

  /*
  *
  */
  getStocksData() {
    const ApiKey = this.getSettingValue("api_key");
    const symbols = this.getSettingValue("symbols");
    const promises: Promise<any>[] = [];

    if ( ! ApiKey ) {
      this.addEmitter('BROADCAST_STOCKS', {error: 'no_apikey'});
      return;
    }

    if ( ! symbols ) {
      this.addEmitter('BROADCAST_STOCKS', {error: 'no_symbol'});
      return;
    }

    const symbolsArray = symbols.replace(' ', '').split(/\s*,\s*/);

    symbolsArray.forEach((symbol:string) => {
      const url = BASE_URL + `?symbol=${symbol}&token=${ApiKey}`;

      promises.push(this.performRequest(url, symbol));
    });

    Promise.all(promises).then(data => {
      this.addEmitter('BROADCAST_STOCKS', data);
    });
  }


  performRequest(url: string, symbol: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Logger.log('[Stocks]: Performing api call:', url)

      request(url, (err, res) => {
        if (err) {
          Logger.log('[Stocks]', err);
          return reject(false);
        }

        if ( res && res.body ) {
          try {
            const data = JSON.parse(res.body);
            return resolve({symbol, data});
          } catch(e) {
            Logger.error('[Stocks] - error', e);
            return reject(false);
          }
        }
      });
    });
  }

  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;

    this.getStocksData();
    clearInterval(this.interval);
    this.interval = setInterval(
      this.getStocksData.bind(this),
      this.getSettingValue("interval") || 30000
    );
  }
}

module.exports = Stocks;
