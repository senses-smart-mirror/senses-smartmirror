<template>
  <section class="intro animated" v-bind:class="{ fadeOutUp: done }">

    <img src="@/assets/senses-logo.png" alt="Senses - Smart Mirror" width="200px">

    <h1 class="title">Smart <strong>Mirror</strong></h1>
    <h3 class="subtitle">Starting the application...</h3>
    <div class="loader-blocks">
      <div style="left: 0; top: 0; animation-delay: 0s"></div>
      <div style="left: 12px; top: 0; animation-delay: 0.125s"></div>
      <div style="left: 24px; top: 0; animation-delay: 0.25s"></div>
      <div style="left: 0px; top: 12px; animation-delay: 0.875s"></div>
      <div style="left: 24px; top: 12px; animation-delay: 0.375s"></div>
      <div style="left: 0px; top: 24px; animation-delay: 0.75s"></div>
      <div style="left: 12px; top: 24px; animation-delay: 0.625s"></div>
      <div style="left: 24px; top: 24px; animation-delay: 0.5s"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: "Intro",

  props: ["done"],
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.intro {
  text-align: center;
  -webkit-animation-duration: 0.5s;
  -moz-animation-duration: 0.5s;

  img {
    margin-bottom: 20px;
    opacity: 1;
  }

  .title {
    color: $text-bright;
    margin-bottom: $jumbo-spacing;
    font-size: 80px;
    letter-spacing: 3px;
    font-weight: 200;

    strong {
      font-size: 80px;
      font-weight: 500;
    }
  }

  .subtitle {
    font-weight: 300;
    margin-bottom: $large-spacing * 3;
  }
}

@keyframes loader-blocks {
  0% {
    background: #aaa;
  }
  12.5% {
    background: #aaa;
  }
  12.625% {
    background: darken(#999, 40%);
  }
  100% {
    background: darken(#999, 40%);
  }
}
@-webkit-keyframes loader-blocks {
  0% {
    background: #aaa;
  }
  12.5% {
    background: #aaa;
  }
  12.625% {
    background: darken(#999, 40%);
  }
  100% {
    background: darken(#999, 40%);
  }
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

.use-light-theme {
  .loader-blocks div {
    background: rgba(255, 255, 255, 0.1);
    -webkit-animation: loader-blocks-light 1s linear infinite;
    animation: loader-blocks-light 1s linear infinite;
  }
}

@keyframes loader-blocks-light {
  0% { background: #fff;}
  12.5% { background: #fff;}
  12.625% { background: rgba(255, 255, 255, .1);}
  100% { background: rgba(255, 255, 255, .1);}
}

@-webkit-keyframes loader-blocks-light {
  0% { background: #fff;}
  12.5% { background: #fff;}
  12.625% { background: rgba(255, 255, 255, .1);}
  100% { background: rgba(255, 255, 255, .1);}
}
</style>
