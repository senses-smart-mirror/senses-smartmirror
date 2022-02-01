import axios from 'axios';

const BASE_URL = 'https://api.github.com/repos/';

export class GithubStars extends WidgetHelper {

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
    this.addSocketListener("REQUEST_GITHUB_STARS_DATA", this.handleListener.bind(this)
    );
  }

  /*
   * handleListener
   */
  private handleListener() {
    this.getGithubData();

    if ( this.interval ) {
			clearInterval(this.interval);
		}

		this.interval = setInterval(this.getGithubData.bind(this), this.getSettingValue('interval') || 60000);
  }

  /*
  *
  */
  private async getGithubData() {
    let githubStarsData:any = [];
    
    const repos = this.getSettingValue('repos');

    if ( ! repos || !repos.length ) {
      this.addEmitter("BROADCAST_GITHUB_STARS_DATA", {error: 'no_repos'} );
      return;
    }
    
    const cacheItem = this.getFromCache();
    if (cacheItem) {
      this.addEmitter("BROADCAST_GITHUB_STARS_DATA", cacheItem.data );
      return;
    }

    for await (const repo of repos) {
      const url = BASE_URL + `${repo.username}/${repo.repository}`;
      Logger.log('[Github Stars] - Api call:', url);
      
      try {
        const result = await axios.get(url);

        if ( result.status === 200 ) {
          githubStarsData.push({...repo, data: result.data});
        } else {
          githubStarsData.push({...repo, error: 'not_found'})
        }
      } catch (e) {
        githubStarsData.push({...repo, error: 'not_found'})
        Logger.error('[Github Stars] -', e);

        if ( e.response.status === 403 ) {
          this.addEmitter("BROADCAST_GITHUB_STARS_DATA", {error: 'rate_limit'});
          return;
        }
      }
    };

    const newCacheItem = {
      timestamp: Date.now(),
      data: githubStarsData
    }
    this.addToCache(newCacheItem);

    this.addEmitter("BROADCAST_GITHUB_STARS_DATA", githubStarsData);
    
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

module.exports = GithubStars;
