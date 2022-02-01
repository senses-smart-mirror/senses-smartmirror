<template>
  <section class="standby animated">

    <img src="@/assets/senses-logo.png" alt="Senses - Smart Mirror" width="200px">

    <h1 class="title text-bright">
      Smart
      <strong>Mirror</strong>
    </h1>

    <section v-if="finished">
      <h2 class="subtitle">
        The Smart Mirror is <strong>finished updating</strong>.
        </h2>
        <p>
          Please continue by clicking the <strong>continue button</strong> in the Senses - App.
        </p>
    </section>
    <section v-else>
      <h3 class="subtitle">
        The Smart Mirror is currently Performing
        <strong>an update</strong>.
        <br />After the update the
        <strong>Smart Mirror</strong> will automatically restart.
      </h3>
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
  </section>
</template>

<script>
export default {
  name: "updating",

  props: ['finished']
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.standby {
  display: flex;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
  text-align: center;
  align-items: center;
  -webkit-animation-duration: 0.5s;
  -moz-animation-duration: 0.5s;

  img {
    margin-bottom: 20px;
  }

  > section {
    max-width: 600px;
  }

  p {
    font-size: 1rem;
  }
  .title {
    font-size: $font-size * 5;
    font-weight: 100;
    margin-bottom: $large-spacing;
  }

  .subtitle {
    line-height: 36px;
    margin: 10px 0 $large-spacing * 2 0;
    font-weight: 200;
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
  width: 100%;
  position: relative;
  left: 49%;
}
.loader-blocks div {
  position: absolute;
  width: 10px;
  height: 10px;
  background: darken(#999, 40%);
  -webkit-animation: loader-blocks 1s linear infinite;
  animation: loader-blocks 1s linear infinite;
}

.use-light-theme {
  .loader-blocks div {
    background: rgba(255, 255, 255, 0.1);
    -webkit-animation: loader-blocks-light 1s linear infinite;
    animation: loader-blocks-light 1s linear infinite;
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
</style>
