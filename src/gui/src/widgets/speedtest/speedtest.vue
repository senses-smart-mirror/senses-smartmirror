<template>
  <transition name="fade">
    <div
      class="component speedtest"
      v-if="module.settings.show"
      v-bind:style="styles"
      v-bind:class="[componentDesign]"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

      <section v-if="!isLoading">
        <ul class="result-list" v-if="speedData">
          <li>
            <p>
              <i class="fad fa-download"></i>
              <span class="text-bright"
                ><strong>{{ speedData.download }}</strong> Mbps</span
              >
            </p>
          </li>
          <li>
            <p>
              <i class="fad fa-upload"></i>
              <span class="text-bright"
                ><strong>{{ speedData.upload }}</strong> Mbps</span
              >
            </p>
          </li>
          <li>
            <p>
              <i class="fad fa-tachometer-alt"></i>
              <span class="text-bright"
                ><strong>{{ speedData.ping }}</strong> ms</span
              >
            </p>
          </li>
        </ul>

        <footer v-if="module.settings.showLocation && speedData">
          <p>{{ speedData.server.name }} - {{ speedData.server.location }}</p>
        </footer>

        <section v-if="!speedData && !isLoading">
          <p class="error-msg">Unable to show Internet speed at this time. Awaiting new test results.</p>
        </section>
      </section>

      <section v-if="isLoading">
        <em>Performing test...</em>
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "speedtest",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      speedData: {},
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_INTERNET_SPEED_DATA");
      },
    },
  },

  created() {
    this.subscribe("BROADCAST_INTERNET_SPEED_DATA", this.handler);
    this.subscribe("BROADCAST_INTERNET_SPEED_DATA_ISLOADING", () => this.isLoading = true);
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },

  methods: {
    handler(data) {
      this.speedData = data;
      this.isLoading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last {
  .result-list {
    li {
      flex-direction: row-reverse;
      p {
        display: flex;
        flex-direction: row-reverse;

        i {
          margin-left: $normal-spacing;
        }
      }
    }
  }

  footer {
    text-align: right;
  }
}

.result-list {
  li {
    display: flex;
    align-items: center;
    margin-bottom: $normal-spacing;
  }

  p {
    margin: 0;
  }

  i {
    margin-top: 2px;
    margin-right: $normal-spacing;
    font-size: 20px;
  }
}
</style>
