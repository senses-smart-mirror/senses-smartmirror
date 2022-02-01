<template>
  <section class="loader" :class="{'light': theme === 'light'}">
    <div class="loader-blocks">
      <div style="left:0;top:0;animation-delay:0s"></div>
      <div style="left:12px;top:0;animation-delay:0.125s"></div>
      <div style="left:24px;top:0;animation-delay:0.25s"></div>
      <div style="left:0px;top:12px;animation-delay:0.875s"></div>
      <div style="left:24px;top:12px;animation-delay:0.375s"></div>
      <div style="left:0px;top:24px;animation-delay:0.75s"></div>
      <div style="left:12px;top:24px;animation-delay:0.625s"></div>
      <div style="left:24px;top:24px;animation-delay:0.5s"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'loader',

  props: ['theme']
}
</script>

<style lang="scss" scoped>

  .light {
    @keyframes loader-blocks {
      0% { background: #888;}
      12.5% { background: #888;}
      12.625% { background: #555;}
      100% { background: #555;}
    }
    @-webkit-keyframes loader-blocks {
      0% { background: #888; }
      12.5% { background: #888; }
      12.625% { background: #555; }
      100% { background: #555; }
    }
  }

  .loader-blocks {
    position: relative;
  }
  .loader-blocks div {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #555;
    -webkit-animation: loader-blocks 1s linear infinite;
    animation: loader-blocks 1s linear infinite;
  }
  .loader-blocks {
    width: 33px;
    height: 33px;
    display: inline-block;
  }
</style>
