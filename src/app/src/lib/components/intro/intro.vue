<template>
  <section class="intro animated" v-bind:class="{ fadeOutUp: done }">
    <img src="@/assets/senses-logo.png" alt="Senses - Smart Mirror" width="100px" />

    <h1 class="title text-bright"><strong>Senses</strong> - App</h1>
    <h3 class="subtitle">Starting the user interface</h3>
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
  margin-top: 60px;
  padding: 60px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  -webkit-animation-duration: 0.5s;
  -moz-animation-duration: 0.5s;

  img {
    margin-bottom: 20px;
  }

  .title {
    font-size: $font-size * 4;
    font-weight: 100;
    padding-top: $jumbo-spacing;
    margin-bottom: $jumbo-spacing;
    line-height: $font-size*8;
    font-family: "M PLUS 1p", sans-serif;

    small {
      font-size: $font-size*3;
      font-weight: 400;
      border-top: 1px solid rgba(255,255,255,.1);
      padding-top: 20px;
    }
  }

  .subtitle {
    font-weight: 200;
    font-size: $font-size * 1.4;
    color: $text-muted;
    margin: 0 0 $jumbo-spacing;
  }
}

@keyframes loader-blocks {
  0% {
    background: $text-muted;
  }
  12.5% {
    background: $text-muted;
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
    background: $text-muted;
  }
  12.5% {
    background: $text-muted;
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
</style>
