<template>
  <transition name="fade">
    <div
      class="component spotify box-style"
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
      <section v-if="!error && !isLoading" class="spotify-playlist">
        <article v-if="spotify && spotify.is_playing">
          <header>
            <img
              v-if="module.settings.show_image && spotify.item.album.images[0]"
              v-bind:src="spotify.item.album.images[0].url"
              alt="Spotify"
              width="100px"
            />
            <div class="playlist-item">
              <p class="text-bright">{{ spotify.item.name }}</p>
              <p>{{ getArtists(spotify.item.artists) }}</p>
              <p v-if="module.settings.show_album" class="small-font m0">
                {{ spotify.item.album.name }}
              </p>
            </div>
          </header>
          <footer>
            <div class="progress-bar">
              <span class="total"></span>
              <span
                class="progress"
                :style="{ width: progressWidth + '%' }"
              ></span>
            </div>
            <div class="progress-info">
              <span class="text-muted">
                {{ millisToMinutesAndSeconds(spotify.progress_ms) }}
              </span>
              <span class="duration text-muted">
                {{ millisToMinutesAndSeconds(spotify.item.duration_ms) }}
              </span>
            </div>
            <div class="device text-small" v-if="device">
              <span v-if="module.settings.show_play_device"
                >Playing on {{ device.name }}</span
              >
            </div>
          </footer>
        </article>
        <article class="not-playing-message" v-else>
          <p>You are not playing anything at this time.</p>
        </article>
      </section>

      <section v-if="error.length">
        <p v-if="error === 'missing_ids'">
          Cannot display Spotify playlist at this time.
        </p>
        <p v-if="error === 'missing_tokens'">
          The Access Token is not set correctly. Please use the Senses - App
          to setup the access token.
        </p>
        <p v-if="error === 'not_playing'">
          Not playing anything at this moment.
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
  name: "spotify",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      spotify: {},
      device: {},
      animateOut: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_SPOTIFY_DATA");
        this.isLoading = true;
      },
    },
  },

  computed: {
    progressWidth: function () {
      return 100 / (this.spotify.item.duration_ms / this.spotify.progress_ms);
    },
    styles() {
      if (this.animateOut) {
        return {
          width: this.module.settings.widget_width + "px",
          animationDelay: 0.5 + "s",
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px",
        };
      }
    },
  },

  created() {
    this.subscribe("BROADCAST_SPOTIFY_INFO", this.handler);
  },

  methods: {
    getArtists(artists) {
      return artists.map((e) => e.name).join(", ");
    },
    millisToMinutesAndSeconds(millis) {
      let minutes = Math.floor(millis / 60000);
      let seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    },
    handler(data) {
      if (data.error) {
        this.error = data.error;
      } else {
        if (!data.player) {
          this.error = 'not_playing';
          this.isLoading = false;
          return;
        }

        this.error = false;
        this.spotify = data.player;
        this.device = data.devices.filter((device) => device.is_active)[0];

        if ( this.spotify && this.spotify.is_playing ) {
          this.storeWidgetText({text: `Currently playing <strong>${this.spotify.item.name}</strong> from ${this.getArtists(this.spotify.item.artists)} on <strong>${this.device.name}</strong>.`});
        } else {
          this.storeWidgetText({text: `Currently not playing anything on <strong>Spotify</strong>.`});
        }

        this.pushMinimalWidgetData({
          header: "Spotify",
          text: "",
          footer: this.spotify.is_playing ? "Playing" : "Not playing",
        });
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1500);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.use-light-theme {
  footer .progress-bar span.total {
    background-color: rgba(255,255,255,.2);
  }
}

.last .component {
  .not-playing-message {
    text-align: right;
  }

  .spotify-playlist {
    header {
      flex-direction: row-reverse;
      text-align: right;

      img {
        margin-left: 10px;
      }
    }
  }
}

/* animations */
.component.animate {
  display: block;
  animation-duration: 0.5s;
  @include animationFadeInLeft();

  .progress-bar,
  .progress-info,
  .playlist-item {
    animation-delay: 0.5s;
    @include animateListItems();
  }

  .playlist-item {
    animation-delay: 0.25s;
  }
}

.last .component.animate {
  @include animationFadeInRight();

  .progress-bar,
  .progress-info,
  .playlist-item {
    @include animationFadeInRight();
  }
}

.last .component.animate-out {
  @include animationFadeOutRight();

  .progress-bar,
  .progress-info,
  .playlist-item {
    @include animationFadeOutRight();
  }
}

.component.animate-out {
  @include animationFadeOutLeft();
}

.spotify-playlist {
  header {
    display: flex;

    img {
      max-width: 90px;
      max-height: 90px;
      padding-right: $normal-spacing;
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
    }

    span.total {
      z-index: 1;
      width: 100%;
      background-color: $text-muted;
    }

    span.progress {
      top: 49%;
      z-index: 2;
      width: 50%;
      background-color: #fff;
      box-shadow: 1px 1px 2px #fff;
    }
  }

  .playlist-item {
    p {
      margin-bottom: 5px;
    }
  }

  .progress-bar-title {
    text-transform: uppercase;
    font-weight: 200;
  }

  .progress-info {
    font-size: $font-size * 0.9;
    display: flex;

    .duration {
      margin-left: auto;
    }
  }

  .device {
    padding: $normal-spacing 0;
    text-align: right;
    font-style: italic;
  }
}
</style>
