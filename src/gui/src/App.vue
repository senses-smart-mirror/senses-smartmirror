<template>
  <div
    id="app"
    class="wrapper"
    v-bind:class="{
      'full-page': isLoading,
      'use-wallpaper': useWallpaper,
      'use-wallpaper-blur': backgroundBlur,
      'use-light-theme': colorScheme === 'light',
      'use-background-filter': backgroundFilter,
      'use-background-border-radius': backgroundBorderRadius
    }"
    v-if="!isOff"
    v-bind:style="{
      padding: borderWidth + 'px',
      fontFamily: font,
      backgroundImage: 'url(' + wallpaperImage + ')',
    }"
  >
    <div class="wrap-inner" v-if="!isSleeping">
      <section v-show="isLoading && !isUpdating && !isSwitchingProfiles">
        <intro v-bind:done="readyForAnimation"></intro>
        <p v-if="waitingForConnection" class="connection-error">
          Waiting for connection...
        </p>
      </section>
      <transition name="fade">
        <section
          v-show="
            !isLoading &&
            !isStandby &&
            !isAnimating &&
            !isUpdating &&
            !isSwitchingProfiles &&
            !showProfileWelcomeMessage
          "
        >
          <grid :config="config" :settings="settings"></grid>
        </section>
      </transition>

      <section v-show="isStandby">
        <standby></standby>
      </section>

      <section v-if="isSwitchingProfiles">
        <switch-profiles
          :profile="profile"
          :done="readyForAnimation"
        ></switch-profiles>
      </section>

      <transition name="fade">
        <section v-if="showProfileWelcomeMessage">
          <profile-welcome-message :profile="profile"></profile-welcome-message>
        </section>
      </transition>

      <section v-show="isUpdating">
        <updating :finished="isFinishedUpdating"></updating>
      </section>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import intro from "./lib/components/intro/intro";
import grid from "./lib/components/grid/grid";
import standby from "./lib/components/standby/standby";
import updating from "./lib/components/updating/updating";
import switchProfiles from "./lib/components/switch-profiles/switch-profiles.vue";
import profileWelcomeMessage from "./lib/components/profile-welcome-message/profile-welcome-message.vue";

const FONTS = {
  ubuntu: "'Ubuntu', sans-serif",
  plus: "'M PLUS 1p', sans-serif",
  verdana: "Verdana",
  trebuchet: "'Trebuchet MS'",
  roboto: "'Roboto', sans-serif",
  open_sans: "'Open Sans', sans-serif",
  rubik: "'Rubik', sans-serif"
};

// default components
const COMPONENTS = {
  intro,
  grid,
  standby,
  updating,
  switchProfiles,
  profileWelcomeMessage,
};

