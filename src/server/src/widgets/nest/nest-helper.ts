import { google } from 'googleapis';
import path from 'path';
import ip from 'ip';
import { IWidget } from "src/lib/types";
import request from 'request';
import querystring from 'querystring';
import { NextFunction } from 'express';

const generateRandomString = (num: number) => Math.random().toString(num).substring(2, 15) + Math.random().toString(num).substring(2, 15);

export class Nest extends WidgetHelper {
  needLogin = true;

  redirectionUrl = 'https://senses-smartmirror.com/oauth/nest';
  stateKey = 'google_auth_state';

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
    this.projectId = this.getSettingValue("projectId");
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
    this.addGetRoute('/nest/close', (req, res) => {
      res.sendFile(path.join(__dirname, '../../views/close.html'));
    });

    this.addGetRoute('/nest/login', this._loginHandler.bind(this));
    this.addGetRoute('/nest/callback', this._callbackHandler.bind(this));
  }

  /*
  *
  */
  _addSocketListener() {
    this.addSocketListener('REQUEST_NEST_DATA', this._handleListener.bind(this));
  }

  /*
  *
  */
  _callbackHandler(req, res) {
    const code = req.query.code || null;

    const authOptions = {
      url: 'https://www.googleapis.com/oauth2/v4/token',
      form: {
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectionUrl,
        grant_type: 'authorization_code'
      },
      header: { 'Content-Type': 'application/json;charset=UTF-8' }
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && body) {

        const result = JSON.parse(body);

        this.updateSetting({ name: "accessToken", value: result.access_token });
        this.updateSetting({ name: "refreshToken", value: result.refresh_token });

        // update component
        this.save();

        // this._broadCastSpotifyInfo();
        res.redirect('/nest/close');
      } else {
        res.send('ERROR - please try again in the app: ' + error);
      }
    });
  }

  /*
  *
  */
  _loginHandler(req, res) {
    if (!this.needLogin) {
      return this.sendResponse(res, 200, "[Nest] - Token known already. The Nest widget is setup successfully. You don't have to authenticate again.");
    }

    const state = generateRandomString(16) + `url${ip.address()}url`;
    res.cookie(this.stateKey, state);

    var scope = "https://www.googleapis.com/auth/sdm.service";
    res.redirect('https://nestservices.google.com/partnerconnections/' + this.projectId + '/auth?' +
      querystring.stringify({
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        include_granted_scopes: 'false',
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
    if (!this.getSettingValue('show')) return;

    const ACCESS_TOKEN = this.getSettingValue("accessToken");
    const REFRESH_TOKEN = this.getSettingValue("refreshToken");

    if (!this.clientId.length || !this.clientSecret.length) {
      return this.addEmitter('BROADCAST_NEST_DATA', { error: "missing_ids" });
    }

    if (!this.projectId || !this.projectId.length) {
      return this.addEmitter('BROADCAST_NEST_DATA', { error: "missing_project_id" });
    }

    if (!ACCESS_TOKEN.length) {
      if (!REFRESH_TOKEN.length) {
        this.addEmitter('BROADCAST_NEST_DATA', { error: "missing_tokens" });
        this.needLogin = true;
        return;
      } else {
        this._renewToken().then(() => {
          Logger.log('[Nest] - Success: refreshed token');
          this.getNestData();
        });
        return;
      }
    }

    this.needLogin = false;

    // broadcast the info
    this.broadcastData();

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(this.broadcastData.bind(this), this.getSettingValue('interval') || 30000);
  }

  /*
  * broadcast data
  */
  broadcastData(): void {
    this.getNestData().then((res) => {
      this.addEmitter('BROADCAST_NEST_DATA', res);
    }).catch((e) => {
      if (!e) return;

      if (e.status === 'UNAUTHENTICATED') {
        this._renewToken().then(() => {
          Logger.log('[Nest] - Success: refreshed token');
          this.getNestData().then((res) => {
            this.addEmitter('BROADCAST_NEST_DATA', res);
          })
        });
      }
    });
  }

  /*
  * renew token
  */
  _renewToken() {
    var authOptions = {
      url: 'https://www.googleapis.com/oauth2/v4/token',
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
          var access_token = body.access_token;

          this.updateSetting({ name: "accessToken", value: access_token });
          this.save();

          resolve(body);
        } else {
          Logger.log('[Nest] - Error renewing tokens: ', error);
          reject(error);
        }
      });
    });
  }

  /*
  *
  */
  getNestData() {
    const endpoint = "/enterprises/" + this.projectId + "/devices";
    const token = this.getSettingValue('accessToken');

    const options = {
      url: "https://smartdevicemanagement.googleapis.com/v1" + endpoint,
      headers: { 'Authorization': 'Bearer ' + token },
      json: true
    }

    return new Promise((resolve, reject) => {

      const cacheItem = this.getFromCache();
      if (cacheItem) {
        resolve(cacheItem.data);
        return;
      }

      Logger.log('[Nest] - Performing API call..');

      request.get(options, (error, response, body) => {
        if (body && body.error) {
          reject(body.error);
        }

        const cacheItem = {
          timestamp: Date.now(),
          data: body
        }

        this.addToCache(cacheItem);
        resolve(body);
      });
    });
  }
}

module.exports = Nest;
