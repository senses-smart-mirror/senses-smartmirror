<template>
  <transition name="fade">
    <div
      class="component trains"
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
        <section v-if="error">
          <p v-if="error === 'no_api_key'">
            Please specify an API key through the App.
          </p>
          <p>
            <span
              >Not able to get train data, please provide a known station name
              in the Senses - App.</span
            >
          </p>
        </section>

        <section v-else>
          <section class="disruptions" v-if="module.settings.showDisruptions">
            <h5>Disruptions</h5>
            <ul class="train-list" v-if="trains.disruptions">
              <li v-bind:key="key" v-for="(item, key) in trains.disruptions">
                <section class="train-item">
                  <i class="fad fa-info-circle"></i>
                  <div class="train-item-title">
                    <p>
                      {{ item.title }}
                      <span
                        >({{ formatDate(item.start)
                        }}<span v-if="item.expectedDuration"
                          >-
                          {{ formatDate(item.expectedDuration.endTime) }}</span
                        >)</span
                      >
                    </p>
                    <p
                      class="disruption-summary"
                      v-if="item.summaryAdditionalTravelTime"
                    >
                      {{ item.summaryAdditionalTravelTime.label }}
                      {{ item.expectedDuration.description }}
                    </p>
                  </div>
                </section>
              </li>
            </ul>
            <p v-if="!trains.disruptions.length">
              No disruptions found for station
              {{ module.settings.stationName.label }}.
            </p>
          </section>

          <span
            class="divider"
            v-if="module.settings.showDisruptions && module.settings.showArrivals"
          ></span>

          <div v-if="module.settings.showArrivals">
            <h5>
              Arrivals <span class="text-muted">({{ module.settings.stationName.label }})</span>
            </h5>
            <ul class="train-list">
              <li v-bind:key="key" v-for="(item, key) in trains.arrivals">
                <section
                  class="train-item"
                  v-bind:class="{ cancelled: item.cancelled }"
                >
                  <i class="fad fa-train"></i>
                  <p>
                    {{ item.origin }}
                    <span class="train-category-code text-muted"
                      >({{ item.product.categoryCode }} - {{
                        item.plannedTrack
                      }})</span
                    >
                  </p>
                  <span class="train-item-planned-time"
                    ><span class="text-muted">{{ calculateDelay(item) }}</span>
                    {{ formatDate(item.plannedDateTime) }}
                  </span>
                </section>
              </li>
            </ul>
          </div>

          <span
            class="divider"
            v-if="
              module.settings.showArrivals && module.settings.showDepartures
            "
          ></span>

          <div v-if="module.settings.showDepartures">
            <h5>
              Departures <span>({{ module.settings.stationName.label }})</span>
            </h5>
            <ul class="train-list" v-if="trains.departures.length">
              <li v-bind:key="key" v-for="(item, key) in trains.departures">
                <section
                  class="train-item"
                  v-bind:class="{ cancelled: item.cancelled }"
                >
                  <i class="fad fa-train"></i>
                  <div class="train-item-title">
                    <p>
                      {{ item.direction }}
                      <span class="train-category-code text-muted"
                        >({{ item.product.categoryCode }} -
                        {{ item.plannedTrack }})</span
                      >
                    </p>
                    <small class="train-item-route text-muted"
                      >via {{ getRouteStations(item) }}</small
                    >
                  </div>
                  <span class="train-item-planned-time"
                    ><span class="text-muted">{{ calculateDelay(item) }}</span>
                    {{ formatDate(item.plannedDateTime) }}
                  </span>
                </section>
              </li>
            </ul>
            <p v-else>
              No departures found. Filtering for:
              {{ module.settings.stationFilter }}
            </p>
          </div>
        </section>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import moment from "moment";

export default {
  name: "trains",

  props: ["module"],

  data() {
    return {
      trains: [],
      isLoading: true,
      error: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_TRAINS");
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.todos) {
        return {
          animationDelay: 0.25 * (this.trains ? this.trains.length : 1) + "s",
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
    calculateDelay(item) {
      const duration = moment.duration(
        moment(item.actualDateTime).diff(moment(item.plannedDateTime))
      );
      const durationInMinutes = Math.round(duration.asMinutes());
      return durationInMinutes > 0 ? ` (+${durationInMinutes})` : "";
    },
    getRouteStations(item) {
      let retVal = [];
      if (item.routeStations.length) {
        item.routeStations.forEach((i) => {
          retVal.push(i.mediumName);
        });
      }

      return retVal.join(", ");
    },
    formatDate(date) {
      return moment(date).format("HH:mm");
    },
    handler(data) {
      if (data.error) {
        this.error = data.error;
      } else {
        this.error = false;
        this.trains = data.trains;

        if (this.module.settings.stationFilter && data.trains.departures) {
          this.trains.departures = data.trains.departures.filter(
            (deps) => deps.direction === this.module.settings.stationFilter
          );
        }
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },

  created() {
    this.subscribe("BROADCAST_TRAINS", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  h5 {
    text-align: right;
  }

  .divider {
    display: flex;
    margin-left: auto;
  }

  .train-list {
    .train-item {
      flex-direction: row-reverse;

      &-title {
        text-align: right;
      }

      .train-item-planned-time {
        display: flex;
        flex-direction: row-reverse;
      }

      p {
        display: flex;
        flex-direction: row-reverse;

        span {
          margin-right: $small-spacing;
        }
      }

      &-planned-time {
        margin: 0 auto 0 0;
        text-align: left;

        span {
          margin-left: $small-spacing;
        }
      }

      i {
        margin: 0 0 0 $normal-spacing;
      }
    }
  }

  p {
    text-align: right;
  }
}

h5 {
  span {
    font-size: $font-size;
  }
}

.divider {
  display: inline-block;
  width: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  height: 1px;
  margin-bottom: $large-spacing;
}

.train-item-title {
  display: flex;
  flex-direction: column;
}

.disruptions {
  margin-bottom: $large-spacing;
}

.train-list {
  margin-bottom: $large-spacing;

  li:nth-child(-n + 2) {
    color: #fff;

    p {
      font-weight: 700;
    }
  }

  .train-item {
    display: flex;
    margin-bottom: $large-spacing;
    align-items: center;

    p {
      margin-bottom: 0;
    }

    .highlight {
      font-style: italic;
      font-weight: normal;
      color: white;
    }

    &.cancelled {
      text-decoration: line-through;
    }

    &-route,
    .disruption-summary {
      font-size: $font-size;
      font-weight: normal;
    }

    &-planned-time {
      font-weight: 700;
      margin-left: auto;
      min-width: 100px;
      text-align: right;
    }

    .train-category-code {
      font-weight: normal;
      margin-left: $small-spacing;
    }

    i {
      margin-top: 2px;
      margin-right: $normal-spacing;
      font-size: 20px;
    }
  }
}
</style>