export default {
  name: "app",

  components: COMPONENTS,

  data() {
    return {
      isLoading: true,
      readyForAnimation: false,
      isStandby: false,
      config: {},
      settings: {},
      isSleeping: false,
      interval: null,
      waitingForConnection: false,
      isOff: false,
      borderWidth: 20,
      font: "",
      isAnimating: false,
      checkTimerInterval: null,
      isUpdating: false,
      reload: false,
      isSwitchingProfiles: false,
      profile: null,
      showProfileWelcomeMessage: false,
      modules: null,
      useWallpaper: false,
      wallpaperImage: "",
      backgroundBlur: false,
      colorScheme: "dark",
      backgroundFilter: false,
      backgroundBorderRadius: false,
      isFinishedUpdating: false
    };
  },

  created() {
    this.$socket.emit("REQUEST_MIRROR_CONFIG");
    this.$socket.emit("REQUEST_WALLPAPER");
    this.interval = setInterval(this.doHealthChech, 5000);
  },

  methods: {
    doHealthChech() {
      console.log("[Smart Mirror]: Preforming health check.");
      this.waitingForConnection = true;
      this.$socket.emit("REQUEST_MIRROR_CONFIG");
    },
    checkTimerSettings() {
      if (this.checkTimerInterval) {
        clearInterval(this.checkTimerInterval);
      }
      let format = "hh:mm";
      this.checkTimerInterval = setInterval(() => {
        let time = moment().tz(this.settings.timezone),
          beforeTime = moment(this.settings.starttime, format),
          afterTime = moment(this.settings.endtime, format);
        this.isSleeping = time.isBetween(beforeTime, afterTime) ? false : true;
      }, 1000);
    },
    formatSettings(settings) {
      let rv = {};
      settings.forEach((s) => {
        rv[s.name] = s.value;
      });
      return rv;
    },
    getModuleSettings(moduleName, settingName) {
      if (!this.modules) return;

      const module = this.modules.filter(
        (module) => module.name === moduleName
      );

      if (module && module[0] && module[0].settings) {
        if (settingName) {
          const setting = module[0].settings.find(
            (setting) => setting.name === settingName
          );
          if (setting) {
            return setting.value;
          }
        } else {
          return module[0].settings;
        }
      }
    },
  },

  watch: {
    modules: {
      handler() {
        this.backgroundBlur = this.getModuleSettings("wallpaper", "blur");
        this.backgroundFilter = this.getModuleSettings("wallpaper","background");
        this.backgroundBorderRadius = this.getModuleSettings("wallpaper", 'border_radius');

        this.colorScheme = this.settings.theme || 'dark';
      },
    },
  },

  sockets: {
    BROADCAST_WALLPAPER(data) {
      this.useWallpaper = true;
      this.wallpaperImage = data.photoUrl || '';
    },
    BROADCAST_MIRROR_POWER(data) {
      if (data === "standby") {
        this.isStandby = true;
      } else if (data === "off") {
        this.isOff = true;
      } else {
        this.isOff = false;
        this.isStandby = false;
        this.isLoading = true;
        this.readyForAnimation = false;
        setTimeout(() => {
          this.readyForAnimation = true;
        }, 2500);
        setTimeout(() => {
          this.isLoading = false;
        }, 3000);
      }
    },
    BROADCAST_IS_SWITCHING_PROFILES(data) {
      this.isSwitchingProfiles = true;
      this.profile = data;

      setTimeout(() => {
        if (this.settings.show_welcome_message) {
          this.showProfileWelcomeMessage = true;

          setTimeout(() => {
            this.showProfileWelcomeMessage = false;
          }, this.settings.welcome_message_delay || 5000);
        }
      }, 2500);
    },
    BROADCAST_UPDATING() {
      this.isUpdating = true;
    },
    BROADCAST_MIRROR_RELOAD() {
      this.reload = true;
    },
    BROADCAST_MIRROR_RELOAD_GUI() {
      this.reload = true;
    },
    BROADCAST_MIRROR_CONFIG(data) {
      this.modules = data.modules;
      this.settings = this.formatSettings(data.settings);
      this.profile = data.profile;

      if (this.isSwitchingProfiles) {
        this.readyForAnimation = true;
        setTimeout(() => (this.isSwitchingProfiles = false), 500);
      }

      if (this.settings.updating) {
        if ( this.settings.updateFinished ) {
          this.isFinishedUpdating = true;
      }

        this.isUpdating = true;
        this.isLoading = false;
      } else {
        this.updateFinished = false;
        this.isUpdating = false;
      }

      if (this.settings.border_width) {
        this.borderWidth = this.settings.border_width;
      }

      if (this.settings.font) {
        this.font = FONTS[this.settings.font];
      }

      this.config = data.columns;
      this.waitingForConnection = false;
      clearInterval(this.interval);
      setTimeout(() => {
        this.readyForAnimation = true;
      }, 1500);
      setTimeout(() => {
        this.isLoading = false;
        this.isAnimating = false;
        this.readyForAnimation = false;
      }, 2000);
      this.checkTimerSettings();
    },
    connect() {
      console.log("[Smart Mirror]: Connected to socket!");
    },
    disconnect() {
      console.log("[Smart Mirror]: Connection closed!");
      this.readyForAnimation = false;

      if (this.interval) {
        clearInterval(this.interval);
      }

      if (this.reload) {
        this.$socket.connect();
        this.reload = false;
      } else {
        this.interval = setInterval(this.doHealthChech, 5000);
      }
    },
  },
};
</script>

<style lang="scss">
@import "styles/main";
@import "styles/light-theme";

.use-wallpaper-blur {
  &::after {
    content: "";
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(2px);
  }

  .wrap-inner {
    position: relative;
    z-index: 2;

    .fill {
      position: fixed;
    }
  }
}

.use-background-filter {
  &::after {
    content: "";
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.1);
    backdrop-filter: none;
  }

  .wrap-inner {
    position: relative;
    z-index: 2;

    .fill {
      position: fixed;
    }
  }
}

.use-background-border-radius {
  border-radius: 60px;
}

.use-wallpaper {
  background-position: left top;
  background-repeat: repeat;
  background-size: cover;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.connection-error {
  font-size: $font-size;
  text-align: center;
  margin: $jumbo-spacing 0;
  font-style: italic;
}

.wrapper {
  box-sizing: border-box;
  height: 100vh;

  .wrap-inner,
  .wrap-inner > section {
    height: 100%;
  }
}

.full-page {
  .wrap-inner {
    > section {
      height: auto;
    }
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
