<template>
  <div class="voice animated fadeIn" v-show="show" v-bind:class="{'fadeOut': fadeOut}">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
</template>

<script>
export default {

  name: 'voice',

  data () {
    return {
      show: false,
      fadeOut: false
    }
  },
  sockets: {
    showBars() {
     this.show = true;
    },
    hideBars() {
      this.fadeOut = true;

      setTimeout(() => {
        this.show = false;
        this.fadeOut = false;
      }, 500);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.voice {
    width: 300px;
    position: relative;
    background-color: #000;
    height: 100px;
    display: flex;
    justify-content: center;
}

.bar {
    position: absolute;
    border-radius: 1px;
    background: $text-color;
    width: 16px;
    animation: sound 0ms -800ms linear infinite alternate;

    margin-top: 50px;
    height: 10px;
}

@keyframes sound {
  0% {
    opacity: (random(1) + 35) * 0.01;
    margin-top: 50px;
  }
  100% {
    opacity: 1;
    margin-top: 0;
    height: 100px;
  }
}

$left: 0;
@for $i from 1 through 16 {
  .bar:nth-child(#{$i})  { left: $left; animation-duration: random(200) + 400ms; }
  $left: $i * 19px;
}
</style>
