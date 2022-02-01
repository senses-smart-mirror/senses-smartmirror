import request from 'request';
import querystring from 'querystring';
import ip from 'ip';
import path from "path";
import { IWidget } from 'src/lib/types';

const generateRandomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class Spotify extends WidgetHelper {
	needLogin = true;

	redirectionUrl = 'https://senses-smartmirror.com/oauth/spotify';
	stateKey = 'spotify_auth_state';

  constructor(data: IWidget) {
    super(data);

		this._addSocketListener();
		this._setupEndpoints();
	}

	/*
	*
	*/
  afterStart(data: IWidget): void {
		this.settings = data.settings;

		this.clientId = this.getSettingValue("clientId");
		this.clientSecret = this.getSettingValue("clientSecret");
	}

	/*
	*
	*/
	afterReload() {
		this._addSocketListener();
		this._setupEndpoints();

		this.clientId = this.getSettingValue("clientId");
		this.clientSecret = this.getSettingValue("clientSecret");
	}

	/*
	*
	*/
	_setupEndpoints() {
		this.addGetRoute('/spotify/close', (req, res, next) => {
		  res.sendFile(path.join(__dirname, '../../views/close.html'))
		});

		this.addGetRoute('/spotify/login', this._loginHandler.bind(this));
		this.addGetRoute('/spotify/callback', this._callbackHandler.bind(this));
	}

	/*
	*
	*/
	_addSocketListener() {
		this.addSocketListener('REQUEST_SPOTIFY_DATA', this._handleListener.bind(this));
	}

	/*
	*
	*/
	_callbackHandler(req, res) {
		const code = req.query.code || null;

		res.clearCookie(this.stateKey);
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: this.redirectionUrl,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'))
			},
			 json: true
		};

		request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				this.updateSetting({name: "accessToken", value: body.access_token});
				this.updateSetting({name: "refreshToken", value: body.refresh_token});

				// update component
				this.save();

				this._broadCastSpotifyInfo();
				res.redirect('/spotify/close');
			} else {
				res.send('ERROR - please try again in the app: ' + body.error_description);
			}
		});
	}

	/*
	*
	*/
	_loginHandler(req, res) {
		if ( ! this.needLogin ) {
			return this.sendResponse(res, 200, "[Spotify] - Token known already. The Spotify widget is setup successfully. You don't have to authenticate again.");
		}

		const state = generateRandomString() +`url${ip.address()}url`;
		res.cookie(this.stateKey, state);

		const scope = 'user-read-private user-read-currently-playing user-read-playback-state';
		res.redirect('https://accounts.spotify.com/authorize?' +
			querystring.stringify({
				response_type: 'code',
				client_id: this.clientId,
				scope: scope,
				redirect_uri: this.redirectionUrl,
				state: state,
			})
		);
	}


	/*
	*
	*/
	_handleListener() {
		if ( ! this.getSettingValue('show') ) return;

		const ACCESS_TOKEN = this.getSettingValue("accessToken");
		const REFRESH_TOKEN = this.getSettingValue("refreshToken");

		if ( ! this.clientId.length || ! this.clientSecret.length ) {
			return this.addEmitter('BROADCAST_SPOTIFY_INFO', {error: "missing_ids"})
		}

		if ( ! ACCESS_TOKEN.length ) {
			if ( ! REFRESH_TOKEN.length ) {
				this.addEmitter('BROADCAST_SPOTIFY_INFO', {error: "missing_tokens"})
				this.needLogin = true;
				return;
			} else {
				this._renewToken().then(() => {
					Logger.log('[Spotify] - Success: refreshed token');
					this.broadCastSpotifyInfo();
				});
				return;
			}
		}

		this.needLogin = false;

		// broadcast the info
		this._broadCastSpotifyInfo();

		// clear interval before we start new one
		if ( this.interval ) {
			clearInterval(this.interval);
		}

		this.interval = setInterval(this._broadCastSpotifyInfo.bind(this), this.getSettingValue('interval') || 10000);
	}

	/*
	*
	*/
	_renewToken() {
		const authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			headers: {
				'Authorization': 'Basic ' + (new Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'))
			},
			form: {
				grant_type: 'refresh_token',
				refresh_token: this.getSettingValue('refreshToken')
			},
			json: true
		};

		return new Promise((resolve, reject) => {
			request.post(authOptions, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					this.updateSetting({name: "accessToken", value: body.access_token});
					this.save();

					resolve(body);
				} else {
					Logger.log('[Spotify] - Error: access token expired.', error);
					reject(error);
				}
			});
		});
	}

	/*
	*
	*/
	_broadCastSpotifyInfo() {
		Promise.all([this._getSpotifyPlayerData(), this._getSpotifyDeviceData()])
			.then((res) => {
				this.addEmitter('BROADCAST_SPOTIFY_INFO', {player: res[0], ...res[1]});
			})
			.catch(err => {
				this._renewToken().then(() => {
					Logger.log('[Spotify]: refreshed token');
					this._broadCastSpotifyInfo();
				}).catch(e => {
					Logger.log('[Spotify] - Error: unable to refresh token.', e);
				});
			});
	}

	/*
	*
	*/
	_getSpotifyPlayerData() {
		const options = {
			url: 'https://api.spotify.com/v1/me/player/currently-playing',
			headers: { 'Authorization': 'Bearer ' + this.getSettingValue('accessToken') },
			json: true
		};

		return new Promise((resolve, reject) => {
			Logger.log('[Spotify]: Performing api call.', options.url)
			request.get(options, (error, response, body) => {
				if ( error || ( body && body.error ) ) {
					Logger.error('[Spotify] - error:', error);
					reject(error);
				}
				resolve(body);
			});
		});
	}


	/*
	*
	*/
	_getSpotifyDeviceData() {
		const options = {
			url: 'https://api.spotify.com/v1/me/player/devices',
			headers: { 'Authorization': 'Bearer ' + this.getSettingValue('accessToken') },
			json: true
		};

		return new Promise((resolve, reject) => {
			request.get(options, (error, response, body) => {
				if ( error ) {
					reject(error)
				}
				resolve(body);
			});
		});
	}
}

module.exports = Spotify;
