<template>
  <div class="grid-bg">
    <div class="hex-row">
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
    </div>
    <div class="hex-row">
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
    </div>
    <div class="hex-row">
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
    </div>
    <div class="hex-row">
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
    </div>
    <div class="hex-row">
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper hex-center-position">
        <div class="hex-shape"></div>
      </div>
      <div class="hex-shape-wrapper">
        <div class="hex-shape"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'grid-background'
}
</script>

<style lang="scss" scoped>
.grid-bg {
  -webkit-transform: perspective(600px) rotateX(60deg) scale(2);
  -moz-transform: perspective(600px) rotateX(60deg) scale(2);
  -ms-transform: perspective(600px) rotateX(60deg) scale(2);
  -o-transform: perspective(600px) rotateX(60deg) scale(2);
  transform: perspective(600px) rotateX(60deg) scale(2);

  position: absolute;
  width: 300px;
  height: 360px;
  right: 20px;
  bottom: 240px;
  z-index: 1;
  padding-left: 20px;
  box-sizing: border-box;
  overflow: hidden;

  .hex-row {
    clear: both;
  }

  .hex-shape-wrapper {
    float: left;
    width: 60px;
    height: 52px;
    margin: 0 -10px -22px 0;

    &.hex-center-position {
      margin-top: 28px;
    }
  }
}
</style>
