<template>
  <div
    class="internet-connection component"
    v-bind:class="[componentDesign]"
    v-bind:style="styles"
    v-if="module.settings.show"
  >
    <header>
      <h4 v-show="module.settings.header">
        <i
          v-show="showHeaderIcon"
          class="header-icon"
          v-bind:class="module.icon"
        ></i>
        {{ module.settings.header }}
      </h4>
    </header>
    <section class="content" v-if="!error && !isLoading">
      <p>Network: <strong>{{internet.ssid}}</strong></p>
      <p>Signal: <i class="fad" v-bind:class="[getSignalIcon(internet.signal_level)]"></i></p>

      <section v-if="module.settings.showQr && qr">
        <p>WIFI Connect QR Code:</p>
        <img v-bind:src="qr" alt="" />
      </section>
    </section>

    <section v-if="error && !isLoading">
        <p class="error-msg" v-if="error">Cannot get data at this time.</p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
  </div>
</template>
<script>
export default {
  name: "internet-connection",

  props: ["module"],

  data() {
    return {
      internet: "",
      qr: "",
      error: null,
      isLoading: true
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_INTERNET_CONNECTION_DATA");
      },
    },
  },

  created() {
    this.subscribe("BROADCAST_INTERNET_CONNECTION_DATA", this.handler);
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },

  methods: {
    handler(data) {
      if ( data.error ) {
        this.error = data.error;
      } else {
        this.internet = data.internet && data.internet.length ? data.internet[0] : null;
        this.qr = data.qr || null;
      }

      this.isLoading = false;
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
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last {
  .content {
    text-align: right;
  }
}
</style>
