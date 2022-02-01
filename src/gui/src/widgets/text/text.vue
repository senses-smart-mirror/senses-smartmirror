<template>
  <transition name="fade">
    <div
      class="component text text-widget"
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

      <section v-if="!isLoading">
        <div v-html="formattedText"></div>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "text-editor",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      widgetData: null,
      formattedText: ""
    };
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },

  methods: {
    formatWidgetData() {
      const text = this.module.settings.text;
      const res = text.match(/([^{]*?)\w(?=\})/gim);

      if (res && res.length) {
        res.forEach((string) => {
          const data = this.getWidgetText(string);
          const text = data && data[0] ? data[0].text : `{{${res}}}`;

          this.formattedText = this.module.settings.text.replace(
            `{{${string}}}`,
            text
          );
        });
      } else {
        this.formattedText = this.module.settings.text;
      }
    },
  },

  watch: {
    "$store.state.widgetData": {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.formatWidgetData();
        this.isLoading = false;
      },
    },
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;

        const text = this.module.settings.text;
        const res = text.match(/([^{]*?)\w(?=\})/gim);

        if (!res || !res.length) {
          this.formattedText = this.module.settings.text;
        } else {
          this.formatWidgetData();
        }


        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      },
    },
  },
};
</script>

<style lang="scss">
@import "../../styles/vars";
@import "../../styles/partials/animations";

.text i.fad {
  font-size: 20px;
}

.text hr {
  margin: $large-spacing 0;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
