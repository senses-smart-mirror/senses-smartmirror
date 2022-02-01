<template>
  <transition name="fade">
    <div
      class="component stocks"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
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

      <section v-if="!isLoading">
        <p v-if="error === true">Not able to load stocks data at this time.</p>

        <p v-if="error && limitError">
          Api limit has been reached. Please use a different Api Key or wait
          until the Api is available again.
        </p>

        <p v-if="error === 'no_symbol'">
          No symbols provided, add your first symbols through the
          <strong>Smart Mirror</strong> app.
        </p>

        <p v-if="error === 'no_apikey'">
          No Api Key specified, add your Api Key through the
          <strong>Smart Mirror</strong> app. You will find the instructions in the Senses - App.
        </p>

        <ul v-if="!error">
          <li class="stocks-item" v-bind:key="key" v-for="(item, key) in list">
            <i class="fa fa-chart-line"></i>
            {{ item.symbol }}

            <span class="stocks-item-value">$ {{ Math.round(item.data.c * 100) / 100 }}</span>
            <span class="stocks-item-change text-muted">({{ Math.round(item.data.dp * 100) / 100 }} %)</span>
          </li>
        </ul>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "stocks",

  props: ["module"],

  data() {
    return {
      list: [],
      isLoading: true,
      error: false,
      limitError: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_STOCKS");
        this.isLoading = true;
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.list.length) {
        return {
          width: this.module.settings.widget_width + "px",
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px",
        };
      }
    },
  },

  methods: {
    handleResult(data) {
      if (data.error || data.Information) {
        this.error = data.error || true;
        this.isLoading = false;

        this.limitError = data.Information ? true : false;
        return;
      } else {
        this.error = this.limitError = false;
        this.list = data;
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },

  created() {
    this.subscribe("BROADCAST_STOCKS", this.handleResult);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  p {
    text-align: right;
  }
}

.stocks-item {
  display: flex;
  align-items: center;
  margin-bottom: $normal-spacing;
  font-size: 14px;

  &:first-child {
    font-weight: 700;
  }

  > i {
    font-size: 20px;
    margin-right: $normal-spacing;
  }

  .stocks-item-value {
    margin-left: auto;
  }

  .stocks-item-change {
    margin-left: $small-spacing;
  }
}
</style>
