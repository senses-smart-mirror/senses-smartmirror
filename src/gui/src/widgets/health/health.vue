<template>
  <transition name="fade">
    <div
      class="component health"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
      v-bind:style="styles"
      v-if="module.settings.show"
    >
      <header>
        <h4 v-show="module.settings.header">{{ module.settings.header }}</h4>
      </header>
      <section v-if="!error && !isLoading" class=""></section>

      <section v-if="error.length && !isLoading"></section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>
<script>
export default {
  name: "health",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_HEALTH_DATA");
        this.isLoading = true;
      },
    },
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
      console.log("health data:", data);

      setTimeout(() => {
        this.isLoading = false;
      }, 1500);
    },
  },

  created() {
    this.subscribe("BROADCAST_HEALTH_DATA", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
}
</style>
