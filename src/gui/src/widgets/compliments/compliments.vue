<template>
  <transition name="fade">
    <div
      class="component compliments"
      v-if="module.settings.show"
      v-bind:class="[componentDesign]"
      v-bind:style="styles"
    >
      <header>
        <transition name="fade">
          <h1
            class="text-bright animated"
            v-bind:class="{ fadeOut: change, fadeIn: next }"
          >{{ compliment }}</h1>
        </transition>
      </header>
    </div>
  </transition>
</template>
<script>
export default {
  name: "compliments",

  props: ["module"],

  data() {
    return {
      compliment: "",
      change: false,
      next: true
    };
  },

  created() {
    this.getCompliment();
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        // setup interval again
        clearInterval(this.interval);
        this.setupInterval();
      }
    }
  },

  destroyed() {
    clearInterval(this.interval);
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px"
      }
    }
  },

  methods: {
    setupInterval() {
      this.interval = setInterval(() => {
        this.change = true;

        setTimeout(() => {
          this.change = false;
        }, 1000);
        setTimeout(() => {
          this.getCompliment();
          this.next = false;
        }, 1000);
        setTimeout(() => {
          this.next = true;
        }, 1000);
      }, this.module.settings.interval || 60000);
    },
    randomNumber: len => {
      return Math.floor(Math.random() * len);
    },
    getCompliment() {
      this.compliment = this.module.settings.texts[
        this.randomNumber(this.module.settings.texts.length)
      ];
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.compliments {
  h1 {
    opacity: 0;
    animation-duration: 1;
    width: 100%;
    font-size: $font-size * 3;
  }
}
</style>
