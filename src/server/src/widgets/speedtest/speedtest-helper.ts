const ip = require("ip");
const QRCode = require("qrcode");
const speedTest = require('speedtest-net');

const OPTIONS = {
  acceptLicense: true,
  acceptGdpr: true,
};

export class SpeedTest extends WidgetHelper {
  interval!: ReturnType<typeof setInterval>;

  constructor(data: any) {
    super(data);

    this._addSocketListener();

    this.setupEndpoints();
  }

  /*
   * start the component
   */
  afterStart(data: any) {
    this.settings = data.settings;
  }

  /*
   * addSocketListener
   */
  _addSocketListener() {
    this.addSocketListener("REQUEST_INTERNET_SPEED_DATA", this.handleListener.bind(this)
    );
  }

  /*
  * setup endpoint for custom trigger
  */
  private setupEndpoints() {
    this.addPostRoute("/api/speedtest/trigger", this.handleEndpoint.bind(this));
  }

  /*
   *
   */
  private handleEndpoint(req: Request, res: Response) {
    this.clearCache();
    clearInterval(this.interval);

    this.speedtestHandler();
    Logger.log("[Speedtest] - Success: trigger new test.");
    this.sendResponse(res, 200, "success");
  }

  /*
   * handleListener
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;

    this.speedtestHandler();
    clearInterval(this.interval);
    this.interval = setInterval(
      this.speedtestHandler.bind(this),
      this.getSettingValue("interval") || 60000
    );
  }

  private async speedtestHandler() {
    this.addEmitter("BROADCAST_INTERNET_SPEED_DATA_ISLOADING");

    let cacheItem;
    let data;

    cacheItem = this.getFromCache();
		if ( cacheItem ) {
			this.addEmitter('BROADCAST_INTERNET_SPEED_DATA', cacheItem.data);
			return;
		}

    try {
      Logger.log('[Speedtest] - Performing test...');
      const speed = await speedTest(OPTIONS);

      data = {
        download: Math.round(speed.download.bandwidth*0.000008),
        upload: Math.round(speed.upload.bandwidth*0.000008),
        ping: speed.ping.latency,
        server: {name: speed.server.name, location: speed.server.location}
      }
    } catch (err) {
      Logger.error(`[Speedtest] - error: `, err.message);
    }

    cacheItem = {
      timestamp: Date.now(),
      data: data
    }

    this.addToCache(cacheItem);
    this.addEmitter("BROADCAST_INTERNET_SPEED_DATA", data);
  }

  /*
   * afterStop
   */
  afterStop() { }

  /*
   * afterReload
   */
  afterReload() { }
}

module.exports = SpeedTest;
