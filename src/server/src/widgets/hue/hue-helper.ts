const request = require('request');
import Axios from "axios";

class Hue extends WidgetHelper {
	bridgeIp = '';
	userId = '';
	interval = null;
	userIdInterval = null;

  constructor(data) {
		super(data);

		this._addSocketListener();
	}

	afterStart(data) {
		this.settings = data.settings;

		this.userId = this.getSettingValue('userId');
	}

	/*
	*
	*/
	afterStop() {
		clearInterval(this.userIdInterval);
	}

	/*
	*
	*/
	afterReload() {
		clearInterval(this.userIdInterval);
	}

	/*
	*
	*/
	private _addSocketListener() {
		this.addSocketListener('REQUEST_HUE_DATA', this.handleListener.bind(this));
	}

	/*
	*
	*/
	private broadcastHUEInfo() {
		this.getHueData();
	}

	/*
	*
	*/
	private handleListener() {
		if ( ! this.getSettingValue('show') ) return;

		if ( this.bridgeIp.length == 0 ) {
			this.getBridgeIp().then(res => {
				if ( res[0] && res[0].internalipaddress.length ) {
					Logger.log('[HUE] - Found bridge ip address');
					this.updateSetting({name: "bridgeIp", value: res[0].internalipaddress});

					// after updating setting, save the widget in the config
					this.save();

					this.bridgeIp = this.getSettingValue('bridgeIp');
					this.handleListener();
				} else {
					Logger.log('[HUE] - error: no brigde IP found automatically.');
					this.addEmitter('BROADCAST_HUE_INFO', {error: "no_address_found"});
				}
			}).catch(err => {
				Logger.log('[HUE] - error: couldn\'t connect to HUE services.');
				this.addEmitter('BROADCAST_HUE_INFO', {error: "no_connection"});
			});
			return;
		}

		if ( ! this.userId || ! this.userId.length ) {
			Logger.log('[HUE] - error: no user id found, trying to get one.');
			this.getUserId();
			return;
		}

		this.broadcastHUEInfo();
		if ( this.interval ) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(this.broadcastHUEInfo.bind(this), this.getSettingValue('interval'));
	}

	/*
	*
	*/
	private getBridgeIp() {
		return new Promise((resolve, reject) => {
			request.get('https://discovery.meethue.com/', (error, response, body) => {
				if ( error || body === undefined ) return reject(error)
				resolve(JSON.parse(body));
			});
		});
	}

	/*
	*
	*/
	private getUserId() {
		clearInterval(this.userIdInterval);

		this.pollUserId();
		this.userIdInterval = setInterval(this.pollUserId.bind(this), 5000);
	}

	/*
	*
	*/
	private pollUserId() {
		let url = "http://" + this.getSettingValue('bridgeIp') + "/api/";
		let form = JSON.stringify({"devicetype": "my_hue_app#smartmirror"});

		request.post(url, {form}, (error, response, body) => {
			let data = JSON.parse(body);

			if ( data[0].error ) {
				Logger.log('[HUE] - polling for link press...');
				this.addEmitter('BROADCAST_HUE_INFO', {"error": "press_bridge"})
			} else {
				Logger.log('[HUE] - retreived user id from bridge');
				this.updateSetting({name: "userId", value: data[0].success.username});
				this.save();

				this.userId = this.getSettingValue('userId');
				this.broadcastHUEInfo();
			}
		});
	}

	/**
	*
	*/
	private async getHueData() {
		const baseUrl = "http://" + this.getSettingValue('bridgeIp') + "/api/" + this.getSettingValue('userId');
		const groupsUrl = baseUrl + "/groups";
		const lightsUrl = baseUrl + "/lights";
		const hueData = {
			groups: null,
			lights: null
		}

		try {
			Logger.log('[Hue]: Performing API call:', groupsUrl)
			const result = await Axios.get(groupsUrl);

			hueData.groups = result.data || [];
		} catch (e) {
			Logger.error('[Hue]', e, groupsUrl);
		}

		try {
			Logger.log('[Hue]: Performing API call:', lightsUrl)
			const result = await Axios.get(lightsUrl);
			hueData.lights = result.data || [];
		} catch (e) {
			Logger.error('[Hue]', e, lightsUrl);
		}

		this.addEmitter('BROADCAST_HUE_INFO', hueData);
	}
}

module.exports = Hue;
