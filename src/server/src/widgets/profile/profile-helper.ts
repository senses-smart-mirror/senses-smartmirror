
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
    this.addSocketListener("REQUEST_PROFILE_DATA", this._handleListener.bind(this));
  }

  /*
   * handleListener
   */
  _handleListener() {
    const profile = this.getProfile();

    this.addEmitter("BROADCAST_PROFILE_DATA", profile);
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
