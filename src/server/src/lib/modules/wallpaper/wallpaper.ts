import request from 'request';
import { ISetting } from 'src/lib/types/Setting';

import SmartMirrorAPI from '../../classes/Api';

const BASE_URL = "https://api.unsplash.com/";

class Wallpaper {
  settings: ISetting[] = [];
  interval?: number;
  photoUrl: string = "";
  apiKey?: string;
  isStarted: boolean = false;

  constructor() {}

  init() {
    SmartMirrorAPI.addSocketListener("REQUEST_WALLPAPER", this.requestWallpaper.bind(this));
  }

  start() {
    this._start();

    this.isStarted = true;
  }

  private _start() {
    const photoID = <string>this.getSettingValue('photo_id');
    this.apiKey = <string>this.getSettingValue('api_key');

    if ( ! this.apiKey || ! this.apiKey.length ) {
      Logger.warning('[Wallpaper] - no api key set.');
    }

    if ( photoID && photoID.length ) {
      this.getPhoto(photoID);
    } else {
      this.initiatePolling();
    }
  }

  stop() {
    clearInterval(this.interval);
    this.photoUrl = '';
    this.broadcastPhoto('');

    this.isStarted = false;
  }

  restart() {
    if ( ! this.isStarted ) return;
    clearInterval(this.interval);
    this._start();
  }

  saveSettings(settings: any) {
    this.settings = settings;
  }

  getSettingValue(name: string) {
    const filter = this.settings.filter((setting: ISetting) => setting.name === name);

    if ( filter && filter[0] ) {
      return filter[0].value;
    }
  }

  requestWallpaper() {
    this.broadcastPhoto(this.photoUrl);
  }

  initiatePolling() {
    if ( this.interval ) {
      clearInterval(this.interval);
    }

    if ( ! this.apiKey ) return;

    let intervalTime = parseInt(this.getSettingValue('interval') as string) * 1000;

    if ( ! intervalTime ) {
      intervalTime = 300000;
    }

    this.getCollectionItems();
    this.interval = <any>setInterval(() => {
      this.getCollectionItems();
    }, intervalTime);
  }

  broadcastPhoto(photoUrl: string) {
    SmartMirrorAPI.emit('BROADCAST_WALLPAPER', { photoUrl });
  }

  getCollectionItems() {
    let collections = this.getSettingValue('collections');

    if ( collections ) {
      collections = `&collections=${collections}`.replace(' ', '');
    } else {
      collections = '';
    }

    const url = BASE_URL + `/photos/random?client_id=${this.apiKey}${collections}`;

    Logger.log('[Wallpaper] - getting photo from collections:', url);

    request(url, (err, res, data) => {
      if ( data.errors ) {
        Logger.log('[Module] - wallpaper error:', data.errors);
      }

      const result = JSON.parse(data);

      if ( result && result.urls ) {
        this.photoUrl = result.urls.full;
        this.broadcastPhoto(result.urls.full);
      }
    });
  }

  getPhoto(photoId: string = '') {
    if ( ! this.apiKey || !photoId ) { return false; }

    const url = BASE_URL + `photos/${photoId}?client_id=${this.apiKey}`;

    Logger.log('[Wallpaper] - fetching photo: ', url);

     request(url, (err, res, data) => {
      if ( data.errors ) {
        Logger.log('[Module] - wallpaper error:', data.errors);
      }

      const result = JSON.parse(data);

      if ( result && result.urls ) {
        this.photoUrl = result.urls.full;
        this.broadcastPhoto(result.urls.full);
      }
    });
  }

}

module.exports = Wallpaper;
