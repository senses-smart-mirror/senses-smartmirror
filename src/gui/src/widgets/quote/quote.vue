<template>
  <div
    class="quotes component"
    v-if="module.settings.show"
    v-bind:style="styles"
    v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
  >
    <header v-if="!module.settings.single" class="title-header">
      <h4 v-show="module.settings.header">
        <i
          v-show="showHeaderIcon"
          class="header-icon"
          v-bind:class="module.icon"
        ></i>
        {{ module.settings.header }}
      </h4>
    </header>

    <section v-if="module.settings.single" class="quote">
      <transition name="fade">
        <article
          class="animated"
          v-bind:class="{ fadeOut: change, fadeIn: next }"
        >
          <h1 class="text-bright">{{ quote.quote }}</h1>
          <span class="author">&mdash; {{ quote.author }}</span>
        </article>
      </transition>
    </section>

    <section class="quote" v-else>
      <transition name="fade">
        <article
          class="animated"
          v-bind:class="{ fadeOut: change, fadeIn: next }"
        >
          <section>
            <i class="fad fa-quote-right"></i>
            <p class="text-bright">
              <strong>{{ quote.quote }}</strong>
            </p>
          </section>
          <span class="author">&mdash; {{ quote.author }}</span>
        </article>
      </transition>
    </section>
  </div>
</template>
<script>
import quotes from "./quotes.json";

export default {
  name: "quote",

  props: ["module"],

  data() {
    return {
      quotes: quotes.quotes,
      change: false,
      next: true,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        clearInterval(this.interval);
        this.setupInterval();
      },
    },
  },

  created() {
    this.getQuote();
  },

  destroyed() {
    clearInterval(this.interval);
  },

  methods: {
    setupInterval() {
      this.interval = setInterval(() => {
        this.change = true;

        setTimeout(() => {
          this.change = false;
        }, 1000);
        setTimeout(() => {
          this.getQuote();
          this.next = false;
        }, 1000);
        setTimeout(() => {
          this.next = true;
        }, 1000);
      }, this.module.settings.interval || 10000);
    },
    randomNumber: (len) => {
      return Math.floor(Math.random() * len);
    },
    getQuote() {
      this.quote = this.quotes[this.randomNumber(this.quotes.length)];
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.quotes) {
        return {
          animationDelay: 0.25 + "s",
          width: this.module.settings.widget_width + "px",
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px",
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .quote {
    text-align: right;
  }
}

.quotes {
  h1 {
    width: 100%;
    font-size: $font-size * 3;
  }

  .quote article {
    @include animateListItems();

    animation-duration: 1;
    opacity: 0;

    span {
      @include animateListItems();
      animation-delay: 0.2s;
    }

    section {
      display: flex;
    }

    i {
      font-size: 20px;
      margin-right: $normal-spacing;
    }
  }

  .author {
    display: inline-block;
    width: 100%;
    text-align: right;
  }
}
</style>
