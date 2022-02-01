<template>
  <section class="switch-profiles animated" v-bind:class="{ fadeOutUp: done }">
    <img src="@/assets/senses-logo.png" alt="Senses - Smart Mirror" width="140px" />

    <h1 class="title text-bright">
      Smart
      <strong>Mirror</strong>
    </h1>
    <h2 class="subtitle">
      The mirror is switching to profile
      <strong>{{ profile.label }}</strong>
    </h2>

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
  name: "switch-profile",

  props: ["done", "profile"],

  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";
.switch-profiles {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  text-align: center;
  -webkit-animation-duration: 1s;
  -moz-animation-duration: 1s;

  > img {
    margin-bottom: $large-spacing*2;
  }

  .title {
    font-size: $font-size * 5;
    font-weight: 100;
    margin-bottom: $large-spacing * 2;
  }

  .subtitle {
    font-weight: 200;
    margin-bottom: $large-spacing * 2;
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

@keyframes loader-blocks-light {
  0% {
    background: #fff;
  }
  12.5% {
    background: #fff;
  }
  12.625% {
    background: rgba(255, 255, 255, 0.1);
  }
  100% {
    background: rgba(255, 255, 255, 0.1);
  }
}

@-webkit-keyframes loader-blocks-light {
  0% {
    background: #fff;
  }
  12.5% {
    background: #fff;
  }
  12.625% {
    background: rgba(255, 255, 255, 0.1);
  }
  100% {
    background: rgba(255, 255, 255, 0.1);
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
</style>
