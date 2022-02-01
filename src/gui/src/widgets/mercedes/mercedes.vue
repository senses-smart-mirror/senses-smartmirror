<template>
  <transition name="fade">
    <div
      class="component mercedes box-style"
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
        <ul class="data-list">
          <li v-if="module.settings.showMileage">
            <i class="fad fa-tachometer-alt"></i>
            <span
              >Mileage: {{ odo.value || "no data" }} &nbsp;<span>km</span></span
            >
          </li>
          <li>
            <i class="fad fa-road"></i>
            <span>Range:
              {{ fuel.rangeliquid || "no data" }}
              <span v-show="fuel.rangeliquid">km</span></span
            >
          </li>
          <li>
            <i class="fad fa-gas-pump"></i
            ><span
              >Level: {{ fuel.tanklevelpercent || "no data"
              }}<span v-show="fuel.rangeliquid">%</span></span
            >
          </li>
        </ul>

        <span class="divider divider-small"></span>

        <ul class="data-list">
          <li
            v-if="
              lockstatus.doorlockstatusvehicle &&
              module.settings.showCarIsLocked
            "
          >
            <i
              v-show="lockstatus.doorlockstatusvehicle.value != '0'"
              class="fad fa-lock"
            ></i>
            <i
              v-show="lockstatus.doorlockstatusvehicle.value == '0'"
              class="fad fa-exclamation-circle"
            ></i>

            <section>
              <strong
                >Car
                <span v-show="lockstatus.doorlockstatusvehicle.value == '0'"
                  >is unlocked</span
                >
                <span v-show="lockstatus.doorlockstatusvehicle.value != '0'"
                  >is locked</span
                ></strong
              >
              <br />
              <small class="last-updated text-muted"
                >last updated:
                {{
                  moment(lockstatus.doorlockstatusvehicle.timestamp).fromNow()
                }}</small
              >
            </section>
          </li>
          <li v-if="module.settings.showRooftopClosed">
            <i class="fad fa-lock"></i>Rooftop
            <span v-show="lockstatus.doorlockstatusdecklid.value === 'true'"
              >is unlocked</span
            >
            <span v-show="lockstatus.doorlockstatusdecklid.value !== 'true'"
              >is locked</span
            >
          </li>
          <li v-if="module.settings.showGasIntakeClosed">
            <i class="fad fa-lock"></i>Gas Intake
            <span v-show="lockstatus.doorlockstatusgas.value === 'true'"
              >is unlocked</span
            >
            <span v-show="lockstatus.doorlockstatusgas.value !== 'true'"
              >is locked</span
            >
          </li>
          <li v-if="module.settings.showHeading">
            <i class="fad fa-compass"></i>Heading:
            {{ lockstatus.positionHeading.value }}
          </li>
        </ul>

        <ul class="data-list" v-if="openStatusData.length">
          <li v-bind:key="key" v-for="(item, key) in openStatusData">
            <i class="fad fa-exclamation-circle"></i>{{ item.label }} is open
          </li>
        </ul>

        <!-- <p v-if="!openStatusData.length"><i class="fad fa-car-side"></i>All windows are closed</p> -->
      </section>

      <section v-if="error.length && !isLoading">
        <p class="error-msg" v-if="error">Cannot get data at this time.</p>

        <p class="error-msg" v-if="error === 'missing_ids'">
          The Client ID and Client Secret are not provided ind the Smart Mirror
          App. Please go to the app and follow the instructions.
        </p>

        <p class="error-msg" v-if="error === 'missing_tokens'">
          The Access Token is not set correctly. Please use the Senses - App
          to setup the access token.
        </p>

         <p class="error-msg" v-if="error === 'refresh_failed'">
          Unable to get the access token. Please provide the correct Client ID and Client Secret in the Senses - App and authenticate again.
        </p>

        <p class="error-msg" v-if="error === 'vehicle_id_missing'">
          The Vehicle ID (VIN) is not set in the Senses - App. Please open
          the app and provide the Vehicle ID.
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

