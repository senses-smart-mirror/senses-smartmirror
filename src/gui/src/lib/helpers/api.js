import axios from 'axios';

// default config
// TODO: fix this port and make it dynamic
axios.defaults.baseURL = 'http://localhost:7011/api';

class Api {
	axios = {};

	constructor() {
		this.axios = axios;
	}
}

export default new Api();
