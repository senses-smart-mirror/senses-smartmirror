<template>
  <section class="profile animated" v-bind:class="{ fadeOutUp: done }">
    <section class="inner-wrap">
      <h1 class="title text-bright">
        Smart
        <strong>Mirror</strong>
      </h1>
      <h2 class="subtitle mb-0" v-html="profile.welcome"></h2>
    </section>
  </section>
</template>

<script>
export default {
  name: "profile-welcome-message",

  props: ["done", "profile"],

  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  text-align: center;
  -webkit-animation-duration: 1s;
  -moz-animation-duration: 1s;
  position: absolute;
  z-index: 3;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  padding: 0 100px;
  background-color: #000;

  .inner-wrap {
    max-width: 600px;
  }
}

.title {
  font-size: $font-size * 5;
  font-weight: 100;
  margin-bottom: $large-spacing * 2;
}

.subtitle {
  font-weight: 300;
  font-size: 32px;
  margin-bottom: 0;
  line-height: 54px;
  color: #c5c5c5;
  font-family: "M PLUS 1p", sans-serif;
}

.use-light-theme {
  .subtitle {
    color: #fff;
  }
}

</style>
