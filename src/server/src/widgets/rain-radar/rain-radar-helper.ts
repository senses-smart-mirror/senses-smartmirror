import { IWidget } from "src/lib/types";
import request from 'request';

export class RainRadar extends WidgetHelper {
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
  private addSocketListener() {
    super.addSocketListener("REQUEST_RAIN_DATA", this.handleListener.bind(this));
  }

  /*
  *
  */
  getRainData() {
    const setting = this.getSettingValue('lat_long');
    if ( ! setting ) return;

    const latLong = setting.split(',');
    const lat = latLong[0];
    const long = latLong[1];
    const url = `https://gpsgadget.buienradar.nl/data/raintext/?lat=${lat}&lon=${long}`;

    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter('BROADCAST_RAIN_DATA', cacheItem.data);
      return;
    }

    request(url, (err, res, body) => {
      Logger.log('[rain-radar] - Performing API call.', url);

      if (err) {
        Logger.log('[Rain Radar]', err);
        this.addEmitter('BROADCAST_RAIN_DATA', { error: true });
        return;
      }

      /*
      * Enable the next line for dummy rain test data.
      */
      // body="077|10:05\n000|10:10\n055|10:15\n055|10:20\n078|10:25\n000|10:30\n066|10:35\n034|10:40\n035|10:45\n087|10:50\n75|10:55\n090|11:00\n099|11:05\n034|11:10\n056|11:15\n055|11:20\n092|11:25\n087|11:30\n050|11:35\n000|11:40\n000|11:45\n000|11:50\n000|11:55\n077|12:00\n";

      let data = this.formatData(body);

      const cacheItem = {
        timestamp: Date.now(),
        data: data
      }

      this.addToCache(cacheItem);
      this.addEmitter('BROADCAST_RAIN_DATA', data);
    });
  }

  /*
  *
  */
  formatData(data: string): object {
    const lines = data.split('\n').slice(0,-1);
    const combined:any = [];
    const timestamps: any = [];
    const rainDrops: any = [];
    let itIsRaining = false;
    let startRaining = null;
    let stopsRaining = null;
    let rainStartsDecided = false;
    let rainStopDecided = false;

    lines.forEach((line, key) => {
      var value = line.split('|');

      const itensity = Math.pow(10,((parseInt(value[0])-109)/32));
      const item = {
        rain: itensity,
        timestamp: value[1]
      }

      rainDrops.push(item.rain);
      timestamps.push(item.timestamp);
      combined.push(item);

      // check when it will start to rain
      if ( itensity >= 0.01 && !rainStartsDecided ) {
        rainStartsDecided = true;
        startRaining = value[1];
      }

      // check if its raining already
      if ( key === 0 && itensity >= 0.1) {
         itIsRaining = true;
      }

      // check when stops to rain
      if ( rainStartsDecided && itensity < 0.1 && !rainStopDecided ) {
        stopsRaining = value[1];
        rainStopDecided = true;
      }
    });

    const retVal = {
      combined: combined,
      rainDrops: rainDrops,
      timestamps: timestamps,
      startRaining: startRaining,
      itIsRaining: itIsRaining,
      stopsRaining: stopsRaining
    }

    return retVal;
  }

  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;

    this.getRainData();
    clearInterval(this.interval);
    this.interval = setInterval(
      this.getRainData.bind(this),
      this.getSettingValue("interval")
    );
  }
}

module.exports = RainRadar;
