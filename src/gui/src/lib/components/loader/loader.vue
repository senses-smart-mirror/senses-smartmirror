<template>
  <section class="loader">
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
</template>

<script>
export default {
  name: 'loader'
}
</script>

<style lang="scss" scoped>
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

@keyframes loader-blocks-inverse {
  0% {
    background: #aaa;
  }
  12.5% {
    background: #aaa;
  }
  12.625% {
    background: #eee;
  }
  100% {
    background: #eee;
  }
}
@-webkit-keyframes loader-blocks-inverse {
  0% {
    background: #aaa;
  }
  12.5% {
    background: #aaa;
  }
  12.625% {
    background:#c7c7c7;
  }
  100% {
    background: #c7c7c7;
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
  .loader {
    .loader-blocks div {
      background: rgba(255, 255, 255, 0.1);
      -webkit-animation: loader-blocks-light 1s linear infinite;
      animation: loader-blocks-light 1s linear infinite;
    }
  }
}

.component.background-box {
  .loader .loader-blocks div {
    background-color: #999;
    -webkit-animation: loader-blocks-inverse 1s linear infinite;
    animation: loader-blocks-inverse 1s linear infinite;
  }
}


</style>
