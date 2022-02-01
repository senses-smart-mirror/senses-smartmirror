import si from 'systeminformation';
import os from 'os';
import { IWidget } from 'src/lib/types';
import wifi from 'node-wifi';

class Stats extends WidgetHelper {

	constructor(data: IWidget) {
		super(data);

		this._addSocketListener();

		wifi.init({
			iface: null
		});
	}

	/*
	 *
	 */
	afterStart(data: any) {
		this.settings = data.settings;
	}


	/*
	*
	*/
	afterReload() {
		this._addSocketListener();
	}

	/*
	*
	*/
	_addSocketListener() {
		this.addSocketListener('REQUEST_SERVER_STATS', this._handleListener.bind(this));
	}

	/*
	*
	*/
	_handleListener() {
		if ( ! this.getSettingValue('show') ) return;

		this._getStatsHandler();
		clearInterval(this.interval);
		this.interval = setInterval(this._getStatsHandler.bind(this), this.getSettingValue('interval'));
	}

	/*
	*
	*/
	_getStatsHandler() {
		this._getStats()
			.then(res => this.addEmitter('BROADCAST_SERVER_STATS', res));
	}

	/*
	*
	*/
	async _getStats() {
		Logger.log('[Stats] - Fetching data...');
		
		let data: any = {};

		// uptime
		data["uptime"] = process.uptime();
		data["os_uptime"] = os.uptime();
		data["ip_address"] = '';

		const networkInterfaces = os.networkInterfaces();
		if ( networkInterfaces && networkInterfaces["en0"] ) {
			const envs = networkInterfaces["en0"];

			envs.forEach(item => {
				if ( item.family === 'IPv4') {
					data["ip_address"] = item.address;
				}
			});
		}

		// cpu temp
		let temp = si.cpuTemperature((res) => {
			data["cpu_temp"] = { main: Math.round(res.main), max: Math.round(res.max) }
		});

		// memory
		let mem = si.mem((res) => {
			data["memory"] = { total: res.total, free: res.free }
		});

		// disk information
		let disklayout = si.diskLayout((res) => {
			data["disks"] = { size: res[0] ? res[0].size : 0 }
		});

		// os information
		let osInfo = si.osInfo((res) => {
			data["os"] = { platform: res.platform, distro: res.distro, release: res.release, hostname: res.hostname }
		});

		let internetInfo = wifi.getCurrentConnections((err:any, res:any) => {
			if ( err ) {
				Logger.error("[Stats] - error: failed to get internet connection data");
			} else {
				data["internet"] = res ? res[0] : false;
			}
		});

		return Promise.all([temp, mem, disklayout, osInfo, internetInfo])
			.then(() => { return data });
	}
}

module.exports = Stats;