import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import App from "./App.vue";
import Trend from "vuetrend";
import io from "socket.io-client";
import Vuex from 'vuex';

import Cryptoicon from 'vue-cryptoicon';
import icon from 'vue-cryptoicon/src/icons';
Cryptoicon.add(icon);
Vue.use(Cryptoicon);

// global components
import loader from "./lib/components/loader/loader";
import voice from "./widgets/voice/voice";
import clock from "./widgets/clock/clock";
import weather from "./widgets/weather/weather";
import weatherForecast from "./widgets/weather-forecast/weather-forecast";
import calendar from "./widgets/calendar/calendar";
import travelTime from "./widgets/traveltime/traveltime";
import spacer from "./widgets/spacer/spacer";
import compliments from "./widgets/compliments/compliments";
import stats from "./widgets/stats/stats";
import spotify from "./widgets/spotify/spotify";
import newsFeed from "./widgets/news-feed/news-feed";
import nest from "./widgets/nest/nest";
import hue from "./widgets/hue/hue";
import trends from "./widgets/trends/trends";
import quote from "./widgets/quote/quote";
import speedCameras from "./widgets/speed-cameras/speed-cameras";
import textClock from "./widgets/text-clock/text-clock";
import reminders from "./widgets/reminders/reminders";
import qr from "./widgets/qr/qr";
import versionViewer from "./widgets/version-viewer/version-viewer";
import notifications from "./widgets/notifications/notifications";
import speech from "./widgets/speech/speech";
import cryptoList from "./widgets/crypto-list/crypto-list";
import cryptoGraph from "./widgets/crypto-graph/crypto-graph";
import rainRadar from "./widgets/rain-radar/rain-radar";
import todos from "./widgets/todos/todos";
import trains from "./widgets/trains/trains";
import flights from "./widgets/flights/flights";
// import health from "./widgets/health/health";
import video from "./widgets/video/video";
import speedtest from "./widgets/speedtest/speedtest";
import profile from "./widgets/profile/profile";
import stocks from "./widgets/stocks/stocks";
import formula1 from "./widgets/formula1/formula1";
import mercedes from "./widgets/mercedes/mercedes";
import githubStars from "./widgets/github-stars/github-stars";
import text from "./widgets/text/text";
import reddit from "./widgets/reddit/reddit";
import internetConnection from "./widgets/internet-connection/internet-connection";

Vue.component("loader", loader);
Vue.component("clock", clock);
Vue.component("weather", weather);
Vue.component("weatherForecast", weatherForecast);
Vue.component("calendar", calendar);
Vue.component("travelTime", travelTime);
Vue.component("spacer", spacer);
Vue.component("compliments", compliments);
Vue.component("stats", stats);
Vue.component("spotify", spotify);
Vue.component("newsFeed", newsFeed);
Vue.component("nest", nest);
Vue.component("hue", hue);
Vue.component("trends", trends);
Vue.component("quote", quote);
Vue.component("speedCameras", speedCameras);
Vue.component("voice", voice);
Vue.component("textClock", textClock);
Vue.component("reminders", reminders);
Vue.component("qr", qr);
Vue.component("version-viewer", versionViewer);
Vue.component("notifications", notifications);
Vue.component("speech", speech);
Vue.component("crypto-list", cryptoList);
Vue.component("crypto-graph", cryptoGraph);
Vue.component("rain-radar", rainRadar);
Vue.component("todos", todos);
Vue.component("trains", trains);
Vue.component("flights", flights);
// Vue.component("health", health);
Vue.component("video-player", video);
Vue.component("speedtest", speedtest);
Vue.component("profile", profile);
Vue.component("stocks", stocks);
Vue.component("formula1", formula1);
Vue.component("mercedes", mercedes);
Vue.component("github-stars", githubStars);
Vue.component("text-editor", text);
Vue.component("internet-connection", internetConnection);
Vue.component("reddit", reddit);

// socket
Vue.use(
  new VueSocketIO({
    connection: io("http://localhost:7011", {
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax': 5000,
      'reconnectionAttempts': 5
    })
  })
);

import socketMixin from "./lib/mixins/socket";
import animationMixin from "./lib/mixins/animation";
import componentDesignMixin from "./lib/mixins/component-design";
import Api from "./lib/mixins/api";
import speechM from "./lib/mixins/speech";
import storeWidgetData from "./lib/mixins/store";
import dispalyBasedOnTime from './lib/mixins/display-based-on-time';

Vue.mixin(socketMixin);
Vue.mixin(animationMixin);
Vue.mixin(componentDesignMixin);
Vue.mixin(Api);
Vue.mixin(speechM);
Vue.mixin(dispalyBasedOnTime);
Vue.mixin(storeWidgetData);

Vue.config.optionMergeStrategies.sockets = (toVal, fromVal) => {
  return Object.assign({}, toVal, fromVal);
};

/*
* For production: load extra stylesheets;
*/
if ( process.env.production ) {
  console.log('prod');
  require('../src/styles/prod.scss');
}

// trend animation module
Vue.use(Trend);

// configs
Vue.config.productionTip = false;
Vue.config.devtools = false;


Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    widgetData: []
  },
  mutations: {
    addData (state, data) {
      const index = state.widgetData.findIndex(item => item.name === data.name);

      state.widgetData = [
        ...state.widgetData.slice(0,index),
        ...[data],
        ...state.widgetData.slice(index+1)
      ]
    }
  }
})

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
