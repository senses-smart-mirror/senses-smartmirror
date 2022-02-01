<template>
  <section class="animator">
    <section v-if="show && list.length">
      <component
        v-for="(component, key) in list"
        v-bind:class="{'animate': isActiveComponent(key)}"
        v-bind:nextAnimation="triggerNextComponentAnimation"
        v-bind:animationStarted="isActiveComponent(key)"
        v-bind:is="component.name"
        v-bind:key="key"
        v-bind:module="component">
    </component>
    </section>
    <section v-show="!show" class="loader-wrap">
      <loader></loader>
    </section>
  </section>
</template>

<script>
export default {
  name: 'animator',

  props: ['components'],

  data () {
    return {
      animationItemLength: 0,
      activeAnimationIndex: 0,
      list: [],
      key: 0,
      show: false,
    }
  },

  methods: {
    startAnimationCycle() {
      this.activeAnimationIndex = 0;
    },
    isActiveComponent(key) {
      return key === this.activeAnimationIndex;
    },
    triggerNextComponentAnimation() {
      this.activeAnimationIndex = ( this.activeAnimationIndex++ < this.animationItemLength-1 )
        ? this.activeAnimationIndex++ : 0;
    }
  },

  watch: {
    components: {
      immediate: true,
      handler (newVal) {
        this.show = false;
        setTimeout(() => {
          if ( newVal ) {
            this.list = newVal;
            this.animationItemLength = newVal.length;
            this.startAnimationCycle();
            this.show = true;
          }
        }, 2000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.last {
  .animator .loader-wrap {
    margin-right: 120px;
  }
}

.animator {
  section > div {
    display: none;
  }

  .loader-wrap {
    padding: 60px 0;
    max-width: 300px;
    text-align: center;
  }
}
</style>
