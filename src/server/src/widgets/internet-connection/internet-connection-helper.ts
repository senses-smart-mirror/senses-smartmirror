import wifi from 'node-wifi';
const QRCode = require("qrcode");

export class InternetConnection extends WidgetHelper {

  // constructor
  constructor(data) {
    super(data);

    this._addSocketListener();
  }

  /*
   * start the component
   */
  afterStart(data) {
    this.settings = data.settings;
  }

  /*
   * addSocketListener
   */
  private _addSocketListener() {
    this.addSocketListener("REQUEST_INTERNET_CONNECTION_DATA", this.handleListener.bind(this)
    );
  }

  /*
   * handleListener
   */
  private handleListener() {
    Logger.log('[Internet Connection] - Fetching data..');

    this.getInternetConnection();

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(this.getInternetConnection.bind(this), this.getSettingValue('interval') || 60000);
  }

  private async getInternetConnection() {
    const data = {
      qr: "",
      internet: []
    };

    try {
      const currentConnection = await wifi.getCurrentConnections();
      data.internet = currentConnection;
    } catch (e) {
      Logger.log('[Internet Connection] - error:', e);
    }

    if (this.getSettingValue('showQr')) {
      const ssidSettingValue = this.getSettingValue('ssid');
      const ssid = ssidSettingValue && ssidSettingValue.length ? this.getSettingValue('ssid') : data && data.internet.length ? data.internet[0].ssid : null;

      console.log(ssid, this.getSettingValue('password'))
      if (ssid && this.getSettingValue('password')) {
        try {
          const config = {
            ssid: ssid,
            password: this.getSettingValue('password'),
            encryption: 'WPA',
            hiddenSSID: false,
          }

          const qrCodeOptions = {
            color: {
              dark: "#fff",
              light: "#000"
            }
          }

          if ( this.getSettingValue('background') ) {
            qrCodeOptions.color = { light: "#ffffff00", dark: "#fff" };
          }

          const wifiString: string = this.generateString(config);

          const retVal: string = await QRCode.toDataURL(
            wifiString,
            qrCodeOptions
          )

          data.qr = retVal;
        } catch (e) {
          Logger.log('[Internet Connection] - error:', e);
        }
      }
    }


    this.addEmitter("BROADCAST_INTERNET_CONNECTION_DATA", data);

  }

  private generateString(input: any): string {
    const ssid: string = this.mecardFormat(input.ssid)
    const password: string = this.mecardFormat(input.password)

    let retVal = `WIFI:S:${ssid};P:${password};H:${input.hiddenSSID};`
    if (input.encryption !== 'None') {
      retVal += `T:${input.encryption};`
    }
    return retVal;
  }

  private mecardFormat(input: string): string {
    input = input.replace(/\\/g, '\\\\')
    input = input.replace(/"/g, '\\"')
    input = input.replace(/;/g, '\\;')
    input = input.replace(/,/g, '\\,')
    input = input.replace(/:/g, '\\:')
    return input;
  }

  /*
   * afterStop
   */
  afterStop() { }

  /*
   * afterReload
   */
  afterReload() { }
}

module.exports = InternetConnection;
