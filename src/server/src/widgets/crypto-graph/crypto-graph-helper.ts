import { IWidget } from "src/lib/types";
import request from 'request';

export class CryptoGraph extends WidgetHelper {
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
  afterStop() { }

  /*
   *
   */
  private addSocketListener() {
    super.addSocketListener("REQUEST_CRYPTO_LIST", this.handleListener.bind(this));
  }

  /*
  *
  */
  getCryptoData() {
    let coins = this.getSettingValue('currencies');
    const counter = this.getSettingValue('conversion');

    if ( ! coins ) {
      this.addEmitter('BROADCAST_CRYPTO_LIST', {error: 'no_coins'});
      return;
    }

    if (coins) {
      coins = coins.replace(/, /g, ',').split(',');
    }

    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter('BROADCAST_CRYPTO_LIST', cacheItem.data);
      return;
    }

    const calls: any = [];

    coins.forEach((coin: string) => {
      if (!coin) return;

      let call = this.preformCall(coin, counter);

      calls.push(call);
    });

    Promise.all(calls)
      .then((data) => {
        this.addToCache(cacheItem);
        this.addEmitter('BROADCAST_CRYPTO_LIST', data);
      }).catch((err) => {
        Logger.log('[Crypto List]', err);
        this.addEmitter('BROADCAST_CRYPTO_LIST', { error: true });
      });
  }


  /*
  * preform call
  */
  preformCall(coin: string, counter: string) {
    const type = this.getSettingValue('dataType');
    const limit = this.getSettingValue('limit') || 10;
    const url = `https://min-api.cryptocompare.com/data/v2/histo${type}?fsym=${coin}&tsym=${counter}&limit=${limit}`;

    return new Promise((resolve, reject) => {
      request(url, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        const data = JSON.parse(res.body);
        resolve({
          res: data.Data,
          currency: coin,
          counter: counter
        });
      });
    });
  }



  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;
    
    this.getCryptoData();
    clearInterval(this.interval);
    this.interval = setInterval(
      this.getCryptoData.bind(this),
      this.getSettingValue("interval") || 30000
    );
  }
}

module.exports = CryptoGraph;
