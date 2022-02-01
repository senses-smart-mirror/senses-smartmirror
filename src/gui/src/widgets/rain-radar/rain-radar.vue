<template>
  <transition name="fade">
    <div
      class="component rain-radar"
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

      <section v-if="!isLoading">
        <p v-if="error" class="error-msg">Not able to load the rain data.</p>

        <div v-if="!error" class="rain-radar-item">
          <p v-if="startsToRain && !itIsRaining">
            <i class="fad fa-cloud-rain text-bright"></i>
            It will start to rain at:
            <strong class="text-bright">
              {{
                startsToRain.format("HH:mm")
              }}
            </strong>
            (in {{ startsToRain.toNow("mm") }})
          </p>
          <p v-if="itIsRaining">
            <i class="fad fa-cloud-rain text-bright"></i>
            <strong class="text-bright">Its raining outside!</strong>
            <span v-if="stopsToRain && itIsRaining">
              (stops at:
              <strong class="text-bright">
                {{
                  stopsToRain.format("HH:mm")
                }}
              </strong>)
            </span>
          </p>
          <p v-if="!startsToRain">
            <span v-if="stopsToRain">
              (stops at:
              <strong class="text-bright">
                {{
                  stopsToRain.format("HH:mm")
                }}
              </strong>)
            </span>
          </p>

          <div class="line-chart-wrapper" v-if="chartDataLoaded && !noRainAtAll">
            <line-chart :height="120" :width="240" :chartData="chartData"></line-chart>
            <span class="line high-line">high</span>
          </div>

          <p v-if="noRainAtAll">There is no rain expected for at least 2 hours.</p>
        </div>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import lineChart from "../../lib/components/charts/lineChart";
import moment from "moment";

export default {
  name: "rain-radar",

  props: ["module"],

  components: { lineChart },

  data() {
    return {
      list: [],
      isLoading: true,
      error: false,
      chartDataLoaded: false,
      chartData: null,
      startsToRain: null,
      stopsToRain: null,
      noRainAtAll: false,
      itIsRaining: false,
    };
  },

  computed: {
    conditionalShow() {
      const startsToRainTime = this.startsToRain
        ? this.startsToRain.toDate().getTime()
        : null;

      if (this.module.settings.conditionalShow && !this.itIsRaining) {
        if (startsToRainTime > new Date().getTime() + 1800000) {
          return true;
        }

        return false;
      }
      return true;
    },
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

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_RAIN_DATA");
        this.isLoading = true;
        this.fillData();
      },
    },
  },

  methods: {
    fillData() {
      this.chartData = {
        labels: [],
        datasets: [
          {
            label: "Rain",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderWidth: 1,
            pointRadius: 0,
            fill: true,
            data: [],
          },
        ],
      };
    },
    handleResult(data) {
      if (data.error) {
        this.error = true;
        this.isLoading = false;
        return;
      } else {
        this.error = false;
        this.list = [];

        if (data.startRaining) {
          this.startsToRain = moment(data.startRaining, "HH:mm");
        } else {
          this.startsToRain = false;
        }

        if (data.stopsRaining) {
          this.stopsToRain = moment(data.stopsRaining, "HH:mm");
        } else {
          this.stopsRaining = false;
        }

        this.itIsRaining = data.itIsRaining;

        this.chartData.labels = data.timestamps.map((time) => {
          return moment(time, "HH:mm").format("HH:mm");
        });

        if (Math.max(...data.rainDrops) <= 0.01) {
          this.noRainAtAll = true;
        }

        this.chartData.high = Math.max(...data.rainDrops);
        this.chartData.datasets[0].data = data.rainDrops;
        this.chartDataLoaded = true;
      }

      if (this.module.settings.pushNotification && this.startsToRain) {
        const startsToRainTime = this.startsToRain.toDate().getTime();
        if (
          this.itIsRaining ||
          startsToRainTime < new Date().getTime() + 1800000
        ) {
          const notification = {
            title: `It is raining outside! It will stop at: <strong>${this.stopsToRain.format(
              "HH:mm"
            )}</strong>`,
            meta: "",
          };
          this.emitNotification(notification);
        }
      }

      if (this.startsToRain) {
        const startsToRainTime = this.startsToRain.toDate().getTime();
        if (
          this.itIsRaining ||
          startsToRainTime < new Date().getTime() + 1800000
        ) {
          this.storeWidgetText({
            text: `It is raining outside! It will stop at: <strong>${this.stopsToRain.format(
              "HH:mm"
            )}</strong>`,
          });
        }
      } else {
        this.storeWidgetText({
          text: `No rain expect for the coming 30 minutes.`,
        });
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },

  created() {
    this.subscribe("BROADCAST_RAIN_DATA", this.handleResult);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.rain-radar-item {
  i.fad {
    font-size: 20px;
    margin-right: $small-spacing;
  }
}

@import "../../styles/vars";
@import "../../styles/partials/animations";

.rain-radar-item {
  i.fad {
    font-size: 20px;
    margin-right: $small-spacing;
  }
}

span.line {
  position: absolute;
  display: inline-block;
  left: 10px;
  top: 10%;
  width: 90%;
  z-index: 2;
  font-size: 10px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.line-chart-wrapper {
  position: relative;
  margin-left: -10px;

  > div {
    position: relative;
    z-index: 1;
  }
}
