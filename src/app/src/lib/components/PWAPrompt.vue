<template>
  <transition name="fade-up-in" appear>
    <div v-if="shown" class="pwa-prompt" :class="[{ shown }]">
      <p>Would you like to add the App to home screen?</p>
      <div class="button-group">
        <button class="install-button btn" @click="installPWA()">Install!</button>

        <button class="close-button btn" @click="dismissPrompt()">
          <span class="sr">Dismiss, don't Install</span>
        </button>
      </div>
    </div>
  </transition>
</template>


<script>
export default {
  data: () => ({
    installEvent: undefined,
    shown: false,
  }),
  mounted() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installEvent = e
      this.shown = true
    })
  },
  methods: {
    installPWA() {
      this.installEvent.prompt()
      this.installEvent.userChoice.then((choice) => {
        this.dismissPrompt() // Hide the banner once the user's clicked
        if (choice.outcome === 'accepted') {
          // Do something additional if the user chose to install
        } else {
          // Do something additional if the user declined
        }
      })
    },
    dismissPrompt() {
      this.shown = false
    }
  }
}
</script>

<style scoped lang="scss">
// If repurposing this component, you'll want to update the CSS variables.
.pwa-prompt {
  box-sizing: border-box;
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1f2328;
  color: white;
  transform: translateY(0);
}

button {
  font-family: 'Ubuntu', 'Verdana', sans-serif;
}

.fade-up-in-enter-active,
.fade-up-in-leave-active {
  transition: opacity 1s cubic-bezier(0.165, 0.84, 0.44, 1),
    transform 1s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform: translateY(0);
}
.fade-up-in-enter,
.fade-up-in-leave-to {
  opacity: 0;
  transform: translateY(-4rem);
}
</style>
