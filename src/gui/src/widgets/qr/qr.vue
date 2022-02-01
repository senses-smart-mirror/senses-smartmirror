<template>
  <div
    class="qr component"
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
    <section class="content">
      <p>Scan the QR code in order <br />to open the Senses - App.</p>
      <img v-bind:src="url" alt="" />
    </section>
  </div>
</template>
<script>
export default {
  name: "qr",

  props: ["module"],

  data() {
    return {
      url: "",
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_QR_DATA");
      },
    },
  },

  created() {
    this.subscribe("BROADCAST_QR_DATA", this.handler);
  },

  destroyed() {
    clearInterval(this.interval);
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
      this.url = data.data.url;
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
