<template>
  <transition name="fade">
    <div
      class="component video-player"
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

      <section v-if="!isLoading" v-show="url">
        <div
          class="video-wrapper"
          v-show="showPlayer"
          v-bind:style="{
            width: videoSize.width + 'px',
            height: videoSize.height + 'px',
          }"
        >
          <section v-show="isPlaying">
            <video
              allow="autoplay"
              ref="videoPlayer"
              id="vid1"
              muted
              class="video-js vjs-default-skin"
              :width="videoSize.width + 'px'"
              :height="videoSize.height + 'px'"
              preload="auto"
              :data-setup="options"
            >
              <source src="" type="video/mp4" />
            </video>
          </section>

          <section class="video-overlay" v-show="!isPlaying">
            <i class="fad fa-play" v-show="!isPaused"></i>
            <i class="fad fa-pause" v-show="isPaused"></i>
          </section>
        </div>
        <footer
          v-if="videoDuration > 0 && isPlaying && module.settings.show_timing"
          v-show="showPlayer"
        >
          <div class="progress-bar">
            <span class="total"></span>
            <span
              class="progress"
              :style="{ width: progressWidth + '%' }"
            ></span>
          </div>
          <div class="progress-info">
            <span class="text-muted">
              {{ millisToMinutesAndSeconds(currentTime) }}
            </span>
            <span class="duration text-muted">
              {{ millisToMinutesAndSeconds(videoDuration) }}
            </span>
          </div>
        </footer>
      </section>

      <section v-if="!url">
        <p class="error-msg">
          No video url specified. Please specify a video in the Senses - App.
        </p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import videojs from "video.js";

import "videojs-youtube/dist/Youtube.min.js";
import "@devmobiliza/videojs-vimeo/dist/videojs-vimeo.esm";

const VIDEO_SIZE = {
  small: { width: 490, height: 280 },
  large: { width: 600, height: 340 },
};

