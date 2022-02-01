import { gsap } from 'gsap';

export default {
  props: ["nextAnimation", "animationStarted"],

  data() {
    return {
      animateOut: false,
      sm_animation_timeout: null,
      sm_animation_timeout2: null,
    };
  },

  beforeDestroy() {
    clearTimeout(this.sm_animation_timeout);
    clearTimeout(this.sm_animation_timeout2);
  },

  methods: {
    triggerAnimateOut() {
      this.animateOut = true;
      this.sm_animation_timeout = setTimeout(() => {
        this.nextAnimation();
        this.animateOut = false;
        if (this.animationOutCallback) {
          this.animationOutCallback();
        }
      }, 2000);
    },
    fadeInListItems() {
      if (this.$refs.list) {
        const items = this.$refs.list.querySelectorAll("li");
        for (let i = 0; i < items.length; i++) {
          gsap.to(items[i], {
            opacity: 1,
            delay: 0.4 * i,
            x: 0,
            duration: 0.3,
          });
        }
      }
    },
  },

  watch: {
    animationStarted: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.sm_animation_timeout2 = setTimeout(
            this.triggerAnimateOut,
            10000
          );
        }
      },
    },
  },
};
