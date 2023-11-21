const request = require("request");
import atob from "atob";

class TravelTime extends WidgetHelper {
  constructor(data) {
    super(data);

    this._setupEndpoints();
  }

  /*
   *
   */
  afterStart(data) {
    this.settings = data.settings;
  }

  /*
   * setup endpoints
   */
  _setupEndpoints() {
    this.addGetRoute("/api/call", this._endpointHandler.bind(this));
  }

  /*
   * endpoint handler
   */
  _endpointHandler(req, res, next) {
    const url = atob(req.query.url);

    Logger.log("[Travel Time]: getting route for:", url);

    const routeUrl = new URL(url);
    const routeName = routeUrl.searchParams.get("name");

    if (!url) {
      this.sendResponse(res, 200, { data: { error: "no_url_in_query" } });
      return next();
    }

    const cacheItem = this.getFromCacheById(url);
    if (cacheItem) {
      const parsedData = JSON.parse(cacheItem.data);
      parsedData.name = routeName;
      this.sendResponse(res, 200, parsedData);
      return next();
    }

    request(url, (err, _res, body) => {
      Logger.log('[Travel Time]: Performing API call.')
      const data = JSON.parse(body);

      if (err || data.status === 'REQUEST_DENIED') {
        Logger.error("[Travel Time]: Error ", data.error_message);
        return;
      }

      const cacheItem = {
        timestamp: Date.now(),
        data: _res.body,
        id: url
      };

      this.addToCacheById(cacheItem);

      const parsedData = JSON.parse(_res.body);
      parsedData.name = routeName;
      this.sendResponse(res, 200, parsedData);
    });
  }
}

module.exports = TravelTime;
