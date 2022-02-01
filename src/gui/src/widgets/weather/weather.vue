<template>
  <transition name="fade">
    <div
      class="component weather"
      v-bind:class="[componentDesign]"
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
        <div class="weather-current">
          <i
            class="fad text-bright"
            :class="[
              'fa-' + icons[weather.weather[0].icon],
              { 'icon-moon-active': isMoonActive() },
            ]"
          ></i>
          <p class="text-bright m0">
            {{ Math.round(weather.main.temp * 10) / 10 }}
            <span>&deg;</span>
          </p>
        </div>

        <div class="weather-description">
          <p>
            <span v-if="module.settings.showDescription">
              {{uppercaseFirst(weather.weather[0].description)}}
            </span><span v-show="module.settings.showDescription && module.settings.showLocation">in&nbsp;</span>
            <span v-if="module.settings.showLocation">{{module.settings.cityId}}</span>
          </p>
        </div>

        <div
          v-if="module.settings.showWindInformation"
          class="weather-wind text-bright"
        >
          <i class="fad" :class="'fa-wind'"></i>
          <span class="weather-wind-speed">
            {{ toBeaufort(weather.wind.speed) }}
          </span>
          <span class="weather-wind-direction text-muted">
            {{ getCardinalDirection(weather.wind.deg) }}
          </span>
          <i class="fad fa-sunrise"></i>
          <span class="text-muted">{{ parseTime(weather.sys.sunrise) }}</span>
        </div>

      </section>
      <section v-if="error">
        <p class="error-msg text-center">
          Cannot display weather information at this time.
        </p>
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
  "09d": "cloud-showers",
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
  "50n": "cloud-moon",
};

export default {
  name: "weather",

  props: ["module"],

  data() {
    return {
      url: "",
      temp: "",
      weather: {},
      error: false,
      isLoading: true,
      icons: ICON_MAPPING,
      interval: null,
    };
  },

  destroyed() {
    clearInterval(this.interval);
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },

  watch: {
    module: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          clearInterval(this.interval);
          this.pollWeatherData();
          this.interval = setInterval(
            this.pollWeatherData,
            newVal.settings.interval || 30000
          );
          this.isLoading = true;
        }
      },
    },
  },

  methods: {
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
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

      this.api
        .get(this.url)
        .then((res) => {
          this.weather = res.data;
          setTimeout(() => {
            this.isLoading = false;
          }, 1500);
          this.error = false;

          this.pushMinimalWidgetData({
            header: "Weather",
            text: `${Math.round(
              this.weather.main.temp
            )}<span style="position: absolute; top: -10px;">&deg;</span>`,
            footer: this.weather.weather[0].description,
          });

          this.storeWidgetText({text: `Today's temperture is <strong>${Math.round(this.weather.main.temp)} &deg;</strong> (${this.weather.weather[0].description}).`});
        })
        .catch((err) => {
          console.log(
            `COMPONENT ${this.$options.name}: Cannot get weather details`,
            err
          );
          this.error = true;
          this.isLoading = false;
          this.emitLog(`[Weather] - error: ${err.message}`);
        });
    },
    parseTime(timestamp) {
      return moment(new Date(1000 * timestamp)).format("hh:mm");
    },
    toBeaufort(ms) {
      return Math.round(Math.pow(Math.pow(ms / 0.836, 0.33), 2));
    },
    getCardinalDirection(angle) {
      if (!angle) return "";
      if (typeof angle === "string") angle = parseInt(angle);
      if (angle <= 0 || angle > 360 || typeof angle === "undefined") return "☈";
      const arrows = {
        north: "↑N",
        north_east: "↗NE",
        east: "→E",
        south_east: "↘SE",
        south: "↓S",
        south_west: "↙SW",
        west: "←W",
        north_west: "↖NW",
      };
      const directions = Object.keys(arrows);
      const degree = 360 / directions.length;
      angle = angle + degree / 2;
      for (let i = 0; i < directions.length; i++) {
        if (angle >= i * degree && angle < (i + 1) * degree)
          return arrows[directions[i]];
      }
      return arrows["north"];
    },
    isMoonActive() {
      return this.icons[this.weather.weather[0].icon].indexOf("moon") >= 0;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last .weather {
  &-wind,
  &-current {
    justify-content: flex-end;
  }

  .weather-description,
  .error-msg {
    margin-left: auto;
    text-align: right;
  }
}

.weather {
  &-wind,
  &-current {
    display: flex;
    align-items: center;
    flex-direction: row;

    p {
      font-weight: 300;
    }
  }

  &-wind {
    margin-top: $large-spacing;
  }

  &-wind-speed {
    font-size: 14px;
    text-align: left;
    position: relative;
    font-weight: bold;
    left: -8px;
    top: 5px;
  }

  &-wind {
    align-items: center;
    font-size: $font-size * 2;

    > i,
    > span {
      margin-left: $normal-spacing;
    }

    i.wi {
      font-size: $font-size * 2;
    }

    &-direction {
      position: relative;
      top: -5px;
      left: -10px;
      font-weight: $thick-font-weight;
      font-size: $font-size;
    }
  }

  .weather-description {
    margin: $large-spacing 0 0;
    text-align: left;

    p {
      font-weight: 500;
      margin: 0;
    }
  }

  &-current {
    font-size: $font-size * 4;
    font-weight: 300;
    margin-bottom: $large-spacing;

    > i {
      margin-right: $large-spacing;
      &:after {
        color: yellow;
        opacity: 1;
      }

      &.icon-moon-active:after {
        color: orange;
      }
    }
  }
}
</style>
