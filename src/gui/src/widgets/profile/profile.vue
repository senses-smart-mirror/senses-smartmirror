<template>
  <transition name="fade">
    <div
      class="component profile"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
      v-bind:style="styles"
      v-if="module.settings.show"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

      <section v-if="!error && !isLoading" class="">
        <div v-if="module.settings.show_welcome_only">
          <transition name="fade">
            <div v-if="!fadeOut">
              <h1 class="text-bright" v-html="profile.welcome"></h1>
            </div>
          </transition>
        </div>

        <div
          v-if="
            !module.settings.show_welcome_only &&
            module.settings.show_which_profile
          "
        >
          <p>
            Active profile: <strong>{{ profile.label }}</strong>
          </p>
        </div>
      </section>

      <section v-if="error.length && !isLoading"></section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>
<script>
export default {
  name: "profile",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      profile: {},
      fadeOut: false
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_PROFILE_DATA");

        if ( this.module.settings.animate_welcome_message) {
          setTimeout(() => this.fadeOut = true, 10000);
        } else {
          this.fadeOut = false;
        }
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
      this.profile = data;

      this.pushMinimalWidgetData({
        header: 'Profile',
        text: `<span class="text-small">${this.profile.name}</span>`,
        footer: "Active"
      });

      this.storeWidgetText({text: `Profile <strong>${this.profile.name}</strong> is currently set as active profile.`});

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },

  created() {
    this.subscribe("BROADCAST_PROFILE_DATA", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last .profile {
  text-align: right;
}
</style>
