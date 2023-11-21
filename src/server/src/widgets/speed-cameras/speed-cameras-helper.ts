const request = require("request");
import { IWidget } from 'src/lib/types';

class SpeedCamaras extends WidgetHelper {
	intervalTiming = 60000;

  constructor(data: IWidget) {
    super(data);

    this._addSocketListener();
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
    this.settings = data.settings;
  }

	/*
	* after stop
	*/
	afterStop() {
		clearInterval(this.interval);
	}

	/*
	* after reload
	*/
	afterReload() {
		this._addSocketListener();
	}

	/*
	*
	*/
	_addSocketListener() {
		this.addSocketListener('REQUEST_SPEED_CAMERA_DATA', this._handleListener.bind(this));
	}

	_handleListener() {
		if ( ! this.getSettingValue('show') ) return;

		if ( this.interval ) {
			clearInterval(this.interval);
		}

		this._scrapeSites();
		this.interval = setInterval(this._scrapeSites.bind(this), this.getSettingValue('interval'));
	}

	_scrapeSites() {
		const url = 'https://tesla.flitsmeister.nl/teslaFeed.json';

		const cacheItem = this.getFromCache();
		if ( cacheItem ) {
			this.addEmitter('BROADCAST_SPEED_CAMERAS_DATA', cacheItem.data);
			return;
		} else {
			Logger.log(`[${this.name}]: Performing api call.`, url);
		}

		request(url, (err, res) => {
			if ( err ) {
				Logger.log(`[${this.name}]: error `, err);
				this.addEmitter('BROADCAST_SPEED_CAMERAS_DATA', {error: true});
				return;
			}

			let data;

			try {
				data = JSON.parse(res.body);
			} catch(e) {
				Logger.log(`[${this.name}]: error: fetching speed camera data.`);
				this.addEmitter('BROADCAST_SPEED_CAMERAS_DATA', {error: true});
				return;
			}

			// get & format items
			let resultData;

			if ( data && data.features.length ) {
				resultData = data.features.filter((item: any) => {
					return ( item.properties.road_letter === 'A' && item.properties.name !== 'Trajectcontrole.' && item.properties.type_description === 'speedtrap' ) ? true : false;
				});
			}

			const cacheItem = {
				timestamp: Date.now(),
				data: resultData
			}

			this.addToCache(cacheItem);
			this.addEmitter('BROADCAST_SPEED_CAMERAS_DATA', resultData);
		});
	}

}

module.exports = SpeedCamaras;
