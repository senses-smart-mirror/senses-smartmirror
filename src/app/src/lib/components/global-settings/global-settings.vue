<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-cogs"></i>
      <h3 class="overlay-title">Global Settings</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fad fa-times"></i>
      </span>
    </header>

    <section class="overlay-content">
      <transition name="fade">
        <div class="notification notification-success" transition="fade" v-if="showNotification">
          <p>
            <strong>Success!</strong>
            {{ notificationText }}
          </p>
        </div>
      </transition>

      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>

      <section v-if="!isLoading && !hasError">
        <div class="setting" v-for="setting in settings" v-bind:key="setting.name">
          <component-setting @validateForm="validateForm($event)" :_setting="setting"></component-setting>
        </div>
      </section>
      <section v-if="!isLoading && hasError">
        <p>Error..</p>
      </section>
    </section>

    <footer class="overlay-footer">
      <button class="btn btn-primary" :class="{ 'is-disabled': formIsInvalid }" @click="saveSettings()" :disabled="isSavingSettings">
        <span v-if="isSavingSettings" class="small-loader">
          <span class="lds-dual-ring"></span>
        </span>
        <span v-show="!isSavingSettings">Save</span>
      </button>
    </footer>
  </section>
</template>
<script>
import componentSetting from "../component-setting/component-setting";

export default {
  name: "global-settings",

  components: { componentSetting },

  props: ["_settings"],

  data() {
    return {
      isLoading: true,
      hasError: false,
      isSavingSettings: false,
      showNotification: false,
      notificationText: "Settings saved!",
      formIsInvalid: false
    };
  },

  methods: {
    validateForm(hasError) {
      this.formIsInvalid = hasError ? true : false;
    },
    closeOverlay() {
      this.$emit("close");
    },
    saveSettings() {
      this.isSavingSettings = true;
      this.$socket.emit("REQUEST_SAVE_GLOBAL_SETTINGS", this.settings);
    },
    closeModal() {
      this.modalIsOpen = false;
    }
  },

  created() {
    this.$socket.emit("REQUEST_DEFAULT_SETTINGS");
  },

  sockets: {
    UPDATE_SAVE_SETTINGS(data) {
      if (data.status === "success") {
        setTimeout(() => {
          this.isSavingSettings = false;
          this.showNotification = true;
          setTimeout(() => (this.showNotification = false), 2000);
        }, 500);
      }
    },
    BROADCAST_UPDATING() {
      this.$emit("toggleUpdate");
    },
    BROADCAST_DEFAULT_SETTINGS(data) {
      let model = data;

      model.forEach(item => {
        this._settings.forEach(setting => {
          if (item.name === setting.name) {
            item.value = setting.value;
          }
        });
      });

      this.settings = model;
      this.isLoading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.setting {
  padding-bottom: 20px;
  margin-bottom: 50px;
  border-bottom: 1px solid rgba(255, 255, 255, .05);
}

.loader-wrap {
  text-align: center;
}
</style>
