<template>
  <div
    class="clock component"
    v-if="module.settings.show"
    v-bind:class="[componentDesign]"
    v-bind:style="styles"
  >
    <header>
      <h4 v-show="module.settings.header">
        <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
        {{ module.settings.header }}
      </h4>
    </header>
    <section v-if="!isLoading">
      <section class="clock-timer">
        <i class="fal fa-clock clock-icon"></i>
        <span class="clock-hours text-bright" v-if="module.settings.showAMPM">{{ now.format("hh") }}:</span>
        <span class="clock-hours text-bright" v-if="!module.settings.showAMPM">{{ now.format("HH") }}:</span>
        <span class="clock-minutes text-bright">{{ now.format("mm") }}</span>
        <span class="clock-seconds">{{ now.format("ss") }} </span>
        <span v-if="module.settings.showAMPM" class="clock-ampm text-bright">{{
          now.format("A")
        }}</span>
      </section>
      <p class="clock-location">
        <span v-if="module.settings.showLocation"><i class="fad fa-map-marker-alt"></i>{{module.settings.location.trim()}}</span>
        <span v-show="module.settings.showLocation && module.settings.showDate">,</span>
        <span class="clock-date" v-if="module.settings.showDate"> {{ now.format("dddd, DD MMMM YYYY") }}</span>
      </p>
    </section>

    <section v-if="isLoading">
      <loader></loader>
    </section>
  </div>
</template>

<script>
import moment from "moment";
import "moment-timezone";

export default {
  name: "clock",

  props: ["module"],

  data() {
    return {
      now: moment(),
      isLoading: true
    };
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px"
      };
    }
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 1500);
      }
    }
  },

  created() {
    this.now = moment().tz(this.module.settings.timezone);
  },

  mounted() {
    this.$options.interval = setInterval(this.updateDateTime, 1000);
  },

  beforeDestroy() {
    clearInterval(this.$options.interval);
  },

  methods: {
    updateDateTime() {
      this.now = moment().tz(this.module.settings.timezone);

      this.pushMinimalWidgetData({
        header: 'Time',
        text: `<span class="text-medium">${this.now.format('HH:mm')}</span>`,
        footer: this.module.settings.location.trim()
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last .clock {
  text-align: right;
}

.clock {
  &-timer {
    margin: 0 0 $large-spacing 0;
  }

  &-icon {
    color: #5fd3ff;
    font-size: $font-size * 4;
    margin-right: $normal-spacing;
  }

  &-location {
    font-weight: $thick-font-weight;

    i {
      font-size: 20px;
      margin-right: $small-spacing;
    }
  }

  &-hours,
  &-minutes,
  &-seconds,
  &-ampm {
    font-weight: $light-font-weight;
  }

  &-hours,
  &-minutes,
  &-ampm {
    font-size: $font-size * 4;
  }

  &-ampm {
    margin-left: $normal-spacing;
    font-size: 28px;
  }

  &-seconds {
    margin-left: 5px;
    font-size: $font-size * 2;
    font-weight: $font-weight;
    color: rgba(255,255,255,.6)
  }
}
</style>
