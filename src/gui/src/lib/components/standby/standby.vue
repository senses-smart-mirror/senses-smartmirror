<template>
    <section class="standby animated" v-bind:class="{'fadeOutUp': done}">
        <h1 class="title text-bright">Smart <strong>Mirror</strong></h1>
        <h3 class="subtitle text-muted">The mirror is in standby mode</h3>
    </section>
</template>

<script>
export default {

  name: 'standby',

  props: ["done"],

  data () {
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
    @import '../../../styles/vars';

    .standby {
        display: flex;
        justify-content: center;
        height: 100vh;
        flex-direction: column;
        text-align: center;
        -webkit-animation-duration: 0.5s;
        -moz-animation-duration: 0.5s;

        .title {
            font-size: $font-size*5;
            font-weight: 100;
            margin-bottom: $large-spacing;
        }

        .subtitle {
            font-weight: 200;
            margin-bottom: $large-spacing*2;
        }
    }

    @keyframes loader-blocks {
          0% { background: #aaa;}
          12.5% { background: #aaa;}
          12.625% { background: darken(#999, 40%);}
          100% { background: darken(#999, 40%);}
        }
        @-webkit-keyframes loader-blocks {
          0% { background: #aaa; }
          12.5% { background: #aaa; }
          12.625% { background: darken(#999, 40%); }
          100% { background: darken(#999, 40%); }
        }
        .loader-blocks {
          position: relative;
        }
        .loader-blocks div {
          position: absolute;
          width: 10px;
          height: 10px;
          background: darken(#999, 40%);
          -webkit-animation: loader-blocks 1s linear infinite;
          animation: loader-blocks 1s linear infinite;
        }
        .loader-blocks {
          width: 33px;
          height: 33px;
          display: inline-block;
        }
</style>
