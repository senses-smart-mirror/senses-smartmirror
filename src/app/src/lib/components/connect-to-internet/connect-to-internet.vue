<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-box-alt"></i>
      <h3 class="overlay-title">Connection</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fas fa-times"></i>
      </span>
    </header>

    <section class="modal update-modal" v-if="modalIsOpen">
      <div class="overlay-header">
        <i class="fad fa-lock"></i>
        <h3 class="overlay-title">Provide Password</h3>
        <span @click="closeModal()" class="overlay-close-button">
          <i class="fad fa-times"></i>
        </span>
      </div>

      <div class="overlay-content">
        <section v-if="isTryingToConnect">
          <p class="mb-4">
            Please wait while the Smart Mirror tries to connect to
            <strong class="text-bright">{{ newConnection.ssid }}</strong
            >.
          </p>
          <div class="loader-wrap">
            <loader :theme="'light'"></loader>
          </div>
        </section>

        <section v-if="!isTryingToConnect">
          <p>
            Enter password for
            <strong class="text-bright">{{ newConnection.ssid }}</strong
            >.
          </p>

          <p class="error-msg mb-4" v-if="incorrectPassword">
            Unable to join {{ newConnection.ssid }}.
          </p>

          <div class="form-group mb-4">
            <label for="pass">Password</label>

            <div class="input-icon">
              <input
                id="pass"
                ref="input"
                type="password"
                v-model="newConnection.password"
                placeholder="password"
              />
              <span @click="showPassword()"><i class="fad fa-eye"></i></span>
            </div>

          </div>

          <div class="button-group">
            <button
              class="btn btn-primary btn-small"
              @click="connectToEndpoint()"
            >
              Connect
            </button>
            <a class="text-muted" @click="closeModal()">close</a>
          </div>
        </section>
      </div>
    </section>

    <section>
      <p class="description mb-4">
        In this screen you choose a WIFI network and connect to it.
      </p>

      <span class="divider"></span>

      <section class="endpoints" v-if="!isLoading && endpoints.length">
        <div class="current-connection" v-if="currentConnection">
          <h5>Currently connected to</h5>

          <p class="text-bright">
            <i class="fas fa-check"></i>
            <strong>{{ currentConnection.ssid }}</strong>
            <span class="signal-strength"><i class="fad fa-wifi text-is-green"></i></span>
          </p>

          <span class="divider"></span>
        </div>

        <h5>Other networks</h5>
        <ul class="endpoints-list" v-if="!isLoadingEndpoints">
          <li v-bind:key="key" v-for="(endpoint, key) in endpoints">
            <a v-on:click="selectNetwork(endpoint)">
              {{ endpoint.ssid }}
            </a>

            <span class="icon-group">
              <span v-if="endpoint.security"><i class="fad fa-lock"></i></span>
              <span class="signal-strength"
                ><i
                  class="fad"
                  v-bind:class="[getSignalIcon(endpoint.signal_level)]"
                ></i
              ></span>
            </span>
          </li>
        </ul>

        <div class="loader-wrap" v-if="isLoadingEndpoints">
          <loader></loader>
        </div>
      </section>

      <section v-if="!isLoading && !endpoints.length">
        <p><em>No WIFI endpoints found. Please try again.</em></p>
        
        <p>Makes sure you are connected to the internet!</p>
      </section>

      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>
    </section>
  </section>
</template>
<script>

const INTERVAL_TIME = 20000;

export default {
  
  name: "connect-to-internet",

  data() {
    return {
      endpoints: [],
      isLoadingEndpoints: false,
      isLoading: true,
      currentConnection: null,
      modalIsOpen: false,
      newConnection: null,
      isTryingToConnect: false,
      incorrectPassword: false,
      interval: null,
    };
  },

  methods: {
    closeOverlay() {
      this.$emit("close");
    },
    selectNetwork(endpoint) {
      if (endpoint.security) {
        this.modalIsOpen = true;
        this.newConnection = endpoint;
      }
    },
    connectToEndpoint() {
      const { ssid, password } = this.newConnection;

      this.isTryingToConnect = true;
      this.$socket.emit("REQUEST_WIFI_CONNECT", { ssid, password });
    },
    closeModal() {
      this.modalIsOpen = false;
      this.newConnection = null;
    },
    getSignalIcon(signalStrength) {
      if (signalStrength > -55) {
        return "fa-wifi";
      }

      if (signalStrength <= -55 && signalStrength >= -70) {
        return "fa-wifi-2";
      }

      if (signalStrength < -70) {
        return "fa-wifi-1";
      }
    },
    requestEndpoints() {
      this.isLoadingEndpoints = true;
      this.$socket.emit("REQUEST_WIFI_ENDPOINTS");
    },
    showPassword() {
      const field = this.$refs.input;
      const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
      field.setAttribute('type', type);
    },
    clearInterval() {
      if ( this.interval ) {
        clearInterval(this.interval);
      }
    },
    setupInterval() {
      this.interval = setInterval(this.requestEndpoints, INTERVAL_TIME);
    }
  },

  created() {
    this.isLoading = true;
    this.requestEndpoints();
    this.setupInterval();
  },

  destroyed() {
    this.clearInterval();
  },

  sockets: {
    BROADCAST_NEW_CONNECTION_STATUS(data) {
      this.isTryingToConnect = false;

      if (data.error && data.error === "incorrect") {
        this.incorrectPassword = true;
      } else {
        this.isLoading = true;
        this.incorrectPassword = false;
        this.modalIsOpen = false;
        this.$socket.emit("REQUEST_WIFI_ENDPOINTS");
      }

      this.clearInterval();
      this.requestEndpoints();
    },
    BROADCAST_INTERNET_DATA(data) {
      this.currentConnection = data.currentConnection ? data.currentConnection[0] : null;

      this.endpoints = data.endpoints
        .filter(item => item.ssid !== this.currentConnection.ssid)
        .sort((a, b) => b.quality - a.quality);

      this.isLoadingEndpoints = this.isLoading = false;
    },
  },
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.modal p {
  font-size: 14px;
}

.current-connection {
  p {
    display: flex;
    align-items: center;

    > i {
      margin-right: $normal-spacing;
    }

    .signal-strength {
      margin-left: auto;
    }
  }
}

.endpoints-list {
  li {
    padding-bottom: $normal-spacing;
    border-bottom: 1px solid #333;
    margin-bottom: $normal-spacing;
    display: flex;
    align-items: center;

    .icon-group {
      width: 40px;
      justify-content: flex-end;
      display: flex;
      margin-left: auto;
      align-items: center;
    }

    .signal-strength {
      color: #fff;
      margin-left: $normal-spacing;
    }
  }
}
</style>
