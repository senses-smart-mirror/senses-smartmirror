<template>
  <div class="component spacer" v-bind:style="{height: spacing + 'px'}"></div>
</template>
<script>
export default {
  name: 'spacer',

  props: ['module'],

  data () {
    return {
      spacing: 100
    }
  },

  watch: {
    module: {
      immediate: true,
      handler(newVal) {
        this.spacing = newVal.settings.spacing;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .spacer {
    width: auto;
  }
</style>
