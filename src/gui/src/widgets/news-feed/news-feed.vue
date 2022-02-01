<template>
  <transition name="fade">
    <div
      class="component news-feed"
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

      <section v-if="error && !isLoading">
        <p v-if="error" class="error-msg">Not able to load news items.</p>
        <p v-if="error === 'no_url'" class="error-msg">
          No RSS url set in the app.
        </p>
      </section>

      <section v-if="!error && !isLoading">
        <article v-if="module.settings.onlyOne">
          <section class="single-item">
            <h6 class="feed-text text-bright">
              <i class="fad fa-newspaper"></i>
              {{ feeds.items[0].title }}
            </h6>
            <p v-html="feeds.items[0].content" ></p>
            <span class="feed-pubdate text-small"
              >({{ formatPubDate(feeds.items[0].pubDate) }})</span
            >
          </section>
        </article>
        <article v-else class="multiple-items">
          <ul>
            <li v-bind:key="item.guid" v-for="item in feeds.items">
              <section class="news-feed-item">
                <i class="fad fa-newspaper"></i>
                <p class="feed-text text-bright">{{ item.title }}</p>
              </section>
              <span class="feed-pubdate text-muted"
                >({{ formatPubDate(item.pubDate) }})</span>
            </li>
          </ul>
          <span
            v-show="module.settings.showTitle"
            class="feed-title text-muted"
          >
            {{title}}
          </span>
          <br />
          <span
            v-show="module.settings.showLastUpdate"
            class="last-update text-muted"
          >
            <small>(Last updated: {{ this.updated }})</small>
          </span>
        </article>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import moment from "moment";

export default {
  name: "news-feed",

  props: ["module"],

  data() {
    return {
      feeds: {},
      isLoading: true,
      moment: moment,
      title: '',
      error: false,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_RSS_FEED");
        this.isLoading = true;
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.feeds) {
        return {
          animationDelay:
            0.25 * (this.feeds.items ? this.feeds.items.length : 1) + "s",
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
    formatPubDate(time) {
      return moment(time).fromNow();
    },
    handler(data) {
      console.log(data)
      this.error = data.error ? data.error : false;

      if (this.error) {
        this.isLoading = false;
        return;
      }

      this.title = data.title;

      this.updated = moment()
        .format("HH:mm:ss");
      this.feeds = data;

      // sort news feed based on publication date
      this.feeds.items = data.items.sort((a, b) => {
        moment(a.pubDate).valueOf() > moment(b.pubDate).valueOf();
      });

      setTimeout(() => {
        this.isLoading = false;
      }, 1500);
    },
  },

  created() {
    this.subscribe("BROADCAST_RSS_FEED", this.handler);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .multiple-items {
    text-align: right;
  }

  .news-feed-item {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    text-align: right;
    margin-bottom: $normal-spacing;

    i {
      margin: 0 0 0 $normal-spacing;
    }
  }

  ul li span.feed-pubdate,
  .feed-pubdate {
    display: inline-block;
    text-align: right;
  }

  .single-item {
    h6 {
      text-align: center;
      display: flex;
      flex-direction: row-reverse;

      i {
        margin-left: $normal-spacing;
      }
    }

    p {
      text-align: right;
    }
  }
}

.last-update, .feed-pubdate {
  margin-bottom: $large-spacing;
  display: inline-block;
}

.single-item,
.multiple-items {
  section {
    display: flex;
    margin-bottom: $small-spacing;
  }

  i {
    margin: 2px $normal-spacing 0 0;
    font-size: 20px;
  }
}

.single-item {
  h6 {
    margin-bottom: $normal-spacing;
  }
}

.multiple-items {
  ul li:first-child .feed-text {
    font-weight: 700;
  }
  ul li {
    font-size: $font-size;
    margin-bottom: $large-spacing;

    p {
      line-height: 24px;
      margin-bottom: 0;
    }

    .feed-text {
      width: 100%;
    }

    .feed-pubdate {
      margin: $small-spacing 0 $small-spacing 32px;
    }
  }
}
</style>
