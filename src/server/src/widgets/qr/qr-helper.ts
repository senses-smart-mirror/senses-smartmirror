const ip = require("ip");
const QRCode = require("qrcode");

export class Qr extends WidgetHelper {

  // contains component data
  component = {};

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
  _addSocketListener() {
    this.addSocketListener("REQUEST_QR_DATA", this._handleListener.bind(this)
    );
  }

  /*
   * handleListener
   */
  _handleListener() {
    const data = { description: "qr code", url: '', error: null };
    const backgroundColor = this.getSettingValue('background_color');
    let color = {
      dark: "#fff",
      light: "#000",
    }

    if ( backgroundColor ) { 
      color = { light: "#ffffff00", dark: "#fff" };
    }

    // TODO: don't hardcode this port number here.
    QRCode.toDataURL(`http://${ip.address()}:7011`, {
      color: color
    })
      .then((url: any) => {
        data.url = url;
      })
      .catch((err: any) => {
        data.error = err;
      })
      .finally(() => {
        this.addEmitter("BROADCAST_QR_DATA", {data: data});
      });
  }

  /*
   * afterStop
   */
  afterStop() {}

  /*
   * afterReload
   */
  afterReload() {}
}

module.exports = Qr;
