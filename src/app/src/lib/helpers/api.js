import axios from 'axios';

// default config
axios.defaults.baseURL = `http://${window.location.hostname}:7011/api`;

class Api { 
	axios = {}

	constructor() {
		this.axios = axios;
	}
}

export default new Api();