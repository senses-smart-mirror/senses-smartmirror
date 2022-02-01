<template>
  <section class="modal overlay-inner">
    <div class="is-updating">
      <h2>Smart Mirror is updating..</h2>
      <p>
        Please wait while the Smart Mirror is updating. After the update this
        screen will refresh and show the app again.
      </p>

      <div class="loader-wrap">
        <loader :theme="'light'"></loader>
      </div>

      <div class="continue-button" v-if="showContinue">
        <div class="divider"></div>
        <br />
        <p><em>It seems like the update is taking some time. Press continue if you want to cancel update.</em></p>
        <button class="btn btn-primary" @click="continueUpdate()">Continue</button>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  name: "update-screen",

  data() {
    return {
      showContinue: false
    }
  },

  created() {
    // setTimeout(() => {
    //   this.showContinue = true;
    // }, 5000);
  },

  methods: {
    continueUpdate() {
      // console.log('hi')
    }
  }
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.modal {
  padding: 40px $large-spacing;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #171717;
  z-index: 999;

  .continue-button {
    width: 100%;

    .divider {
      left: unset;
      margin-top: $large-spacing;
    }
  }

  .is-updating {
    height: 100%;
    width: 100%;
    display: flex;
    padding-top: 100px;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  p {
    font-size: 16px;
    margin-bottom: $large-spacing;
  }

  footer {
    display: flex;
    justify-content: space-between;
  }
}
</style>
