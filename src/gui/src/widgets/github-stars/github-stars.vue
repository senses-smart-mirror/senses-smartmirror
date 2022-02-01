<template>
  <transition name="fade">
    <div
      class="component github-stars github box-style"
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
        <ul class="list">
          <li v-bind:key="key" v-for="(item, key) in githubStars">
            <section v-if="item.data">
              {{ item.username }}/{{ item.repository }}
              <span
                ><i class="far fa-star"></i
                >{{ item.data.stargazers_count }}</span
              >
              <span
                ><i class="fad fa-code-branch"></i>{{ item.data.forks }}</span
              >
            </section>
            <section v-if="!item.data">
              {{ item.username }}/{{ item.repository }} <span>not found</span>
            </section>
          </li>
        </ul>
      </section>

      <section v-if="error.length && !isLoading">
        <p class="error-msg" v-if="error">Cannot get data at this time.</p>

        <p v-if="error === 'rate_limit'">
          <em>Api rate limit has been reached.</em>
        </p>

         <p v-if="error === 'no_repos'">
          There are no repositories provided in the Senses - App.
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
  name: "github-stars",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      githubStars: [],
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_GITHUB_STARS_DATA");
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

      if ( data.error ) {
        this.error = data.error;
      } else {
        this.error = false;
        this.githubStars = data.sort((a, b) => b.data.stargazers_count - a.data.stargazers_count)
       }

      this.isLoading = false;
    },
  },

  created() {
    this.subscribe("BROADCAST_GITHUB_STARS_DATA", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {}
.list {
  margin-bottom: $large-spacing;

  li {
    margin-bottom: $large-spacing;

    section {
      text-transform: capitalize;
      display: flex;
      align-items: center;
      justify-content: space-between;

      span:first-child {
        margin: 0 40px 0 auto;
      }

      span {
        display: inline-block;
      }
    }

    &:first-child {
      font-weight: 700;
    }

    i {
      margin: 0 $small-spacing 0 0;
      font-size: 20px;
    }
  }
}
</style>
