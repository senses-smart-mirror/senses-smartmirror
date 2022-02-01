<template>
  <div class="component trends" v-bind:class="{'animate-out': animateOut}" v-bind:style="styles" v-if="module.settings.show">
    <header>
      <h4 v-show="module.settings.header" class="">{{module.settings.header}}</h4>
    </header>
    <section v-if="!error && !isLoading" class="chart-wrap">
      <article class="charts">
        <div class="chart">
          <div class="legend text-muted">
            Bitcoin data (BTC)
          </div>
          <trend v-if="timeToDraw"
            :data="[1, 2, 3, 7, 4, 10, 5, 10, 5, 3, 5, 3, 0, 2, 7, 9, 10, 19]"
            :gradient="['#ffffff']"
            :height="60"
            :width="200"
            :autoDrawDuration="1000"
            auto-draw
            smooth>
          </trend>
        </div>
        <div class="chart">
          <div class="legend text-muted">
            Etherium data (ETH)
          </div>
          <trend v-if="timeToDraw"
            :data="[1, 2, 3, 7, 4, 10, 5, 10, 5, 3, 5, 3, 0, 2, 7, 9, 10, 19]"
            :gradient="['#ffffff']"
            :height="60"
            :width="200"
            :autoDrawDuration="1000"
            auto-draw
            smooth>
          </trend>
        </div>
      </article>
    </section>

    <section v-if="error.length">

    </section>

    <section v-if="isLoading">
      <loader></loader>
    </section>

  </div>
</template>
<script>
export default {

  name: 'trends',

  props: ['module'],

  data() {
    return {
      isLoading: true,
      error: false,
      animateOut: false,
      timeToDraw: false
    };
  },

  watch: {
    animationStarted: {
      immediate: true,
      handler (newVal) {
        if ( newVal ) {
          setTimeout(() => {
            this.isLoading = false;
            this.timeToDraw = true;
          }, 1000)
          setTimeout(this.triggerAnimateOut, 5000);
        }
      }
    }
  },

  created() {
    if ( ! this.module.settings.animate ) {
      this.isLoading = false;
      setTimeout(() => { this.timeToDraw = true; }, 2000);
    }
  },

  methods: {
    triggerAnimateOut() {
      this.animateOut = true;
      setTimeout(() => {
        this.nextAnimation();
        this.animateOut = false;
      }, 1000);
    }
  },

  computed: {
    styles() {
      if ( this.animateOut ) {
        return { animationDelay: 0.25 +'s' }
      } else {
        return '';
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.trends {
  min-height: 151px;
}

/* animations */
.component.animate {
  display: block;
  animation-duration: .5s;
  @include animationFadeInLeft();
}

.component.animate-out {
  @include animationFadeOutLeft();

  .charts .chart {
    animation-duration: .5s;
    @include animationFadeOutLeft();
  }
}

.charts {
  display: flex;

  .chart {
    margin-right: $normal-spacing;
  }
}

.legend {

}

</style>
