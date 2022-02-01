<template>
  <div
    class="component speech"
    v-bind:class="[componentDesign]"
    v-bind:style="styles"
  >
    <header>
      <h4 v-show="module.settings.header && ! module.settings.showInBottom">
        <i
          v-show="showHeaderIcon"
          class="header-icon"
          v-bind:class="module.icon"
        ></i>
        {{ module.settings.header }}
      </h4>
    </header>

    <section v-if="!module.settings.showInBottom">
      <ul class="list commands">
        <li
          class="list-item command"
          v-for="(command, key) in commands"
          :key="key"
        >
          <strong class="text-bright">"{{ command.name }}"</strong>
          <small>{{ command.description }}</small>
        </li>
      </ul>
    </section>

    <section
      class="bottom-design"
      v-if="module.settings.showInBottom"
      :class="{ 'show-full': whatCanISay }"
    >
      <div class="inner">
        <header>
          <div class="icon-container" :class="{ 'is-active': speechIsActive }">
            <i
              class="fad"
              :class="{
                'fa-microphone-alt': !speechIsDisabled,
                'fa-microphone-alt-slash': speechIsDisabled,
              }"
            ></i>
          </div>
          <p class="text-bright" v-if="noFunctionFound">No function found.</p>
          <transition name="fade">
            <p class="text-bright" v-show="response">{{ response }}</p>
          </transition>
        </header>

        <section class="content">
          <ul class="list commands">
            <li
              class="list-item command"
              v-for="(command, key) in commands"
              :key="key"
            >
              <strong class="text-bright">"{{ command.name }}"</strong>
              <small>{{ command.description }}</small>
            </li>
          </ul>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
const COMMANDS = require("./commands");

export default {
  name: "speech",

  props: ["module"],

  data() {
    return {
      commands: COMMANDS,
      speechIsActive: false,
      whatCanISay: false,
      speechIsDisabled: false,
      response: "",
      noReactionFromSpeech: true,
      noFunctionFound: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.simpleEmit("REQUEST_SPEECH_STATUS");

        setTimeout(() => {
          if (this.noReactionFromSpeech) {
            this.speechIsDisabled = true;
          }
        }, 5000);
      },
    },
  },

  sockets: {
    BROADCAST_SPEECH_STATUS(data) {
      this.noReactionFromSpeech = false;
      if (data.active) {
        this.speechIsDisabled = false;
      }
    },
    BROADCAST_SPEECH_NOFUNCTION() {
      // Disabled for now since no real use case for this.
      // this.noFunctionFound = true;
      // setTimeout(() => this.noFunctionFound = false, 2000);
    },
    BROADCAST_LISTENING_OFF() {
      this.speechIsActive = false;
    },
    BROADCAST_LISTENING_ON() {
      this.speechIsActive = true;
    },
    BROADCAST_LISTENING_WCIS(mode) {
      this.whatCanISay = mode.data === "hide" ? false : true;
    },
    BROADCAST_LISTENING_DISABLED() {
      this.speechIsDisabled = true;
      this.speechIsActive = false;
      this.whatCanISay = false;
    },
    BROADCAST_LISTENING_ENABLED() {
      this.speechIsDisabled = false;
    },
    BROADCAST_LISTENING_RESULT(data) {
      if (data.reset) {
        this.response = data.text;
        setTimeout(() => {
          this.response = "";
        }, 1000);
        return;
      }

      if (data && data.text) {
        if (data.text.length >= this.response.length) {
          this.response = data.text;
        }
      }
    },
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.overlay {
  .speech {
    position: absolute;
    bottom: 20px;
  }
}

.fad {
  font-size: 22px;
  display: inline-block;
  line-height: 22px;
}

.list-item {
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.icon-container {
  transition: all 0.2s ease-in-out;
  width: 30px;
  height: 30px;
  transform: scale(1);
  text-align: center;
  margin-bottom: 10px;

  &.is-active {
    transform: scale(2);
    .fad {
      color: $text-bright;
    }
  }
}

.command strong {
  margin-bottom: $small-spacing;
}

.bottom-design {
  transform: translateY(370px);
  transition: all 0.3s ease-in-out;
  position: absolute;
  bottom: 40px;
  width: 100%;
  min-height: 100px;
  overflow: hidden;
  padding-bottom: 20px;

  &.show-full {
    transform: translateY(30px);
  }

  .inner {
    display: flex;
    flex-direction: column;
  }

  .content {
    display: inline-block;
  }

  header {
    padding-top: 20px;
    display: inline-block;
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}
</style>
