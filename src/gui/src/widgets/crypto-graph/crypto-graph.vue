<template>
  <transition name="fade">
    <div
      class="component crypto-graph-widget"
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

      <section v-if="!isLoading">
        <p v-if="error === true">Not able to load crypto data at this time.</p>

        <p v-if="error === 'no_coins'">No coins specified, use the <strong>Smart Mirror</strong> App to specify the crypto coins.</p>

        <ul v-if="!error" class="crypto-item-list">
          <li class="crypto-item" v-bind:key="key" v-for="(item, key) in list">
            <h4 class="crypto-item-header text-bright">
              <cryptoicon :symbol="item.currency" size="20" color="white" />
              <span class="item-name">{{item.currency}} - {{item.counter}}</span>
              <strong class="item-current">{{item.graphData[item.graphData.length-1]}}</strong>
              <small v-if="momentFormatMap[module.settings.dataType][1]" class="text-muted">({{momentFormatMap[module.settings.dataType][1]}})</small>
            </h4>
            <div class="crypto-graph">
              <div class="crypto-graph-legend text-bright">
                <span class="legend-high"><span>{{currencySymbols[item.counter]}}</span>{{ item.max }}</span>
                <span class="legend-mid"><span>{{currencySymbols[item.counter]}}</span>{{ item.mid }}</span>
                <span class="legend-low"><span>{{currencySymbols[item.counter]}}</span>{{ item.min }}</span>
              </div>
              <div class="graph">
                <trend
                  v-if="timeToDraw"
                  :data="item.graphData"
                  :gradient="['#ffffff']"
                  :height="80"
                  :width="graphWidth"
                  :autoDrawDuration="1000"
                  auto-draw
                ></trend>
              </div>
              <div class="graph-xas">
                <ul>
                  <li v-bind:key="key" v-for="(item,key) in item.xas">{{ item }}</li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>

<script>
import moment from "moment";

const currencySymbols = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥" // Japanese Yen
};

const momentFormatMap = {
  "day": ["DD", "Daily"],
  "hour": ["HH", "Hourly"],
  "minute": ["mm", "Minute"]
}

export default {
  name: "crypto-list",

  props: ["module"],

  data() {
    return {
      list: [],
      isLoading: true,
      error: false,
      currencySymbols: currencySymbols,
      momentFormatMap: momentFormatMap,
      timeToDraw: true
    };
  },

  watch: {
    animationStarted: {
      immediate: true,
      handler(newVal) {
        setTimeout(() => {
          if (this.module.settings.animateGraph) {
            this.timeToDraw = newVal;
          } else {
            this.timeToDraw = true;
          }
        }, 1000);
      }
    },
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_CRYPTO_LIST");
        this.isLoading = true;
      }
    }
  },

  computed: {
    graphWidth() {
      return this.module.settings.widget_width - 120;
    },
    styles() {
      if (this.animateOut && this.list.length) {
        return {
          width: this.module.settings.widget_width + "px"
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px"
        };
      }
    }
  },

  methods: {
    handleResult(data) {
      if ( data.error) {
        this.error = data.error;
        this.isLoading = false;
        return;
      } else {
        this.list = [];

        data.forEach(coin => {
          if (!coin || !coin.res.Data ) {
            this.error = true;
            this.isLoading = false;
            return;
          }

          const item = {
            currency: coin.currency,
            counter: coin.counter,
            graphData: [],
            max: 0,
            min: 0,
            mid: 0,
            xas: []
          };

          let sum = 0;

          const length = coin.res.Data.length;
          let divideBy10 = length - (length%10);

          const format = momentFormatMap[this.module.settings.dataType][0] || "DD";

          coin.res.Data.forEach((coinData, key) => {
            sum += coinData.close;
            item.graphData.push(coinData.close);
            let quickMath = Math.floor(key*(divideBy10/10));

            // In case there are less than 10 items, use the key instead of dynamic calculating.
            if ( length < 10 ) {
              quickMath = key;
            }

            if ( coin.res.Data[quickMath] ) {
              const formattedDate = moment(1000 * coin.res.Data[quickMath].time).format(format);
              item.xas.push(formattedDate);
            }
          });

          item.max = Math.max(...item.graphData);
          item.min = Math.min(...item.graphData);
          item.mid = (sum / coin.res.Data.length).toFixed(2);
          this.list.push( item);
        });
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  },

  created() {
    this.subscribe("BROADCAST_CRYPTO_LIST", this.handleResult);
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .error-msg {
    text-align: right;
  }
}

.crypto-item-list {
  li:last-child {
    margin-bottom: 40px;
  }
}

.crypto-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80px;
}

.item-current, .item-name {
  margin-right: $normal-spacing;
}

.item-name {
  font-weight: 200;
}

.crypto-item-header {
  display: flex;
  align-items: center;

  > span {
    margin-left: $normal-spacing;
  }

  > svg {
    margin-right: $normal-spacing;
  }
}

.component.crypto-graph {
  min-height: 220px;
}

.crypto-graph {
  display: inline-block;
  position: relative;
  height: 80px;
  width: 100%;
  text-align: left;

  .graph {
    min-height: 90px;
    min-width: 260px;
    margin-left: 50px;
  }

  .graph-xas {
    position: relative;
    left: 70px;
    bottom: 0;
    width: 80%;
    color: rgba(255,255,255,.8);

    ul {
      display: flex;
      justify-content: space-between;
    }
  }

  svg {
    margin-left: $normal-spacing * 2.5;
  }
}

.crypto-graph-legend {
  position: absolute;
  height: 100%;
  min-height: 100px;
  max-width: 100px;

  > span {
    display: inline-block;
    position: absolute;
    left: 0;

    span {
      margin-right: 5px;
    }

    &:first-child {
      top: 0;
    }

    &.legend-mid {
      top: 40%;
    }

    &:last-child {
      bottom: 0;
    }
  }
}
</style>
