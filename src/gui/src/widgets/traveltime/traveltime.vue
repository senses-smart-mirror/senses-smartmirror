<template>
  <div
    class="component traveltime"
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
    <section class="traveltimes" v-if="!isLoading">
      <ul>
        <li
          class="traveltime-item"
          v-bind:key="key"
          v-for="(route, key) in traffic"
        >
          <div class="traveltime-item-wrapper">
            <i class="fad fa-car"></i>
            <span class="to text-bright">{{ route.name || route.end }}</span>
            <span class="distance text-muted">({{ route.distance.text }})</span>
            <span class="duration">
              <strong>{{ route.duration_in_traffic.text }}</strong>
            </span>
          </div>
          <span class="summary">{{route.summary}}</span>
        </li>
      </ul>
    </section>
    <section v-if="!traffic.length && !isLoading && !error">
      <p>There are no routes specified.</p>
    </section>
    <section v-if="!isLoading && error">
      <p>Cannot load travel time at this time.</p>
    </section>
    <section v-if="!isLoading && error && noApiError">
      <p>API Key is not set. Please set the API key in the app.</p>
    </section>
    <section v-if="isLoading">
      <loader></loader>
    </section>
  </div>
</template>
<script>
export default {
  name: "travel-time",

  props: ["module"],

  data() {
    return {
      traffic: [],
      isLoading: true,
      error: false,
      noApiError: false,
      interval: [],
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {

        if ( ! this.module.settings.apiKey.length ) {
          this.noApiError = this.error = true;
          this.isLoading = false;
          return;
        }

        this.traffic = [];

        if ( this.module.settings.routes.length ) {
          this.setupInterval();
          this.isLoading = true;
        } else {
          this.isLoading = false;
        }
      },
    },
  },

  destroyed() {
    this.destroyInterval();
  },

  methods: {
    destroyInterval() {
      if (this.interval && this.interval.length) {
        this.interval.forEach((intervalId) => {
          clearInterval(intervalId);
        });
        this.interval = [];
      }
    },
    setupInterval() {
      this.destroyInterval();

      this.promises = [];
      let cfg = this.module.settings;

      cfg.routes.forEach((route) => {
        let url = cfg.defaultUrl;
        url += `?origin=${route.from}`;
        url += `&destination=${route.to}`;
        url += `&key=${cfg.apiKey}`;
        url += "&departure_time=now";
        url += `&name=${route.name}`;

        this.pollTrafficData(url);

        const intervalId = setInterval(() => {
          this.promises = [];
          this.pollTrafficData(url);
        }, cfg.interval || 50000);

        this.interval.push(intervalId);
      });

      this.api
        .all(this.promises)
        .then(this.handleSuccess)
        .catch(this.handleError);
    },
    handleSuccess(data) {
      this.traffic = [];
      data.forEach((_data) => {
        if (_data.data.error_message) {
          this.error = true;
          this.noApiError = true;
        } else {
          this.error = false;
          this.noApiError = false;
        }

        if (_data.data.routes.length) {
          this.traffic.push(this.formatData(_data.data));
        }
      });
      setTimeout(() => (this.isLoading = false), 1500);

      if (this.module.settings.showNotification) {
        this.traffic.forEach((item) => {
          const diff = item.duration_in_traffic.value - item.duration.value;
          if (diff && diff > 60) {
            const notification = {
              title: `Travel to ${item.end} takes <strong>${Math.round(
                (item.duration_in_traffic.value - item.duration.value) / 60
              )} mins</strong> longer than usual.`,
              meta: "",
            };
            this.emitNotification(notification);
          }
        });

        this.storeWidgetText({text: `Your commute to <strong>${this.traffic[0].name}</strong> will take <strong>${Math.round(this.traffic[0].duration.value / 60)} minutes</strong>.`});

        this.pushMinimalWidgetData({
          header: this.traffic[0].name,
          text: Math.round(this.traffic[0].duration.value / 60),
          footer: 'minutes'
        });
      }
    },
    handleError(err) {
      console.log(
        `COMPONENT ${this.$options.name}: Cannot get traffic data`,
        err
      );
      this.error = true;
      this.emitLog(`[Travel Time] - error: ${err}`);
      setTimeout(() => (this.isLoading = false), 1500);
    },
    pollTrafficData(url) {
      this.promises.push(this.api.get(`/call/?url=${btoa(url)}`));
    },
    formatData(rawData) {
      if (!rawData.routes) {
        this.error = true;
        return;
      }

      let data = {};
      data["name"] = rawData.name;
      data["start"] = rawData.routes[0].legs[0]["start_address"];
      data["end"] = rawData.routes[0].legs[0]["end_address"].split(",")[0];
      data["duration"] = rawData.routes[0].legs[0]["duration"];
      data["distance"] = rawData.routes[0].legs[0]["distance"];
      data["summary"] = rawData.routes[0].summary;
      data["duration_in_traffic"] = rawData.routes[0].legs[0]["duration_in_traffic"];

      return data;
    },
  },

  computed: {
    styles() {
      if (this.animateOut) {
        return {
          animationDelay: 0.4 * this.traffic.length + "s",
          width: this.module.settings.widget_width + "px",
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px",
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .traveltime {
    text-align: right;
  }
  .traveltime-item {
    .traveltime-item-wrapper {
      flex-direction: row-reverse;
    }

    .summary {
      margin: 0 30px 0 0;
    }

    i {
      margin: 0 0 0 $normal-spacing;
    }
  }
}

.traveltimes ul li {
  &:last-child {
    margin-bottom: 0;
  }
}

.traveltime-item {
  margin-bottom: $large-spacing;

  .traveltime-item-wrapper {
    display: flex;
    margin-bottom: 5px;
  }

  i {
    font-size: 20px;
  }

  .to {
    font-weight: 700;
  }

  .to,
  .distance {
    margin-left: $normal-spacing;
  }

  .duration {
    padding-left: $normal-spacing;
    margin-left: auto;
  }

  .summary {
    margin-left: 30px;
  }
}
</style>
