<template>
  <transition name="fade">
    <div
      class="component stats"
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
        <article>
          <ul>
            <li>
              Server Uptime
              <span>{{ toHourMin(stats.uptime) }}</span>
            </li>
            <li>
              OS Uptime
              <span>{{ toHourMin(stats.os_uptime) }}</span>
            </li>
            <li>
              CPU Temp Main
              <span>
                {{
                stats.cpu_temp["main"] > 0 ? stats.cpu_temp["main"] : "No data"
                }}<span v-if="stats.cpu_temp.max>0">&deg;</span>
              </span>
            </li>
            <li>
              CPU Temp Max
              <span>
                {{
                stats.cpu_temp["max"] > 0 ? stats.cpu_temp["max"] : "No data"
                }}<span v-if="stats.cpu_temp.max>0">&deg;</span>
              </span>
            </li>
            <li>
              Memory Total
              <span>{{ bytesToSize(stats.memory["total"]) }}</span>
            </li>
            <li>
              Memory Free
              <span>{{ bytesToSize(stats.memory["free"]) }}</span>
            </li>
            <li>
              Disks Size
              <span>{{ bytesToSize(stats.disks["size"]) }}</span>
            </li>
            <li></li>
            <li>
              Platform
              <span>{{ stats.os["platform"] }}</span>
            </li>
            <li>
              Distro
              <span>{{ stats.os["distro"] }}</span>
            </li>
            <li>
              release
              <span>{{ stats.os["release"] }}</span>
            </li>
            <li>
              hostname
              <span>{{ stats.os["hostname"] }}</span>
            </li>
            <li></li>
            <li>
              Internet Connection
              <span>{{ stats.internet.ssid }}</span>
            </li>
            <li>
              IP Address
              <span>{{ stats.ip_address }}</span>
            </li>
          </ul>
        </article>
      </section>
      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
export default {
  name: "stats",

  props: ["module"],

  data() {
    return {
      stats: {},
      isLoading: true
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_SERVER_STATS");
      }
    }
  },

  created() {
    this.subscribe("BROADCAST_SERVER_STATS", this.handler);
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px"
      };
    }
  },

  methods: {
    toHourMin(seconds) {
      var sec_num = parseInt(seconds, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - hours * 3600) / 60);
      var _seconds = sec_num - hours * 3600 - minutes * 60;

      if (hours < 10) {
        hours = "0" + hours;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (_seconds < 10) {
        _seconds = "0" + _seconds;
      }
      return hours + ":" + minutes + ":" + _seconds;
    },
    bytesToSize(bytes) {
      var sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
      for (var i = 0; i < sizes.length; i++) {
        if (bytes <= 1024) {
          return bytes + " " + sizes[i];
        } else {
          bytes = parseFloat(bytes / 1024).toFixed(2);
        }
      }
      return bytes + " P";
    },
    handler(data) {
      this.stats = data;

      this.pushMinimalWidgetData({
        header: "Stats",
        text: `${this.stats.cpu_temp.main}<span class="text-small text-pull-up">&#8451;</span>`,
        footer: 'CPU temp.'
      });

      if (this.module.settings.showNotification) {
        if (this.stats.cpu_temp.main > 60) {
          const notification = {
            title:
              `Stats: CPU temp reached <strong>${this.stats.cpu_temp.main}</strong>&#8451;`,
            meta: ''
          };
          this.emitNotification(notification);
        }
      }
      this.isLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last {
  .stats {
    display: flex;

    ul li {
      flex-direction: row-reverse;
      justify-content: space-between;
      span {
        margin: 0;
      }
    }
  }
}

.use-light-theme {
  $text-muted: rgba(255,255,255,.7) !global;
}

.stats {
  width: 300px;
  ul li {
    display: flex;
    min-height: $large-spacing + 2;
    font-weight: 700;

    span {
      color: $text-muted;
      margin-left: auto;
    }
  }
}
</style>
