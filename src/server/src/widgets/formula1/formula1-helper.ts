import Axios from "axios";

const BASE_URL = 'http://ergast.com/api/f1';
const OPTIONS = {
  contentType: "application/json"
};

class Formula1 extends WidgetHelper {

  constructor(data) {
    super(data);

    this._addSocketListener();
  }

  afterStart(data) {
    this.settings = data.settings;
  }

  /*
  *
  */
  afterStop() {
  }

  /*
  *
  */
  afterReload() {

  }

  /*
  *
  */
  _addSocketListener() {
    this.addSocketListener('REQUST_FORMULA1_DATA', this.handleListener.bind(this));
  }


  /*
  *
  */
  private handleListener() {
    Logger.log('[Formula 1] - Getting data..');

    this.getFormula1Data();

    if ( this.interval ) {
			clearInterval(this.interval);
		}

		this.interval = setInterval(this.getFormula1Data.bind(this), this.getSettingValue('interval') || 60000);
  }

  private async getFormula1Data() {
    let formula1Data:any = {};

    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter("BROADCAST_FORMULA1_DATA", cacheItem.data );
      return;
    }

    if (this.getSettingValue('showDriverStandings')) {
      const url = this.generateUrl('driver');

      try {
        Logger.log('[Formula 1]: Performing API call:', url.replace(BASE_URL, ''))
        const result = await Axios.get(url);

        if ( result.data && result.data.MRData && result.data.MRData.StandingsTable) {
          formula1Data.driverStandings = result.data.MRData.StandingsTable.StandingsLists[0];
          formula1Data.driverStandings.DriverStandings.splice(this.getSettingValue('driverStandingsLimit'))
        } else {
          formula1Data.driverStandings = [];
        }
      } catch (e) {
        Logger.error('[Formula 1]', e, url);
      }
    }

    if (this.getSettingValue('showConstructorStandings')) {
      const url = this.generateUrl('constructor');

      try {
        Logger.log('[Formula 1]: Performing API call:', url.replace(BASE_URL, ''))
        const result = await Axios.get(url);

        if ( result.data && result.data.MRData && result.data.MRData.StandingsTable) {
          formula1Data.constructorStandings = result.data.MRData.StandingsTable.StandingsLists[0];
          formula1Data.constructorStandings.ConstructorStandings.splice(this.getSettingValue('constructorsStandingsLimit'))
        } else {
          formula1Data.constructorStandings = [];
        }
      } catch (e) {
        Logger.error('[Formula 1]', e, url);
      }
    }

    if (this.getSettingValue('showRaceSchedule')) {
      const url = BASE_URL + '/2022.json';

      try {
        Logger.log('[Formula 1]: Performing API call:', url.replace(BASE_URL, ''))
        const result = await Axios.get(url);

        if ( result.data && result.data.MRData && result.data.MRData.RaceTable) {
          formula1Data.raceTable = result.data.MRData.RaceTable;
        } else {
          formula1Data.raceTable = [];
        }
      } catch (e) {
        Logger.error('[Formula 1]', e, url);
      }
    }

    if (this.getSettingValue('showLastRaceResult')) {
      const url = BASE_URL + '/current/last/results.json';

      try {
        Logger.log('[Formula 1]: Performing API call:', url.replace(BASE_URL, ''))
        const result = await Axios.get(url);

        if ( result.data && result.data.MRData && result.data.MRData.RaceTable) {
          formula1Data.raceResult = result.data.MRData.RaceTable.Races[0];
          formula1Data.raceResult.Results.splice(this.getSettingValue('showLastRaceResultLimit'))
        } else {
          formula1Data.raceResult = [];
        }
      } catch (e) {
        Logger.error('[Formula 1]', e, url);
      }
    }

    const newCacheItem = {
      timestamp: Date.now(),
      data: formula1Data
    }
    this.addToCache(newCacheItem);

    this.addEmitter("BROADCAST_FORMULA1_DATA", formula1Data);
  }

  /*
  *
  */
  private generateUrl(type: string, year = 'current'): string {
    const customYear = this.getSettingValue('year');
    const currentYear = new Date().getFullYear();

    if ( customYear !== currentYear ) {
      year = customYear;
    }

    return BASE_URL + `/${year}/${type}Standings.json`;
  }
}

module.exports = Formula1;