const MAPPING = {
  decklidstatus: { label: "Trunk", defaultValue: "false" },
  doorstatusfrontleft: { label: "Door front left", defaultValue: "false" },
  doorstatusfrontright: { label: "Door front right", defaultValue: "false" },
  doorstatusrearleft: { label: "Door rear left", defaultValue: "false" },
  doorstatusrearright: { label: "Door rear right", defaultValue: "false" },
  interiorLightsFront: { label: "Interior light front", defaultValue: "false" },
  interiorLightsRear: { label: "Interior light rear", defaultValue: "false" },
  lightswitchposition: { label: "Lights", defaultValue: "0" },
  readingLampFrontLeft: {
    label: "Reading light front left",
    defaultValue: "false",
  },
  readingLampFrontRight: {
    label: "Reading light front right",
    defaultValue: "false",
  },
  rooftopstatus: { label: "Rooftop", defaultValue: "0" },
  sunroofstatus: { label: "Sun roof", defaultValue: "0" },
  windowstatusfrontleft: { label: "Window front left", defaultValue: "2" },
  windowstatusfrontright: { label: "Window front right", defaultValue: "2" },
  windowstatusrearleft: { label: "Window rear left", defaultValue: "2" },
  windowstatusrearright: { label: "Window rear right", defaultValue: "2" },
};

export default {
  name: "mercedes",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      fuel: {},
      lockstatus: {},
      openStatusData: [],
      odo: false,
      mapping: MAPPING,
      moment: moment,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_MERCEDES_DATA");
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut) {
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

  methods: {
    handler(data) {
      if (data.error) {
        this.error = data.error;
        this.isLoading = false;
        return;
      }

      this.error = false;

      if (data.fuel && Array.isArray(data.fuel)) {
        data.fuel.forEach((item) => {
          if (item.rangeliquid) {
            this.fuel.rangeliquid = item.rangeliquid.value;
          }

          if (item.tanklevelpercent) {
            this.fuel.tanklevelpercent = item.tanklevelpercent.value;
          }
        });
      }

      if (data.odo) {
        this.odo = data.odo;
      }

      if (data.lockstatus && Array.isArray(data.lockstatus)) {
        data.lockstatus.forEach((item) => {
          this.lockstatus[Object.keys(item)[0]] = item[Object.keys(item)[0]];
        });
      }

      if (data.status && Array.isArray(data.status)) {
        const openStatusData = [];

        data.status.forEach((item) => {
          Object.keys(this.mapping).forEach((mapKey) => {
            const key = Object.keys(item)[0];

            if (key === mapKey) {
              const part = item[key];

              if (part.value != this.mapping[mapKey].defaultValue) {
                openStatusData.push({
                  name: mapKey,
                  label: this.mapping[mapKey].label,
                  value: part.value,
                });
              }
            }
          });
        });

        this.storeWidgetText({
          text: `Car doors are ${
            this.lockstatus.doorlockstatusvehicle != 0 ? "locked" : "unlocked"
          }`,
        });

        this.pushMinimalWidgetData({
          header: 'Mercedes',
          text: `<span>${this.lockstatus.doorlockstatusvehicle != 0 ? "Locked" : "Unlocked"}</span>`,
          footer: moment(this.lockstatus.doorlockstatusvehicle.timestamp).fromNow()
        });

        this.openStatusData = openStatusData;
      }

      this.isLoading = false;
    },
  },

  created() {
    this.subscribe("BROADCAST_MERCEDES_DATA", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  text-align: right;

  section {
    text-align: right;
  }

  ul li {
    flex-direction: row-reverse;
    i {
      margin: 0 0 0 $normal-spacing;
    }
  }
}

.divider-small {
  margin: 0 0 $large-spacing 0;
  width: 60%;
}

ul.data-list {
  margin-bottom: $large-spacing;

  li {
    display: flex;
    align-items: center;
    margin-bottom: $large-spacing;

    span {
      display: contents;
    }

    &:first-child {
      font-weight: 700;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

i {
  width: 30px;
  margin-right: $normal-spacing;
  font-size: 20px;
}
</style>
