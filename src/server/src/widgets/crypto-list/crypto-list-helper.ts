import { IWidget } from "src/lib/types";
const request = require("request");

export class CryptoList extends WidgetHelper {
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
    super.addSocketListener("REQUEST_CRYPTO_LIST", this.handleListener.bind(this));
  }

  /*
  *
  */
  getCryptoData() {
    let coins = this.getSettingValue('currencies');
    let counter = this.getSettingValue('conversion');

    if ( ! coins ) {
      this.addEmitter('BROADCAST_CRYPTO_LIST', {error: 'no_coins'});
      return;
    }

    if ( coins ) {
      coins = coins.replace(/, /g, ',');
    }

    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coins}&tsyms=${counter}`;

    const cacheItem = this.getFromCache();
		if ( cacheItem ) {
			this.addEmitter('BROADCAST_CRYPTO_LIST', cacheItem.data);
			return;
		}

    request(url, (err, res) => {
      Logger.log('[crypto-list]: Performing api call:', url)
      if (err) {
        Logger.log('[Crypto List] - error:', err);
        this.addEmitter('BROADCAST_CRYPTO_LIST', {error: true});
        return;
      }

      let data;
      try {
        data = JSON.parse(res.body);
      } catch(e) {
        Logger.log('[Crypto List] - parse error:', res.body);
      }

      const cacheItem = {
      	timestamp: Date.now(),
      	data: data
      }

      this.addToCache(cacheItem);
      this.addEmitter('BROADCAST_CRYPTO_LIST', data);
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

module.exports = CryptoList;
