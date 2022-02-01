<template>
  <div class="grid">
    <div
      class="columns"
      v-show="!settings.show_clock && !settings.show_minimal"
    >
      <div
        class="column"
        v-bind:key="column.id"
        v-if="column.id !== 1000"
        v-bind:class="{ last: index === grid.length - 2, fill: settings['column_'+column.id+'_background'] }"
        v-for="(column, index) in grid"
      >
        <section class="top-components">
          <component
            v-bind:is="component.name"
            v-bind:module="component"
            v-for="component in formatSettings(column.topComponents)"
            v-bind:key="component.id"
          >
          </component>
        </section>

        <section
          v-if="shouldHaveAnimation(column)"
          class="bottom-components-grouped"
        >
          <animator
            v-bind:components="formatSettings(column.bottomComponents)"
          ></animator>
        </section>

        <section v-if="!shouldHaveAnimation(column)" class="">
          <component
            v-bind:is="component.name"
            v-bind:module="component"
            v-for="component in formatSettings(column.bottomComponents)"
            v-bind:key="component.id"
          >
          </component>
        </section>
      </div>

      <div
        class="overlay"
        v-bind:style="{ padding: borderWidth + 'px' }"
        v-bind:key="column.id"
        v-if="column.id == 1000"
        v-for="column in grid"
      >
        <div
          class="overlay-top-area"
          v-bind:style="{ width: overlayWidth + 'px' }"
        >
          <component
            v-bind:is="component.name"
            v-bind:module="component"
            v-for="component in formatSettings(column.topComponents)"
            v-bind:key="component.id"
          >
          </component>
        </div>
        <div
          class="overlay-bottom-area"
          v-bind:style="{ width: overlayWidth + 'px' }"
        >
          <component
            v-bind:is="component.name"
            v-bind:module="component"
            v-for="component in formatSettings(column.bottomComponents)"
            v-bind:key="component.id"
          >
            >
          </component>
        </div>
      </div>
    </div>
    <div>
      <full-clock v-if="settings.show_clock" :settings="settings"></full-clock>
    </div>
    <section v-if="settings.show_minimal">
      <wake-up :settings="settings"></wake-up>
    </section>
  </div>
</template>

<script>
import Vue from "vue";

import animator from "../animator/animator";
import fullClock from "../../../widgets/full-clock/full-clock";
import wakeUp from "../wake-up/wake-up";

let COMPONENTS = { animator, fullClock, wakeUp };
let loadedComponents = [];

import externalComponent from "../../helpers/externalComponent";
import removeExistingScriptTag from '../../helpers/removeExistingScriptTag';
import Api from "../../helpers/api";

const loadWidgets = () => {
  return Api.axios.get("widgets").then((data) => {
    data.data.forEach((item) => {
      if (loadedComponents.indexOf(item.name) === -1) {
        const component = () => externalComponent(item);
        Vue.component(item.name, component);
        loadedComponents.push(item.name);
      } else {
        const removed = removeExistingScriptTag(item);

        if ( removed ) {
          const component = () => externalComponent(item);
          Vue.component(item.name, component);
        }
      }
    });
  });
};

export default {
  name: "grid",

  props: ["config", "settings"],

  components: COMPONENTS,

  data() {
    return {
      grid: {},
      groupedComponents: [],
      interval: null,
      navigationData: [],
      currentActiveSlide: 0,
    };
  },

  methods: {
    shouldHaveAnimation(column) {
      return this.settings["column_" + column.id + "_animation"] || false;
    },
    formatSettings(items) {
      if (!items) return;
      items.forEach((i) => {
        let rv = {};
        if (i.settings && i.settings.length >= 0) {
          i.settings.forEach((s) => {
            rv[s.name] = s.value;
          });
          i.settings = rv;
        }
      });
      return items;
    },
  },

  watch: {
    config: {
      immediate: true,
      handler(newVal) {
        loadWidgets().finally(() => {
          this.grid = newVal;
        });
      },
    },
    settings: {
      immediate: true,
      handler() {
       // this.settings = newVal;
      },
    },
  },

  created() {
    this.grid = this.config;
  },

  computed: {
    borderWidth() {
      return this.settings.border_width;
    },
    overlayWidth() {
      return this.settings.overlay_width;
    },
  },
};
</script>

<style lang="scss" scoped></style>
