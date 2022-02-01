<template>
  <section class="modal overlay-inner last-update-modal">
    <img src="@/assets/senses-logo.png" alt="Senses - Smart Mirror" width="100px" />

    <h1 class="title text-bright">Smart <strong>Mirror</strong></h1>
    <h3 class="subtitle">Update is successful!</h3>
    <p>
      The Smart Mirror installed:
      <strong>version {{ updateData }}</strong>
    </p>
    <footer>
      <button class="btn btn-primary" @click="closeModal()">Continue</button>
    </footer>
  </section>
</template>
<script>
export default {
  name: "last-update",

  props: ["updateData"],

  data() {
    return {
      availableComponents: []
    };
  },

  methods: {
    closeModal() {
      this.$emit("close");
      this.$socket.emit("REQUEST_AFTER_UPDATE");
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
  color: #fff;

  &.last-update-modal {
    padding-top: 100px;
  }

  .title {
    font-size: $font-size * 2;
    font-weight: 100;
    padding-top: $jumbo-spacing;
    margin-bottom: $jumbo-spacing;
  }

  .subtitle {
    font-weight: 200;
    font-size: $font-size * 1.4;
  }

  &.overlay-inner {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;

    h2 {
      margin-bottom: $large-spacing;
    }

    p {
      font-size: 14px;
      margin-bottom: $large-spacing * 2;
    }
  }
}
</style>
