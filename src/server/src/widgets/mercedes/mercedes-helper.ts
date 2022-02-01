import axios from 'axios';
import request from 'request';
import querystring from 'querystring';
import ip from 'ip';
import path from "path";
import qs from "qs";
import { result } from 'lodash';

const BASE_URL: string = 'https://api.mercedes-benz.com/vehicledata/v2';

const generateRandomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class MercedesMe extends WidgetHelper {
  needLogin = true;
  redirectionUrl = 'https://senses-smartmirror.com/oauth/mercedes';
  stateKey = 'mercedes_auth_state';

  constructor(data) {
    super(data);

    this._addSocketListener();
    this.setupEndpoints();
  }

  afterStart(data) {
    this.settings = data.settings;

    this.clientId = this.getSettingValue("clientId");
    this.clientSecret = this.getSettingValue("clientSecret");
    this.vehicleId = this.getSettingValue('vehicle_id');
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
    this._addSocketListener();
    this.setupEndpoints();

    this.clientId = this.getSettingValue("clientId");
    this.clientSecret = this.getSettingValue("clientSecret");
    this.vehicleId = this.getSettingValue('vehicle_id');
  }

  /*
  *
  */
  private _addSocketListener() {
    this.addSocketListener('REQUEST_MERCEDES_DATA', this.handleListener.bind(this));
  }

  /*
  *
  */
  private setupEndpoints() {
    this.addGetRoute('/mercedes/close', (req, res, next) => {
      res.sendFile(path.join(__dirname, '../../views/close.html'))
    });

    this.addGetRoute('/mercedes/login', this.loginHandler.bind(this));
    this.addGetRoute('/mercedes/callback', this.callbackHandler.bind(this));
  }

  /*
  *
  */
  private loginHandler(req, res) {
    if (!this.needLogin) {
      return this.sendResponse(res, 200, "[Mercedes] - Token known already. The Mercedes widget is setup successfully. You don't have to authenticate again.");
    }

    if ( ! this.clientId || ! this.clientSecret ) {
      this.clientId = this.getSettingValue('clientId');
      this.clientSecret = this.getSettingValue("clientSecret");
    }

    const state = generateRandomString() + `url${ip.address()}url`;
    res.cookie(this.stateKey, state);

    const scope = 'mb:vehicle:mbdata:fuelstatus mb:vehicle:mbdata:vehiclestatus mb:vehicle:mbdata:vehiclelock mb:vehicle:mbdata:payasyoudrive offline_access';
    res.redirect('https://id.mercedes-benz.com/as/authorization.oauth2?' +
      querystring.stringify({
        response_type: 'code',
        client_id: this.clientId,
        scope: scope,
        redirect_uri: this.redirectionUrl,
        state: state,
        prompt: "login consent"
      })
    );
  }

  private callbackHandler(req, res) {
    const code = req.query.code || null;

    res.clearCookie(this.stateKey);
    const authOptions = {
      url: 'https://id.mercedes-benz.com/as/token.oauth2',
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
        this.updateSetting({ name: "accessToken", value: body.access_token });
        this.updateSetting({ name: "refreshToken", value: body.refresh_token });

        this.needLogin = false;

        // update component
        this.save();

        this.handleListener();

        res.redirect('/mercedes/close');
      } else {
        res.send('ERROR - Please try again in the Senses - App: ' + body.error_description);
      }
    });
  }

  // TODO: DRY code
  async getVehicleDate() {
    const vehicleData: any = {};
    const url = BASE_URL + '/vehicles/' + this.vehicleId;
    const config = {
      headers: { 'Authorization': 'Bearer ' + this.getSettingValue('accessToken'), 'Content-Type': "application/json;charset=utf-8" },
    }

    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter("BROADCAST_MERCEDES_DATA", cacheItem.data);
      return;
    }

    try {
      await axios.get(url + '/resources/', config);
    } catch (e) {
      Logger.log('[Mercedes] - token expired, trying refresh token');
      if ( e.response && e.response.status === 401 ) {
        this.renewToken();
      }

      if ( e.response && e.response.status === 403 ) {
        Logger.error('[Mercedes] - cannot refresh the token. Provide the correct Client ID and Client Secret in the Senses - App and authenticate again.');
        this.addEmitter('BROADCAST_MERCEDES_DATA', { error: 'refresh_failed' });
      }
      return;
    }

    try {
      const odo = url + '/resources/odo';

      Logger.log('[Mercedes]: Performing API call:', odo.replace(BASE_URL, ''))
      const result = await axios.get(odo, config)

      if ((result.status === 200 || result.status === 204) && result.data) {
        vehicleData.odo = result.data.odo || {};
      } else {
        Logger.error('[Mercedes] - error fetching data.');
        vehicleData.odo = {};
      }
    } catch(e) {
      Logger.error('[Mercede Me]', e, url);
    }

    try {
      const vehicleStatusUrl = url + '/containers/vehiclestatus';

      Logger.log('[Mercedes]: Performing API call:', vehicleStatusUrl.replace(BASE_URL, ''))
      const result = await axios.get(vehicleStatusUrl, config)

      if ((result.status === 200 || result.status === 204) && result.data) {
        vehicleData.status = result.data || [];
      } else {
        Logger.error('[Mercedes] - error fetching data.');
        vehicleData.status = [];
      }
    } catch (e) {
      Logger.error('[Mercede Me]', e, url);
    }

    try {
      const vehicleLockStatusUrl = url + '/containers/vehiclelockstatus';

      Logger.log('[Mercedes]: Performing API call:', vehicleLockStatusUrl.replace(BASE_URL, ''))
      const result = await axios.get(vehicleLockStatusUrl, config)

      if ((result.status === 200 || result.status === 204) && result.data) {
        vehicleData.lockstatus = result.data || [];
      } else {
        Logger.error('[Mercedes] - error fetching data.');
        vehicleData.lockstatus = [];
      }
    } catch (e) {
      Logger.error('[Mercede Me]', e, url);
    }

    try {
      const vehicleLockStatusUrl = url + '/containers/fuelstatus';

      Logger.log('[Mercedes]: Performing API call:', vehicleLockStatusUrl.replace(BASE_URL, ''))
      const result = await axios.get(vehicleLockStatusUrl, config)

      if ((result.status === 200 || result.status === 204) && result.data) {
        vehicleData.fuel = result.data || [];
      } else {
        Logger.error('[Mercedes] - error fetching data.');
        vehicleData.fuel = [];
      }
    } catch (e) {
      Logger.error('[Mercede Me]', e, url);
    }

    const newCacheItem = {
      timestamp: Date.now(),
      data: vehicleData
    }
    this.addToCache(newCacheItem);

    this.addEmitter('BROADCAST_MERCEDES_DATA', vehicleData)
  }

  /*
  *
  */
  private async renewToken() {
    Logger.log('[Mercedes] - trying to refresh token..')
    const refreshToken = this.getSettingValue("refreshToken");

    if ( ! refreshToken ) {
      this.addEmitter('BROADCAST_MERCEDES_DATA', { error: 'relogin' });
      Logger.log('[Mercedes] - error: refresh token not defined. Unable to get data at this point.')
      return;
    }

    const url = 'https://id.mercedes-benz.com/as/token.oauth2';
    const data =  qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
    const options = {
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')),
        'Content-Type':'application/x-www-form-urlencoded',
      }
    };

    try {
      const refreshResult = await axios.post(url, data, options);
      if ( refreshResult.data.access_token ) {
        Logger.log('[Mercedes] - successfully refresh token');
        this.updateSetting({ name: "accessToken", value: refreshResult.data.access_token });
        this.updateSetting({ name: "refreshToken", value: refreshResult.data.refresh_token });
        this.save();

        this.getVehicleDate();
      }
    } catch (e) {
      Logger.log('[Mercedes] - error:', e.response.data.error);

      if ( e.response.data.error ) {
        this.addEmitter('BROADCAST_MERCEDES_DATA', { error: 'relogin' });
      }
    }
  }


  /*
  *
  */
  private handleListener() {
    Logger.log('[Mercedes] - Getting data..');

    if (!this.getSettingValue('show')) return;

    const ACCESS_TOKEN = this.getSettingValue("accessToken");
    const REFRESH_TOKEN = this.getSettingValue("refreshToken");

    if (!this.clientId || !this.clientSecret) {
     this.addEmitter('BROADCAST_MERCEDES_DATA', { error: "missing_ids" });
     return;
    }

    if (!this.vehicleId) {
      this.addEmitter('BROADCAST_MERCEDES_DATA', { error: 'vehicle_id_missing' });
      return;
    }

    if (!ACCESS_TOKEN.length) {
      this.addEmitter('BROADCAST_MERCEDES_DATA', { error: "missing_tokens" });
      this.needLogin = true;
      Logger.error('[Mercedes] - No access token set yet.')
      return;
    }

    this.getVehicleDate();

		if ( this.interval ) {
			clearInterval(this.interval);
		}

		this.interval = setInterval(this.getVehicleDate.bind(this), this.getSettingValue('interval') || 60000);
  }
}

module.exports = MercedesMe;
