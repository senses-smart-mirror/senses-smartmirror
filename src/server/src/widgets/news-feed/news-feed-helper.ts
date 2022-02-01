import Parser from "rss-parser";
import { IWidget } from "src/lib/types";

const parser = new Parser();

export class NewsFeed extends WidgetHelper {
  constructor(data: IWidget) {
    super(data);

    this.addSocketListener();
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
    this.settings = data.settings;
  }

  /*
   *
   */
  afterReload() {
    this.addSocketListener();
  }

  /*
  *
  */
  afterStop() { }

  /*
   *
   */
  private addSocketListener() {
    super.addSocketListener("REQUEST_RSS_FEED", this.handleListener.bind(this));
  }

  /*
   *
   */
  private handleListener() {
    if ( ! this.getSettingValue('show') ) return;

    this._feedHandler();
    clearInterval(this.interval);
    this.interval = setInterval(
      this._feedHandler.bind(this),
      this.getSettingValue("interval") || 30000
    );
  }

  /*
   *
   */
  _feedHandler() {
    const url = this.getSettingValue("url");

    Logger.log('[News Feed] - Fetching RSS feed');

    if ( ! url ) {
      this.addEmitter("BROADCAST_RSS_FEED", { error: "no_url" })
      return;
    }

    this._getRssFeed()
      .then((feed) => {
        feed.items.length = this.getSettingValue("amount") || 5;
        this.addEmitter("BROADCAST_RSS_FEED", feed)
      })
      .catch((err) => {
        Logger.log("[News Feed] - Error: fetching news items.", err);
        this.addEmitter("BROADCAST_RSS_FEED", { error: "no_data" })
      });
  }

  /*
   *
   */
  _getRssFeed() {
    return parser.parseURL(this.getSettingValue("url"))
  }
}

module.exports = NewsFeed;
