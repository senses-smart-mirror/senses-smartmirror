<template>
  <transition name="fade">
    <div
      class="component version-viewer"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
      v-bind:style="styles"
      v-if="module.settings.show && conditionalShow"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

      <section class="versions-list" v-if="!isLoading">
        <p>Smart Mirror versions</p>
        <p>
          Installed:
          <strong>{{ version.current }}</strong>
          <br />Latest:
          <strong>{{ version.latest || 'not known' }}</strong>
        </p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "version-viewer",

  props: ["module"],

  data() {
    return {
      version: {},
      isLoading: true,
      error: false,
      interval: null,
      sentNotification: false
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.intervalHandler();
        this.sentNotification = false;
        if (this.interval) { clearInterval(this.interval); }
        this.interval = setInterval(this.intervalHandler, 60000 * 5); // 5 min
        this.isLoading = true;
      }
    }
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px"
      };
    },
    conditionalShow() {
      if (this.version && this.module.settings.conditional_show) {
        if (this.version.current == this.version.latest) {
          return false;
        }
      }
      return true;
    }
  },

  methods: {
    intervalHandler() {
      this.emit("REQUEST_VERSION_DATA");
    },
    handler(data) {
      this.error = data.error ? data.error : false;

      this.version = data;
      this.isLoading = false;

      if (this.module.settings.push_notification && !this.sentNotification) {
        if (this.version.current < this.version.latest) {
          this.sentNotification = true;
          const notification = {
            title: `There is a new version of the Smart Mirror available! <strong>(${this.version.latest})</strong> <span class="text-muted">Trigger the update in the App.</span>`
          }
          this.emitNotification(notification);
        }
      }
    }
  },

  destroyed() {
    clearInterval(this.interval);
  },

  created() {
    this.subscribe("BROADCAST_VERSION_DATA", this.handler);
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .versions-list {
    text-align: right;
  }
}
</style>
