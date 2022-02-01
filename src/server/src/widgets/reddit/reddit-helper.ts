import Parser from "rss-parser";
import { IWidget } from "src/lib/types";

const parser = new Parser();

export class Reddit extends WidgetHelper {
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
    super.addSocketListener("REQUEST_REDDIT_FEED", this.handleListener.bind(this));
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
      this.getSettingValue("interval") || 5000
    );
  }

  /*
   *
   */
  _feedHandler() {
    const url = this.getSettingValue("url");

    if ( ! url ) {
      this.addEmitter("BROADCAST_REDDIT_FEED", { error: "no_url" })
      return;
    }

    Logger.log('[Reddit] - Fetching RSS Feed..')

    this._getRssFeed()
      .then((feed) => {
        if ( this.getSettingValue('removeMegathreads') ) {
          feed.items = feed.items.filter(item => {
            if ( item.title && item.title.indexOf('Megathread') < 0 ) {
              return item;
            }
          });
        }

        feed.items.length = this.getSettingValue("amount") || 5;

        this.addEmitter("BROADCAST_REDDIT_FEED", feed)
      })
      .catch((err) => {
        Logger.log("[Reddit] - Error: fetching news items.", err);
        this.addEmitter("BROADCAST_REDDIT_FEED", { error: "no_data" })
      });
  }

  /*
   *
   */
  _getRssFeed() {
    return parser.parseURL(this.getSettingValue("url"))
  }
}

module.exports = Reddit;
