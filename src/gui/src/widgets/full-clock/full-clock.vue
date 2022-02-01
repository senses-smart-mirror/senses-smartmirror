<template>
  <div class="full-clock component">
    <section class="clock-timer text-center" v-if="now">
      <h2 class="clock-date m0">{{ now.format("dddd, DD MMMM YYYY") }}</h2>
      <div class="clock">
        <div class="clock-hours">
          {{ now.format("HH") }}
        </div>
        <div class="clock-minutes">
          {{ now.format("mm") }}
        </div>
        <div class="clock-minutes">{{ now.format("ss") }}</div>
      </div>
    </section>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@200&display=swap" rel="stylesheet">
  </div>
</template>

<script>
import moment from "moment";
// eslint-disable-next-line no-unused-vars
import tz from "moment-timezone";

export default {
  name: "full-clock",

  props: ["settings"],

  data() {
    return {
      now: null
    };
  },

  watch: {
    settings: {
      immediate: true,
      handler() {
        this.now = moment().tz(this.settings.timezone);
      }
    }
  },

  created() {},

  mounted() {
    this.$options.interval = setInterval(this.updateDateTime, 1000);
  },

  beforeDestroy() {
    clearInterval(this.$options.interval);
  },

  methods: {
    updateDateTime() {
      this.now = moment().tz(this.settings.timezone);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.component {
  width: auto;
}

.clock-timer {
  margin-top: 100px;
  color: white;
  font-size: calc(10vw + 5vh);

  h2 {
    margin-bottom: $large-spacing;
  }

  .clock {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 60px 100px 0;
    font-weight: 200;
    font-family: 'JetBrains Mono', monospace;

    > div {
      border-radius: 25px;
      background-color: #111;
      flex: 0 1 30%;
      position: relative;
    }
  }

  .clock-date {
    color: #777;
  }
}

.use-light-theme {
  .clock-date {
    color: #fff;
  }

  .clock div {
    background-color: rgba(255,255,255,.1);
  }
}
</style>
