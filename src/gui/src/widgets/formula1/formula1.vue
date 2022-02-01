<template>
  <transition name="fade">
    <div
      class="component formula formula1 box-style"
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
      <section class="main-content" v-if="!error && !isLoading">
        <div class="section-list" v-if="module.settings.showDriverStandings && driverStandings">
          <h6>Driver Standings</h6>

          <ul class="driver-list list">
            <li class="list-header">
              <i class="fad fa-user"></i>
              <i class="fad fa-car"></i>
              <i class="fad fa-sort-numeric-up-alt text-center"></i>
              <i class="fad fa-trophy-alt text-center"></i>
            </li>
            <li
              v-bind:key="key"
              v-for="(item, key) in driverStandings.DriverStandings"
            >
              {{ item.Driver.familyName }}

              <span class="driver-constructor text-muted">{{
                item.Constructors[0].name
              }}</span>
              <span class="driver-points text-center">{{ item.points }}</span>
              <span class="driver-wins text-center">({{ item.wins }})</span>
            </li>
          </ul>

          <footer class="list-meta">
            <span
              >Season <strong>{{ driverStandings.season }}</strong
              >, Round <strong>{{ driverStandings.round }}</strong></span
            >
          </footer>
        </div>

        <div
          class="section-list"
          v-if="module.settings.showConstructorStandings"
        >
          <h6>Constructor Standings</h6>

          <ul class="constructors-list list">
            <li class="list-header">
              <i class="fad fa-car"></i>
              <i class="fad fa-sort-numeric-up-alt text-center"></i>
              <i class="fad fa-trophy-alt text-center"></i>
            </li>
            <li
              v-bind:key="key"
              v-for="(item, key) in constructorsStandings.ConstructorStandings"
            >
              {{ item.Constructor.name }}
              <span class="text-center">{{ item.points }}</span>
              <span class="text-center">({{ item.wins }})</span>
            </li>
          </ul>

          <footer class="list-meta">
            <span
              >Season <strong>{{ constructorsStandings.season }}</strong
              >, Round <strong>{{ constructorsStandings.round }}</strong></span
            >
          </footer>
        </div>

        <div class="section-list" v-if="module.settings.showRaceSchedule">
          <h6>Race schedule</h6>

          <p v-if="!raceTable.Races.length">
            <em>No upcoming races.</em>
          </p>

          <ul v-if="raceTable.Races.length" class="race-schedule-list list">
            <li class="list-header">
              <i class="fad fa-list-ol"></i>
              <i class="fad fa-route"></i>
              <i class="fad fa-calendar-week text-center"></i>
            </li>
            <li v-bind:key="key" v-for="(item, key) in raceTable.Races">
              <span class="race-schedule-round text-center">{{
                item.round
              }}</span>
              <span
                >{{ item.Circuit.circuitName }} <br />
                <small>{{ item.Circuit.Location.country }}</small></span
              >
              <span class="race-schedule-date text-center">{{
                moment(item.date).format("DD MMM 'YY")
              }}</span>
            </li>
          </ul>
        </div>

        <div class="section-list" v-if="module.settings.showLastRaceResult">
          <h6>Last Race Result</h6>

          <ul class="race-result-list list">
            <li class="list-header">
              <i class="fad fa-user"></i>
              <i class="fad fa-sort-amount-down text-center"></i>
              <i class="fad fa-grip-vertical text-center"></i>
            </li>
            <li v-bind:key="key" v-for="(item, key) in raceResult.Results">
              {{ item.Driver.familyName }}
              <span class="text-center">{{ item.points }}</span>
              <span class="text-center" v-if="item.Time">{{
                item.Time.time
              }}</span>
              <span class="text-center" v-if="!item.Time && item.status">{{
                item.status
              }}</span>
            </li>
          </ul>

          <footer class="list-meta">
            <span
              >Season <strong>{{ raceResult.season }}</strong
              >, Round <strong>{{ raceResult.round }}</strong></span
            >
          </footer>
        </div>
      </section>

      <section v-if="error.length && !isLoading">
        <p class="error-msg" v-if="error">Cannot get data at this time.</p>
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
  name: "formula1",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      driverStandings: null,
      constructorsStandings: null,
      moment: moment,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUST_FORMULA1_DATA");

        this.clearInterval();

        if (this.module && this.module.settings.onlyShowInRaceWeekeing) {
          this.intervalHandler();
          this.createInterval();
        }
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut) {
        return {
          animationDelay: 0.2 + "s",
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
    clearInterval() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
      }
    },
    createInterval() {
      this.timeInterval = setInterval(this.intervalHandler.bind(this), 5000);
    },
    intervalHandler() {
      if (this.raceTable) {
        const currentDate = new Date().getTime();
        const nextRace = this.raceTable.Races[0];
        const nextRaceDate = nextRace
          ? new Date(nextRace.date).getTime() - 3 * 24 * 3600000
          : null;

        if (nextRaceDate) {
          if (currentDate > nextRaceDate) {
            this.showWidget();
          } else {
            this.hideWidget();
          }
        }
      }
    },
    handler(data) {
      if (data) {
        this.driverStandings = data.driverStandings;
        this.constructorsStandings = data.constructorStandings;
        this.raceResult = data.raceResult;
        this.raceTable = data.raceTable;

        // filter out passed races
        if ( this.raceTable ) {
          this.raceTable.Races = this.raceTable.Races.filter((item) => {
            return new Date(item.date) > new Date();
          });

          this.raceTable.Races.splice(this.module.settings.raceScheduleLimit);
        }

      } else {
        this.error = true;
      }

      this.isLoading = false;
    },
  },

  created() {
    this.subscribe("BROADCAST_FORMULA1_DATA", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  h6 {
    text-align: right;
  }

  .race-result-list .text-center {
    text-align: right;
  }
}

h6 {
  font-size: 14px;
  font-weight: 700;
}

.main-content {
  > div {
    margin-bottom: $large-spacing;
    position: relative;
    padding-bottom: 30px;

    &:after {
      content: "";
      position: absolute;
      bottom: 10px;
      background-color: rgba(255, 255, 255, 0.1);
      height: 1px;
      width: 60%;
      left: 20%;
    }

    &:last-child {
      margin-bottom: $normal-spacing;
      padding-bottom: 0;
      &:after {
        display: none;
      }
    }
  }
}

.section-list {
  width: 100%;
  font-size: 14px;

  .list-header {
    margin-bottom: $large-spacing;
    font-size: 20px;
    padding-bottom: $medium-spacing * 6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .race-schedule-date {
    font-size: 14px;
  }

  .race-schedule-round {
    min-width: 40px;
    text-align: left;
  }

  .list {
    width: 100%;
    display: table;
    border-collapse: collapse;

    li {
      display: table-row;

      &:nth-child(2),
      &:nth-child(3) {
        font-weight: 700;
        color: #fff;
      }

      &:nth-child(2) span {
        padding-top: 10px;
      }

      > span,
      > i {
        padding: 0 0 $normal-spacing * 1.2 0;
        min-height: 20px;
        display: table-cell;
      }
    }
  }

  footer {
    padding: $medium-spacing;
    text-align: right;
    font-size: 12px;
  }
}
</style>
