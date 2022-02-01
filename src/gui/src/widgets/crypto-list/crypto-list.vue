<template>
  <transition name="fade">
    <div
      class="component crypto-list"
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

        <small class="precentage-daily" v-if="module.settings.show_precentage">(24 hours %)</small>
        <ul v-if="!error">
          <li class="crypto-item" v-bind:key="key" v-for="(item, key) in list">
            <cryptoicon :symbol="item.currency" size="20" color="white" />
            <strong>{{item.currency}}</strong>

            <strong class="crypto-item-value">
              <span>{{currencySymbols[item.pair]}}</span>
              {{item.value}}
             </strong>
              <span v-if="module.settings.show_precentage" class="crypto-item-change">({{item.changePct}}%)</span>
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
const currencySymbols = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  GBP: "£", // British Pound Sterling
  JPY: "¥", // Japanese Yen
};

export default {
  name: "crypto-list",

  props: ["module"],

  data() {
    return {
      list: [],
      isLoading: true,
      error: false,
      currencySymbols: currencySymbols,
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.emit("REQUEST_CRYPTO_LIST");
        this.isLoading = true;
      },
    },
  },

  computed: {
    styles() {
      if (this.animateOut && this.list.length) {
        return {
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
    handleResult(data) {
      this.isLoading = true;

      if (data.error || data.Response == 'Error') {
        this.error = data.error;
        this.isLoading = false;
        return;
      } else {
        this.list = [];
        const _data = data.RAW;
        if (Object.keys(_data)) {
          Object.keys(_data).forEach((key) => {
             const item = { currency: key };
            Object.keys(_data[key]).forEach((pair) => {
              const _d = _data[key][pair];

              item.changePct = Math.round(_d.CHANGEPCT24HOUR * 100) / 100;
              item.value = Math.round(_d.PRICE * 100) / 100;
              item.pair = pair;
            });

            this.list.push(item);

            this.pushMinimalWidgetData({
              header: 'Crypto',
              icon: 'fad fa-euro-sign',
              text: `<span style="font-size: 24px;">${Math.round(this.list[0].value * 100) / 100}</span>`,
              footer: this.list[0].currency
            });
          });
        }
      }

      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    },
  },

  created() {
    this.subscribe("BROADCAST_CRYPTO_LIST", this.handleResult);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  p {
    text-align: right;
  }
}

.precentage-daily {
  display: inline-block;
  width: 100%;
  text-align: right;
  margin-bottom: 10px;
}

.crypto-item {
  display: flex;
  align-items: center;
  margin-bottom: $normal-spacing;

  &-change {
    margin-left: $small-spacing;
  }

  > svg {
    margin-right: $normal-spacing;
  }

  .crypto-item-value {
    margin-left: auto;
  }
}
</style>
