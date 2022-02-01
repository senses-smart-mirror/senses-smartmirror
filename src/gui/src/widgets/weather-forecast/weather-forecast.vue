<template>
  <transition name="fade">
    <div
      class="component weather-forecast"
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
      <section v-if="!error && !isLoading" class="weather-details">
        <ul v-if="!module.settings.showGraph" class="forecast-list">
          <li v-bind:key="key" v-for="(item, key) in forecast.list">
            <span class="forecast-item-date text-bright">
              {{
              parseTime(item.dt)
              }}
            </span>
            <i class="icon fad" :class="'fa-' + icons[item.weather[0].icon]"></i>
            <strong class="text-bright">{{ Math.round(item.main.temp_min * 10) / 10 }}&deg;</strong>
            <span class="last">{{ Math.round(item.main.temp_max * 10) / 10 }}&deg;</span>
          </li>
        </ul>

        <div class="forecast-graph" v-if="module.settings.showGraph">
          <div class="forecast-graph-legend text-bright">
            <span class="legend-high">{{ this.graphData.max }}&deg;</span>
            <span class="legend-mid">{{ this.graphData.mid }}&deg;</span>
            <span class="legend-low">{{ this.graphData.min }}&deg;</span>
          </div>
          <div class="graph">
            <trend
              v-if="timeToDraw"
              :data="graphData.items"
              :gradient="['#ffffff']"
              :height="80"
              :width="240"
              :autoDrawDuration="1000"
              auto-draw
              smooth
            ></trend>
          </div>
          <div class="graph-xas">
            <ul>
              <li v-bind:key="item" v-for="item in graphData.xas">{{ item }}</li>
            </ul>
          </div>
        </div>
      </section>
      <section v-if="error">
        <p class="error-msg">Cannot display weather information at this time.</p>
      </section>
      <section v-if="noApiKeyError">
        <p class="error-msg">Please provide a Weather API Url in the App.</p>
      </section>
      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import moment from "moment";

const ICON_MAPPING = {
  "01d": "sun",
  "02d": "cloud-sun",
  "03d": "sun-cloud",
  "04d": "clouds",
  "09d": "showers",
  "10d": "cloud-rain",
  "11d": "thunderstorm",
  "13d": "cloud-snow",
  "50d": "fog",
  "01n": "moon",
  "02n": "cloud-moon",
  "03n": "cloud-moon",
  "04n": "cloud-moon",
  "09n": "cloud-moon-rain",
  "10n": "cloud-moon-rain",
  "11n": "thunderstorm-moon",
  "13n": "snow",
  "50n": "cloud-moon"
};

export default {
  name: "weather-forecast",

  props: ["module"],

  data() {
    return {
      forecast: {},
      error: false,
      isLoading: true,
      icons: ICON_MAPPING,
      graphData: { xas: [], items: [], max: 0, min: 0 },
      timeToDraw: false,
      animateOut: false,
      noApiKeyError: false
    };
  },

  created() {
    if (!this.module.settings.showAnimation) {
      this.timeToDraw = true;
    }
  },

  destroyed() {
    clearInterval(this.interval);
  },

  watch: {
    module: {
      immediate: true,
      handler(newVal) {

        if ( ! newVal.settings.apiKey ) {
          this.noApiKeyError = true;
          this.isLoading = false;
          this.error = true;
        } else {
          this.noApiKeyError = false;
        }

        clearInterval(this.interval);
        this.pollWeatherData();
        this.interval = setInterval(
          this.pollWeatherData,
          newVal.settings.interval || 30000
        );
      }
    },
    animationStarted: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.isLoading = false;
          setTimeout(() => {
            this.timeToDraw = true;
          }, 1000);
        }
      }
    }
  },

  methods: {
    animationOutCallback() {
      this.timeToDraw = false;
    },
    createUrl() {
      let cfg = this.module.settings;
      let url = `${cfg.defaultUrl}?q=${cfg.cityId}`;
      url += `&APPID=${cfg.apiKey}`;
      url += `&units=${cfg.units}`;
      url += `&lang=${cfg.lang}`;
      this.url = url;
    },
    pollWeatherData() {
      this.createUrl();

      if (this.url.indexOf("undefined") > -1) return;

      this.api
        .get(this.url)
        .then(res => {
          this.error = false;
          this.forecast = res.data;

          this.forecast.list = this.forecast.list.filter(item => {
            if (moment(item.dt_txt).format("HH") == "12") return item;
          });

          if (this.module.settings.showGraph) {
            this.createGraphData();
          }

          if ( this.module.settings.pushNotification ) {
            this.pushNotification();
          }

          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        })
        .catch(err => {
          console.log(
            `COMPONENT ${this.$options.name}: Cannot get weather forecast`,
            err
          );
          this.error = true;
          this.isLoading = false;
          this.emitLog(`[Weather Forecast] - error: ${err.message}`);
        });
    },
    parseTime(dateTime) {
      return moment(new Date(1000 * dateTime)).format("ddd");
    },
    pushNotification() {
      // TODO: implement push notification if bad / good weather is coming in the next few days.
    },
    createGraphData() {
      if (this.forecast) {
        this.graphData.items = [];
        this.graphData.xas = [];
        let sum = 0;

        this.forecast.list.forEach(item => {
          let temp = Math.round(item.main.temp);
          let day = moment(1000 * item.dt).format("dd");

          sum += temp;
          this.graphData.items.push(temp);
          this.graphData.xas.push(day);
        });

        this.graphData.mid = Math.round(sum / 5);
        this.graphData.max = Math.max(...this.graphData.items);
        this.graphData.min = Math.min(...this.graphData.items);
      }
    }
  },

  computed: {
    styles() {
      if (this.animateOut) {
        return {
          animationDelay:
            0.25 *
              (this.module.settings.showGrap ? 2 : this.forecast.list.length) +
            "s",
          width: this.module.settings.widget_width + "px"
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px"
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .weather-forecast {
    text-align: right;

    .forecast-list {
      margin-left: auto;
    }
  }
}

.weather-forecast {
  display: flex;
  justify-content: flex-end;
}

.weather-details {
  position: relative;
}

.forecast-list {
  display: flex;
  flex-direction: column;

  .forecast-item-date {
    font-weight: 700;
  }

  .icon {
    font-size: 16px;
  }

  li {
    display: flex;
    flex-direction: row;
    min-height: 36px;
    align-items: center;

    > * {
      flex-grow: 1;
      width: 12%;
    }
  }
}

.forecast-graph {
  display: inline-block;
  position: relative;
  height: 80px;
  width: 260px;
  text-align: left;

  .graph {
    min-height: 90px;
    min-width: 260px;
  }

  .graph-xas {
    position: relative;
    left: $normal-spacing * 2.5;
    bottom: 0;

    ul {
      width: 240px;
      display: flex;
      justify-content: space-between;
    }
  }

  svg {
    margin-left: $normal-spacing * 2.5;
  }
}

.forecast-graph-legend {
  position: absolute;
  height: 100%;
  min-width: 20px;
  min-height: 80px;

  span {
    position: absolute;
    left: 0;

    &:first-child {
      top: 0;
    }
    &.legend-mid {
      top: 40%;
    }
    &:last-child {
      bottom: 0;
    }
  }
}
</style>
