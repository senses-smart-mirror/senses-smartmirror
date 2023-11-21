import { google } from 'googleapis';
import * as path from 'path';
import * as ip from 'ip';
import { IWidget } from "src/lib/types";

/*
* Generate random string
*/
const generateRandomString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export class Calendar extends WidgetHelper {
  clientId = "";
  clientSecret = "";
  authClient = {};
  component = {};
  broadcastInterval = null;
  needLogin = true;
  tokenRenewed = false;

  redirectionUrl = `https://senses-smartmirror.com/oauth/google`;
  stateKey = "google_auth_state";

	constructor(data: IWidget) {
    super(data);

    this._addSocketListener();
  }

  afterStart(data: IWidget) {
    this.settings = data.settings;

    this.clientId = this.getSettingValue("clientId");
    this.clientSecret = this.getSettingValue("clientSecret");

    this.authClient = this._getOAuthClient();

    this._setupEndpoints();
  }

  /*
  *
  */
  afterStop() {
    if ( this.broadcastInterval ) {
      clearInterval(this.broadcastInterval);
    }
  }

  /*
   * Create Google Auth client
   */
  _getOAuthClient() {
    const OAuth2 = google.auth.OAuth2;
    let a = new OAuth2(this.clientId, this.clientSecret, this.redirectionUrl);
    return a;
  }

  /*
   *
   */
  _addSocketListener() {
    this.addSocketListener("REQUEST_CALENDAR_DATA", this._handleListener.bind(this));
  }

  /*
   *
   */
  _handleListener() {
    const ACCESS_TOKEN = this.getSettingValue("accessToken") || '';
    const REFRESH_TOKEN = this.getSettingValue("refreshToken") || '';

    if (!this.clientId.length || !this.clientSecret.length) {
      return this.addEmitter("BROADCAST_CALENDAR_DATA", {error: "missing_ids"});
    }

    if (!ACCESS_TOKEN.length) {
      if (!REFRESH_TOKEN.length) {
        this.addEmitter("BROADCAST_CALENDAR_DATA", {
          error: "missing_tokens"
        });
        this.needLogin = true;
        return;
      } else {
        this.renewToken().then(() => {
          Logger.log("[Calendar] - Success: refreshed token");
          this.broadCastCalendarData();
        }).catch(() => {
          // TODO: handle this?
        });
        return;
      }
    }

    // udpate authclient credentials
    // @ts-ignore
    this.authClient.setCredentials({ access_token: ACCESS_TOKEN });

    // valid access token, no login required
    this.needLogin = false;

    // continue to broadcast data
    this.broadCastCalendarData();

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }

    this.broadcastInterval = setInterval(
      this.broadCastCalendarData.bind(this),
      this.getSettingValue("interval") || 50000
    );
  }

  /*
   * setup endpoints
   */
  _setupEndpoints() {
    this.addGetRoute("/google/close", (req, res, next) => {
      res.sendFile(path.join(__dirname, "../../views/close.html"));
    });

    this.addGetRoute("/google/login", this._loginHandler.bind(this));
    this.addGetRoute("/google/callback", this._callbackHandler.bind(this));
  }

  /*
   * login handler
   */
  _loginHandler(req, res) {
    if (!this.needLogin) {
      return this.sendResponse(res, 200, "[Calendar] - Token known already. The Calendar widget is setup successfully. You don't have to authenticate again.");
    }

    // @ts-ignore
    const state = generateRandomString(16) + `url${ip.address()}url`;
    res.cookie(this.stateKey, state);

    // @ts-ignore
    let url = this.authClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.readonly"],
      state: state,
      prompt: 'consent'
    });

    res.redirect(url);
  }

  /*
   * callback handler
   */
  _callbackHandler(req, res) {
    const code = req.query.code || null;

    res.clearCookie(this.stateKey);

    // @ts-ignore
    this.authClient.getToken(code, (err, tokens) => {
      if (!tokens) {
        return res.redirect("/google/close");
      }

      // @ts-ignore
      this.authClient.setCredentials(tokens);

      this.updateSetting({ name: "accessToken", value: tokens.access_token });
      this.updateSetting({ name: "refreshToken", value: tokens.refresh_token });

      // after updating setting, save the widget in the config
      this.save();

      // broadcast calendar data again
      this.broadCastCalendarData();
      res.redirect("/google/close");
    });
  }

  /*
   * broadcast calendar data to GUI
   */
  broadCastCalendarData() {
    this.broadcastWidgetIsLoading();

    if ( ! this.getSettingValue('show') ) return;

    // @ts-ignore
    if ( ! this.authClient.credentials.access_token ) {
      const ACCESS_TOKEN = this.getSettingValue("accessToken");
      // @ts-ignore
      this.authClient.setCredentials({access_token: ACCESS_TOKEN});
    }

    this.getCalendarItems()
      .then(res => {
        this.addEmitter("BROADCAST_CALENDAR_DATA", res);
        this.tokenRenewed = false;
      })
      .catch(err => {
        Logger.error('[Calendar] -', err);

        this.addEmitter("BROADCAST_CALENDAR_DATA", {error: 're-auth'});
        this.needLogin = true;

        // token is already renewed.
        if ( this.tokenRenewed ) return;

        this.renewToken()
          .then(() => {
            Logger.log("[Calendar] - Refreshed token");
            this.broadCastCalendarData();
          })
          .catch(e => {
            this.addEmitter("BROADCAST_CALENDAR_DATA", {error: 're-auth'});
            Logger.log("[Calendar] - Error: Refreshing token");
          });
      });
  }

  renewToken() {
    // @ts-ignore
    this.authClient.setCredentials({ refresh_token: this._getRefreshToken() });

    return new Promise((resolve, reject) => {
      // @ts-ignore
      this.authClient.refreshAccessToken((err, tokens) => {
        if (!err && tokens) {
          this.updateSetting({
            name: "accessToken",
            value: tokens.access_token
          });
          this.updateSetting({
            name: "refreshToken",
            value: tokens.refresh_token
          });
          this.save();

          // @ts-ignore
          this.authClient.setCredentials(tokens);

          this.tokenRenewed = true;

          resolve(tokens);
        } else {
          this.needLogin = true;
          this.tokenRenewed = false;
          Logger.log("[Calendar] - Error: refreshing token failed.");
          reject(err);
        }
      });
    });
  }

  /*
  *
  */
  _getRefreshToken() {
    return this.getSettingValue("refreshToken");
  }

  /*
  *
  */
  getCalendarItems() {
    const auth = this.authClient;
    // @ts-ignore
    const calendar = google.calendar({ version: "v3", auth });

    return new Promise((resolve, reject) => {
      Logger.log('[Calendar] - Fetching calender items..');

      const cacheItem = this.getFromCache();
      if ( cacheItem ) {
        resolve(cacheItem.data);
        return;
      }

      Logger.log("[Calendar] - Performing API call.");
      calendar.events.list(
        {
          calendarId: "primary",
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: "startTime"
        },
        (err, res) => {
          if (err) {
            Logger.log("[Calendar] - The API returned an " + err);
            reject(err);
            return;
          }

          const cacheItem = {
            timestamp: Date.now(),
            data: res.data.items
          }

          this.addToCache(cacheItem);
          resolve(res.data.items);
        }
      );
    });
  }
}

module.exports = Calendar;
