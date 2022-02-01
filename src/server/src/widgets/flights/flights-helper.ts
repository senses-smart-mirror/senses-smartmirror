import Axios from "axios";
import moment from "moment";
import { IWidget } from "src/lib/types";
import AIRPORTS from './airports.json';
import AIRLINES from './airlines.json';

// base url for NS api
const baseUrl = 'https://api.schiphol.nl/public-flights/';

export class Flights extends WidgetHelper {
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
    super.addSocketListener("REQUEST_FLIGHTS", this.handleListener.bind(this));
  }

  /*
   *
   */
  private handleListener() {
    if (!this.getSettingValue('show')) return;

    this.flightsHandler();
    clearInterval(this.interval);
    this.interval = setInterval(
      this.flightsHandler.bind(this),
      this.getSettingValue('interval') || 30000
    );
  }

  private async flightsHandler(): Promise<any> {
    const APIkey: string = this.getSettingValue('apiKey');
    const AppId: string = this.getSettingValue('appId');

    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter("BROADCAST_FLIGHTS", { flights: cacheItem.data });
      return;
    }

    if (!APIkey || !AppId) {
      this.addEmitter("BROADCAST_FLIGHTS", { error: "no_api_key" });
      return;
    }

    let hoursToAdd = 1;
    if (moment().hours() < 3) {
      hoursToAdd = 9 - moment().hours();
    }

    const limit = this.getSettingValue('limit') || 10;
    const toDateTimeWithExtra = moment().add(hoursToAdd, 'hour');
    const fromDateTime = moment().subtract(10, 'minutes').format("yyyy-MM-DDTHH:mm:ss");
    const fromScheduleDate = moment().format("yyyy-MM-DD");
    const toDateTime = toDateTimeWithExtra.format("yyyy-MM-DDTHH:mm:ss");
    const toDate = toDateTimeWithExtra.format("yyyy-MM-DD");
    const url = baseUrl + 'flights?page=0&includedelays=true&sort=%2BscheduleTime'
      + `&flightDirection=A`
      + '&searchDateTimeField=scheduleDateTime'
      + `&fromDateTime=${fromDateTime}`
      + `&fromScheduleDate=${fromScheduleDate}`
      + `&toDateTime=${toDateTime}`
      + `&toScheduleDate=${toDate}`

    const depUrl = baseUrl + 'flights?page=0&includedelays=true&sort=%2BscheduleTime'
      + `&flightDirection=D`
      + '&searchDateTimeField=scheduleDateTime'
      + `&fromDateTime=${fromDateTime}`
      + `&fromScheduleDate=${fromScheduleDate}`
      + `&toDateTime=${toDateTime}`
      + `&toScheduleDate=${toDate}`

    const options = {
      headers: {
        'Accept': 'application/json',
        'app_id': AppId,
        'app_key': APIkey,
        'ResourceVersion': 'v4'
      }
    }

    let arrivalResult;
    if (this.getSettingValue('showArrivals')) {
      try {
        Logger.log('[flights]: Performing API call:', url.replace(baseUrl, ''))
        arrivalResult = await Axios.get(url, options);
      } catch (e) {
        Logger.error('[flights]', e, url);
      }
    }


    let departuresResult;
    if (this.getSettingValue('showDepartures')) {
      try {
        Logger.log('[flights]: Performing API call:', depUrl.replace(baseUrl, ''))
        departuresResult = await Axios.get(depUrl, options);
      } catch (e) {
        Logger.error('[flights]', e, depUrl);
      }
    }

    let arrivals = arrivalResult && arrivalResult.data ? arrivalResult.data.flights : false;
    let departures = departuresResult && departuresResult.data ? departuresResult.data.flights : false;

    // filter out flights that share the same code.
    if (departures.length) {
      departures = departures.filter((flight: any) => {
        return flight.flightName === flight.mainFlight && (flight.serviceType === 'J' || flight.serviceType === 'C')
      });
    }

    if (arrivals.length) {
      arrivals = arrivals.filter((flight: any) => {
        return flight.flightName === flight.mainFlight && (flight.serviceType === 'J' || flight.serviceType === 'C')
      });
    }

    // if setting is set to only show one flight:
    const filterFlight: string = this.getSettingValue('filter_flight');
    if (filterFlight) {
      arrivals = arrivals.filter((item: any) => item.flightName === filterFlight);
      departures = departures.filter((item: any) => item.flightName === filterFlight);
    }

    // limit the result based on the setting
    if (arrivals) {
      arrivals = arrivals.splice(0, limit);
    }

    if (departures) {
      departures = departures.splice(0, limit);
    }

    let flights = {
      arrivals, departures
    }

    if (this.getSettingValue('show_location') || this.getSettingValue('show_airline')) {
      flights = this.getLocationOrAirlineLabels(flights);
    }

    const newCacheItem = {
      timestamp: Date.now(),
      data: flights
    }
    this.addToCache(newCacheItem);

    this.addEmitter("BROADCAST_FLIGHTS", { flights });
  }

  private getLocationOrAirlineLabels(flights: any) {

    if (flights.arrivals) {
      flights.arrivals.forEach((flight:any) => {
        this.getData(flight);
      });
    }

    if (flights.departures) {
      flights.departures.forEach((flight:any) => {
        this.getData(flight);
      });
    }

    return flights;
  }

  private getData(flight: any): void {
    if ( this.getSettingValue('show_location') ) {
      if ( flight.route && flight.route.destinations ) {
        const location = this.getLocationLabelFromCode(flight.route.destinations[0]);
        flight.locationLabel = location;
      }
    }

    if ( this.getSettingValue('show_airline') ) {
      const airline = this.getAirlineFromCode(flight.prefixIATA);
      flight.airlineLabel = airline;
    }
  }

  private getLocationLabelFromCode(code: string): string {
    const item = Object.keys(AIRPORTS).find(key => AIRPORTS[key].iata === code);
    return AIRPORTS[item] ? AIRPORTS[item].city : '';
  }

  private getAirlineFromCode(code: string): string {
    const item = AIRLINES.find((item:any) => item.iata === code);
    return item ? item.name : '';
  }
}

module.exports = Flights;
