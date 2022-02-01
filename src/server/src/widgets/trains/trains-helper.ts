import { IWidget } from "src/lib/types";
const axios = require('axios')

// By default the NS Api will use this value to determine which data should be fetched.
const TYPE = 'stationV2';

// Default API Limit.
const LIMIT = 100;

// By default we don't need to fetch to many details about the stations.
const DETAILS = false;

// base url for NS api
const baseUrl = 'https://gateway.apiportal.ns.nl/reisinformatie-api/api/'

export class Trains extends WidgetHelper {
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
    super.addSocketListener("REQUEST_TRAINS", this.handleListener.bind(this));
    super.addGlobalListener("REQUEST_TRAINS_STATIONS", this.getStationsListener.bind(this));
  }

  /*
  *
  */
  async getStationsListener() {
    let stations;
    const APIkey: string = this.getSettingValue('apiKey');
    const url: string = baseUrl + 'v2/stations';
    const options: object = {
      headers: {
        'Ocp-Apim-Subscription-Key': APIkey
      }
    }

    if (!APIkey) {
      super.addGlobalEmitter("BROADCAST_TRAINS_STATIONS", { error: true });
      return;
    }

    const cacheItem = this.getFromCache();
    if ( cacheItem ) {
      Logger.log('[trains]: fetching stations from cache.')
      const stations = cacheItem.data;
      super.addGlobalEmitter("BROADCAST_TRAINS_STATIONS", { stations });
      return;
    }

    try {
      Logger.log('[trains]: Performing API call:', url.replace(baseUrl, ''))
      const result = await axios.get(url, options);
      stations = result && result.data ? result.data.payload : [];

      const cacheItem = {
        timestamp: Date.now(),
        data: stations
      }

      this.addToCache(cacheItem);
    } catch (e) {
      stations = { error: true };
      Logger.error('[trains] - Error:', e, url);
    }

    super.addGlobalEmitter("BROADCAST_TRAINS_STATIONS", { stations });
  }

  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;

    this._trainsHandler();
    clearInterval(this.interval);
    this.interval = setInterval(
      this._trainsHandler.bind(this),
      this.getSettingValue('interval') || 30000
    );
  }

  private async _trainsHandler() {
    const APIkey: string = this.getSettingValue('apiKey');
    const arrivalsLimit = `&maxJourneys=${this.getSettingValue('arrivalsLimit') || 5}`;
    const departuresLimit = `&maxJourneys=${this.getSettingValue('departuresLimit') || 5}`;
    const url: string = baseUrl + `v2/arrivals?station=${this.getSettingValue('stationName')}${arrivalsLimit}`;
    const urlDep: string = baseUrl + `v2/departures?station=${this.getSettingValue('stationName')}${departuresLimit}`;
    const urlDisruptions: string = baseUrl + `v3/disruptions/station/${this.getSettingValue('stationName')}`;

    if (!APIkey) {
      this.addEmitter("BROADCAST_TRAINS", { error: "no_api_key" });
      return;
    }

    if (!this.getSettingValue('stationName')) {
      this.addEmitter("BROADCAST_TRAINS", { error: "no_station" });
      return;
    }

    const cacheItem = this.getFromCacheById(url);
    if (cacheItem) {
      this.addEmitter("BROADCAST_TRAINS", { trains: cacheItem.data });
      return;
    }

    const options = {
      headers: {
        'Ocp-Apim-Subscription-Key': APIkey
      }
    }

    let arrivalResult;
    if (this.getSettingValue('showArrivals')) {
      try {
        Logger.log('[trains]: Performing API call:', url.replace(baseUrl, ''))
        arrivalResult = await axios.get(url, options);
      } catch (e) {
        Logger.error('[trains] - Error:', e, url);
      }
    }

    let departureResult;
    if (this.getSettingValue('showDepartures')) {
      try {
        Logger.log('[trains]: Performing API call:', urlDep.replace(baseUrl, ''))
        departureResult = await axios.get(urlDep, options);
      } catch (e) {
        Logger.error('[trains] - Error:', e, urlDep);
      }
    }

    const arrivals = arrivalResult && arrivalResult.data ? arrivalResult.data.payload.arrivals : false;
    const departures = departureResult && departureResult.data ? departureResult.data.payload.departures : false;

    let disruptions;
    if (this.getSettingValue('showDisruptions')) {
      try {
        Logger.log('[trains]: Performing API call:', urlDisruptions.replace(baseUrl, ''))
        disruptions = await axios.get(urlDisruptions, options);
        disruptions = disruptions.data ? disruptions.data : [];

        disruptions = disruptions.filter(item => item.type === "DISRUPTION")
      } catch (e) {
        Logger.error('[trains] - Error:', e, urlDisruptions);
      }
    }

    const trains: any = {
      arrivals,
      departures,
      disruptions
    }

    const newCacheItem = {
      timestamp: Date.now(),
      data: trains,
      id: url,
      name: 'trains'
    };

    this.addToCacheById(newCacheItem);
    this.addEmitter("BROADCAST_TRAINS", { trains });
  }


}

module.exports = Trains;
