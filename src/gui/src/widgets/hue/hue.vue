<template>
  <transition name="fade">
    <div
      class="component hue box-style"
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
      <section v-if="!error && !isLoading">
        <article>
          <ul v-if="rooms.length" class="hue-lights">
            <li class="room" v-bind:key="key" v-for="(room, key) in rooms">
              <i
                v-if="room.state.any_on"
                class="fad fa-lightbulb"
                v-bind:class="{ active: room.state.any_on }"
              ></i>
              <i v-else class="fad fa-lightbulb"></i>
              <span class="text-bright room-name">{{ room.name }}</span>
              <span v-show="room.state.all_on" class="bri"
                >({{ Math.round((room.action.bri / 254) * 100) }}%)</span
              >
            </li>
          </ul>
        </article>
      </section>

      <section v-if="error.length && !isLoading">
        <p class="error-msg" v-if="error === 'timeout'">
          Cannot connect to bridge. Please verify if the bridge ID in the widget
          settings is correct.
        </p>
        <p v-if="error === 'missing_ids'">
          Please use the Senses - App to configure Phillips Hue.
        </p>
        <p v-if="error === 'press_bridge'">
          Please press the button on the Philips Hue bridge.
        </p>
        <p v-if="error === 'no_connection'">
          No connection possible with HUE. Please make sure you have internet.
        </p>
        <p v-if="error === 'no_address_found'">
          Counldn't find a HUE bridge on this network.
        </p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>
<script>
export default {
  name: "hue",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      hue: {},
      rooms: [],
      lights: [],
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_HUE_DATA");
        this.isLoading = true;
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut) {
        return {
          animationDelay: 0.2 * this.rooms.length + "s",
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
    handler(data) {
      if (data.timeout) {
        this.error = "timeout";
        setTimeout(() => {
          this.isLoading = false;
        }, 1500);
        return;
      }
      if (data.error) {
        this.error = data.error;
      } else {
        this.error = false;
        this.rooms = [];
        this.lights = [];

        for (let item in data.groups) {
          this.rooms.push(data.groups[item]);
        }

        for (let item in data.lights) {
          this.lights.push(data.lights[item]);
        }

        // const count = this.rooms.reduce((a, b) => {
        //  return a + b.lights.length;
        // }, 0);

        // const roomsForMinimalOverlay = [...this.rooms].filter(item => !item.recycle);

        // if ( roomsForMinimalOverlay.length ) {
        //   roomsForMinimalOverlay.forEach(room => {
        //     this.pushMinimalWidgetData({
        //       header: room.class,
        //       text: room.count,
        //       footer: room.state.all_on ? 'Lights are on' : 'Lights are <strong>off</strong>'
        //     });
        //   });
        // }

        const hasAnyLightsOn = this.rooms.filter((item) => item.state.any_on);
        const count = this.rooms.reduce((a, b) => {
          return a + b.lights.length;
        }, 0);

        this.pushMinimalWidgetData({
          header: "Lights",
          text: count,
          footer: hasAnyLightsOn.length
            ? "Lights are on"
            : "Lights are <strong>off</strong>",
        });

        const lightsThatAreOn = this.lights.filter(item => item.state.on);
        if ( lightsThatAreOn.length ) {
          this.storeWidgetText({text: `There are <strong>${lightsThatAreOn.length} lights</strong> turned on at the moment.`});
        } else {
          this.storeWidgetText({text: `All lights are turned off.`});
        }

      }
      setTimeout(() => {
        this.isLoading = false;
      }, 1500);
    },
  },

  created() {
    this.subscribe("BROADCAST_HUE_INFO", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .hue {
    text-align: right;
  }

  .hue-lights {
    .room {
      flex-direction: row-reverse;

      i {
        margin: 0 0 0 $normal-spacing;
      }
      .bri {
        margin-right: $normal-spacing;
      }
    }
  }
}

.room {
  margin-bottom: $large-spacing;
  display: flex;
  align-items: center;

  .room-name {
    font-weight: 700;
  }

  i {
    font-size: 22px;
    margin-right: $normal-spacing;

    &.active:after {
      color: rgb(249, 255, 144);
      opacity: 1;
    }
  }

  .bri {
    margin-left: $small-spacing;
  }
}
</style>