export default {
  name: "video-player",

  props: ["module"],

  data() {
    return {
      showPlayer: true,
      isLoading: true,
      player: null,
      isPlaying: false,
      isPaused: false,
      videoDuration: null,
      url: null,
      options: ``,
      videoSize: VIDEO_SIZE.small,
      volume: 1
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.setVideoSize();
        this.url = this.getVideoUrl();

        if (!this.url) {
          this.isLoading = false;
          return;
        }

        if (this.isYoutubeVideo(this.url)) {
          this.options = `{ "controls": false, "preload": "auto", "techOrder": ["youtube", "vimeo", "html5"], "sources": [{ "type": "video/youtube", "src": "${this.url}"}]}`;
        } else if (this.isVimeoVideo(this.url)) {
          this.options = `{ "controls": false, "preload": "auto", "techOrder": ["youtube", "vimeo", "html5"], "sources": [{ "type": "video/vimeo", "src": "${this.url}"}]}`;
        } else {
          this.options = `{ "controls": false, "preload": "auto", "techOrder": ["youtube", "vimeo", "html5"], "sources": [{ "type": "video/mp4", "src": "${this.url}"}]}`;
        }

        this.isLoading = false;
      },
    },
  },

  mounted() {
    if (this.url) {
      this.setupPlayer();
    }
  },

  computed: {
    currentTime() {
      return this.player ? this.player.currentTime() : 0;
    },
    progressWidth() {
      return 100 / (this.videoDuration / this.player.currentTime());
    },
    styles() {
      return {

      };
    },
  },

  methods: {
    setupPlayer() {
      this.player = videojs(this.$refs.videoPlayer);

      this.player.on("ready", () => {
        this.player.on("loadedmetadata", () => {
          this.videoDuration = this.player.duration() || 0;
        });
      });
    },
    setVideoSize() {
      this.videoSize = VIDEO_SIZE[this.module.settings.video_format];
      this.styles.width = this.videoSize.width + 40 + "px";

      if (this.player) {
        this.player.width(this.videoSize.width);
        this.player.height(this.videoSize.height);
      }
    },
    isYoutubeVideo(url) {
      return url.indexOf("youtube") >= 0 ? true : false;
    },
    isVimeoVideo(url) {
      return url.indexOf("vimeo") >= 0 ? true : false;
    },
    playHandler() {
      this.showPlayer = true;
      this.player.play();

      setTimeout(() => {
        this.isPlaying = true;
        this.isPaused = false;
      }, 500);
    },
    pauseHandler() {
      this.isPlaying = false;
      this.isPaused = true;
      this.player.pause();
    },
    stopHandler() {
      this.player.currentTime(0);
      this.player.pause();
      this.showPlayer = false;
    },
    forwardHandler() {
      this.player.currentTime(this.player.currentTime() + 10);
    },
    reverseHandler() {
      this.player.currentTime(this.player.currentTime() - 10);
    },
    timestampHandler(value) {
      if (value.value.indexOf(":") >= 0) {
        value.value = this.hmsToSecondsOnly(value.value);
      }
      this.player.currentTime(parseInt(value.value));
    },
    mutePlayerHandler() {
      this.player.muted(true);
    },
    volumeDownHandler() {
      this.player.muted(false);
      this.volume = (this.volume - 0.1) <= 0 ? 0 : this.volume - 0.1;
      this.player.volume(this.volume);
    },
    volumeUpHandler() {
      this.player.muted(false);
      this.volume = (this.volume + 0.1) >= 1 ? 1 : this.volume + 0.1;
      this.player.volume(this.volume);
    },
    updateVideoUrlHandler(newUrl) {
      if (!this.player) {
        this.options = `{ "controls": false, "preload": "auto", "techOrder": ["youtube", "vimeo", "html5"]}`;
        this.setupPlayer();
      }

      const url = newUrl.value;

      if (!url.length > 0) return;

      this.url = url;

      if (this.player) {
        this.pauseHandler();
      }

      if (this.isYoutubeVideo(url)) {
        this.player.src({ src: url, type: "video/youtube" });
      } else if (this.isVimeoVideo(url)) {
        this.player.src({ src: url, type: "video/vimeo" });
      } else {
        this.player.src({ type: "video/mp4", src: url });
      }

      this.playHandler();
    },
    getVideoUrl() {
      return this.module.settings.video_url;
    },
    millisToMinutesAndSeconds(duration) {
      let h, m, s;
      h = Math.floor(duration / 60 / 60);
      m = Math.floor((duration / 60 / 60 - h) * 60);
      s = Math.floor(((duration / 60 / 60 - h) * 60 - m) * 60);

      s < 10 ? (s = `0${s}`) : (s = `${s}`);
      m < 10 ? (m = `0${m}`) : (m = `${m}`);
      h < 10 ? (h = `0${h}`) : (h = `${h}`);

      return `${h}:${m}:${s}`;
    },
    hmsToSecondsOnly(str) {
      let p = str.split(":"),
        s = 0,
        m = 1;

      while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
      }

      return s;
    },
  },

  created() {
    this.subscribe("BROADCAST_VIDEO_PLAYER_PLAY", this.playHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_PAUSE", this.pauseHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_STOP", this.stopHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_FORWARD", this.forwardHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_REVERSE", this.reverseHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_TIMESTAMP", this.timestampHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_MUTE", this.mutePlayerHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_VOLUME_DOWN", this.volumeDownHandler);
    this.subscribe("BROADCAST_VIDEO_PLAYER_VOLUME_UP", this.volumeUpHandler);
    this.subscribe(
      "BROADCAST_VIDEO_PLAYER_UPDATE_VIDEO",
      this.updateVideoUrlHandler
    );
  },

  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  },
};
</script>

<style lang="scss">
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  p {
    text-align: right;
  }
}

.use-light-theme {
  .video-player {
    .video-wrapper {
      box-shadow: 0 0 3px 2px rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .progress-bar span.total {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

// videojs support CSS
.vjs-hidden,
.vjs-control-bar,
.vjs-loader-spinner,
.vjs-big-play-button,
.vjs-modal-dialog,
.vjs-loading-spinner {
  display: none;
}

.component.video-player {
  width: 100%;
}

.video-player {
  display: flex;
  align-items: center;

  .video-wrapper {
    border: 2px solid #222;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 0 3px 2px #0e0e0e;

    > section,
    iframe {
      border-radius: 50px;
      overflow: hidden;
    }

    div.video-js {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: flex-start;
      top: -1px;
    }

    .video-overlay {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      > i {
        font-size: 44px;
      }
    }
  }

  .progress-bar {
    margin: $large-spacing 0 $normal-spacing;
    width: 100%;
    height: 4px;
    position: relative;

    span {
      position: absolute;
      top: 50%;
      display: inline-block;
      height: 2px;
      left: 0;
    }

    span.total {
      z-index: 1;
      width: 100%;
      background-color: $text-muted;
    }

    span.progress {
      top: 49%;
      z-index: 2;
      width: 0;
      background-color: #fff;
      box-shadow: 1px 1px 2px #fff;
    }
  }

  .progress-info {
    font-size: $font-size * 0.9;
    display: flex;

    .duration {
      margin-left: auto;
    }
  }

  footer {
    max-width: 80%;
    margin: $large-spacing 0 0 10%;
  }
}
</style>
