import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import App from "./App.vue";
import io from "socket.io-client";

// global components
import loader from "./lib/components/loader/loader";

import './registerServiceWorker';
Vue.component("loader", loader);

// socket
let connected = false;
let alreadySetupVue = false;
let socket;

socket = new VueSocketIO({
  connection: io(`http://${window.location.hostname}:7011`, {
    'reconnection': true,
    'reconnectionDelay': 1000,
    'reconnectionDelayMax': 5000,
    'reconnectionAttempts': 2,
  }),
});

socket.io.on("connect", () => {
  connected = true;
  setupVue();
});

setTimeout(() => {
  if (!connected) {
    console.log("[Mirror UI] - Connection failed. Trying port: 7012");

    socket = new VueSocketIO({
      connection: io(`http://${window.location.hostname}:7012`, {
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5,
      }),
    });

    setupVue();
  }
}, 2500);

function setupVue() {
  if (alreadySetupVue) return;

  Vue.use(socket);

  Vue.config.productionTip = false;

  new Vue({
    render: (h) => h(App),
  }).$mount("#app");

  alreadySetupVue = true;
}
