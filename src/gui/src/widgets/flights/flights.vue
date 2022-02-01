<template>
  <transition name="fade">
    <div
      class="component flights"
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
            Please provide a valid API key through the Senses - App. You will need to register an account at Schiphol Developer Center.
          </p>
        </section>

        <section v-else>
          <div v-if="module.settings.showArrivals">
            <h5>Arrivals</h5>
            <ul class="flights-list" v-if="flights.arrivals.length">
              <li v-bind:key="key" v-for="(item, key) in flights.arrivals">
                <section
                  class="flight-item"
                  v-bind:class="{
                    cancelled: isCancelled(item),
                    'is-landed': isLanded(item),
                  }"
                >
                  <i class="fad fa-plane-arrival"></i>
                  <p>
                    <strong>{{ item.flightName }}</strong>
                    <small v-if="isCancelled(item)"> (cancelled)</small>
                    <span v-if="module.settings.show_airline" class="text-muted"> - {{item.airlineLabel}}</span>
                    <strong v-if="module.settings.show_location" class="text-muted"> ({{item.locationLabel}})</strong>
                    <br />
                    <small v-if="module.settings.show_codeshare" class="also-known-as">{{ formatAlsoKnown(item)}}</small>
                  </p>
                  <span class="flight-item-planned-time">
                    <span class="text-muted text-linethrough">{{
                      formatDate(item.scheduleDateTime)
                    }}</span>
                    - {{ getNewTime(item) }}
                  </span>
                </section>
              </li>
            </ul>
            <p v-if="!flights.arrivals.length">
              No flights arriving to Schiphol soon.
            </p>
          </div>

          <span
            class="divider"
            v-if="
              module.settings.showArrivals && module.settings.showDepartures
            "
          ></span>

          <div v-if="module.settings.showDepartures">
            <h5>Departures</h5>
            <ul class="flights-list" v-if="flights.departures.length">
              <li v-bind:key="key" v-for="(item, key) in flights.departures">
                <section
                  class="flight-item"
                  v-bind:class="{ cancelled: item.cancelled }"
                >
                  <i class="fad fa-plane-departure"></i>
                  <div class="flight-item-title">
                    <p>
                      {{ item.flightName }}
                      <span v-if="module.settings.show_airline" class="text-muted">{{item.airlineLabel}} - </span>
                      <span v-if="module.settings.show_location" class="text-muted">({{item.locationLabel}})</span>
                    </p>
                  </div>
                  <span class="flight-item-planned-time"
                    ><span class="text-muted text-strikethrough">{{
                      formatDate(item.scheduleDateTime)
                    }}</span>
                  </span>
                </section>
              </li>
            </ul>
            <p v-if="!flights.departures.length">
              No flights leaving from Schiphol soon.
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
  name: "flights",

  props: ["module"],

  data() {
    return {
      flights: [],
      isLoading: true,
      error: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_FLIGHTS");
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.todos) {
        return {
          animationDelay: 0.25 * (this.flights ? this.flights.length : 1) + "s",
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
    isCancelled(item) {
      return item.publicFlightState &&
        item.publicFlightState.flightStates.includes("CNX")
        ? true
        : false;
    },
    isLanded(item) {
      return item.publicFlightState &&
        ( item.publicFlightState.flightStates.includes("LND") || item.publicFlightState.flightStates.includes("FIB") )
        ? true
        : false;
    },
    formatDate(date) {
      return moment(date).format("HH:mm");
    },
    formatAlsoKnown(item) {
      return item.codeshares ? item.codeshares.codeshares.join(', ') : '';
    },
    getNewTime(item) {
      return (item.actualLandingTime
        ? moment(item.actualLandingTime)
        : item.estimatedLandingTime
        ? moment(item.estimatedLandingTime)
        : moment(item.scheduleDateTime)
      ).format("HH:mm");
    },
    getLocationFromAirportCode() {

    },
    handler(data) {
      if (data.error) {
        this.error = data.error;
      } else {
        this.error = false;
        this.flights = data.flights;

        if ( this.flights ) {
          let flight = this.flights.arrivals[0];

          if ( ! flight ) {
            flight = this.flights.departures[0];
          }

          this.pushMinimalWidgetData({
            header: 'Flight',
            text: `<span>${flight.flightName}</span>`,
            footer: this.getNewTime(flight)
          });
        }
      }
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    },
  },

  created() {
    this.subscribe("BROADCAST_FLIGHTS", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.text-linethrough {
  text-decoration: line-through;
}

.last {
  h5 {
    text-align: right;
  }

  .divider {
    display: flex;
    margin-left: auto;
  }

  .flights-list {
    .flight-item {
      flex-direction: row-reverse;

      &-title {
        text-align: right;
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
    color: $text-muted;
  }
}

.divider {
  display: inline-block;
  width: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  height: 1px;
  margin-bottom: $large-spacing;
}

.flight-item-title {
  display: flex;
  flex-direction: column;
}

.flights-list {
  margin-bottom: $large-spacing;

  li:nth-child(-n + 2) {
    color: #fff;
  }

  .flight-item {
    display: flex;
    margin-bottom: $normal-spacing;
    align-items: center;

    .also-known-as {
      // display: none;
    }

    p {
      margin-bottom: 0;
    }

    &.is-landed i:before {
      transform: rotate(-15deg);
      top: 3px;
    }

    &.cancelled {
      opacity: 0.6;

      .flight-item-planned-time {
        text-decoration: line-through;
      }
    }

    .highlight {
      font-style: italic;
      font-weight: normal;
      color: white;
    }

    &-planned-time {
      font-weight: 700;
      margin-left: auto;
    }

    i {
      margin-top: 2px;
      margin-right: $normal-spacing;
      font-size: 18px;

      &:before {
        top: -2px;
      }
    }
  }
}
</style>
