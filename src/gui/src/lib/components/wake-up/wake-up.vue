<template>
  <section class="wake-up" v-bind:class="{ 'start-animation': activate }">
    <section class="inner">
      <h1 class="title text-bright animate">Smart <strong>Mirror</strong></h1>

      <p class="hello-text animate">Hello, {{ getGreeting() }}.</p>

      <div class="divider animate"></div>

      <section class="circles">
        <div
          class="circle animate"
          :class="{ fill: key !== 0 && key % 2 === 10 }"
          v-bind:key="key"
          v-for="(widget, key) in widgets"
        >
          <header><strong>{{ widget.header }}</strong></header>

          <article>
            <i :class="widget.icon"></i>
            <p v-html="widget.text"></p>
          </article>

          <footer v-html="widget.footer"></footer>
        </div>
      </section>
    </section>
  </section>
</template>

<script>
import moment from "moment";

const SPLIT_AFTERNOON = 12;
const SPLIT_EVENING = 17;
const SPLIT_NIGHT = 0;
const SPLIT_MORNING = 7;

export default {
  name: "wake-up",

  props: ["settings"],

  data() {
    return {
      activate: false,
      now: {},
      widgetData: [],
      widgets: [],
    };
  },

  watch: {
    settings: {
      immediate: true,
      handler(newValue) {
        if (!newValue) return;
        this.getWidgets();
      },
    },
  },

  created() {
    this.now = moment();
    setTimeout(() => {
      this.activate = true;
    }, 1000);
  },

  mounted() {
    this.$options.interval = setInterval(this.updateDateTime, 1000);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    getWidgets() {
      this.widgets = [];
      this.widgetData.forEach((widget) => {
        if (this.settings.show_minimal_widgets.indexOf(widget.name) >= 0) {
          this.widgets.push(widget);
        }
      });
    },
    updateDateTime() {
      this.now = moment();
    },
    getGreeting() {
      const now = moment();
      const currentHour = now.format("HH");
      let text = "good  ";

      if (currentHour >= SPLIT_AFTERNOON && currentHour <= SPLIT_EVENING) {
        text += "afternoon";
      } else if (currentHour >= SPLIT_EVENING) {
        text += "evening";
      } else if (currentHour >= SPLIT_NIGHT && currentHour < SPLIT_MORNING) {
        text += "night";
      } else {
        text += "morning";
      }

      return text;
    },
  },

  sockets: {
    PUSH_DATA(data) {
      const foundIndex = this.widgetData.findIndex(
        (widget) => widget.name === data.name
      );

      if (foundIndex >= 0) {
        this.widgetData[foundIndex] = data;
      } else {
        this.widgetData.push(data);
      }

      this.getWidgets();
    },
  },
};
</script>

<style lang="scss">
@mixin animationListItemsDelay() {
  @for $i from 1 through 20 {
    div:nth-child(#{$i}) {
      transition-delay: 0.4s * $i;
    }
  }
}

.break {
  flex-basis: 100%;
  height: 0;
}

.wake-up {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .inner {
    position: relative;
    text-align: center;
    padding: 100px 40px 60px;
    border-radius: 10px;
  }

  .animate {
    opacity: 0;
    transition: opacity 2s ease-out;
  }

  &.start-animation .animate {
    opacity: 1;
  }
}

.divider {
  display: inline-block;
  margin: 60px 0;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.05);
  width: 400px;
}

.circles {
  display: flex;
  justify-content: space-between;
  @include animationListItemsDelay();
  flex-wrap: wrap;
  width: 600px;


  .circle {
    width: 180px;
    box-sizing: border-box;
    height: 180px;
    padding: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.02);
    color: rgba(255, 255, 255, 1);
    position: relative;
    font-weight: 400;
    margin-bottom: 40px;

    backdrop-filter: blur(6px);
    background-color: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255,255,255,.1);
    box-shadow: 2px 2px 4px rgba(0,0,0,.03);

    span {
      font-size: 16px;

      &.text-small {
        font-size: 22px;
      }

      &.text-medium {
        line-height: 100px;
        font-size: 36px;
      }

      &.text-pull-up {
        position: relative;
        top: -20px;
      }
    }

    header {
      position: absolute;
      top: 22px;
      font-weight: 100;
      font-size: 16px;
    }

    article {
      height: 60px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 60px;
    }

    &.fill {
      background-color: white;
      color: #3e3c33;
    }

    footer {
      bottom: 20px;
      position: absolute;
      font-size: 12px;
      font-weight: 700;
    }

    p {
      font-size: 50px;
      position: relative;
      margin-bottom: 0;
      line-height: 60px;
    }

    i {
      position: relative;
      top: -2px;
      font-size: 36px;
      margin: 5px 10px 0 0;
    }
  }
}

.title {
  font-size: 80px;
  letter-spacing: 3px;
  margin-bottom: 60px;
  font-weight: 200;
  font-family: "M PLUS 1p", sans-serif;

  strong {
    font-weight: 400;
  }
}

.hello-text {
  transition-delay: 0.5s;
  font-weight: 300;
  font-size: 32px;
}
</style>
