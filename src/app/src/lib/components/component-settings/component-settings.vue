<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-cog"></i>
      <h3 class="overlay-title">{{ formatName(component.name) }}</h3>
      <span class="overlay-close-button" @click="closeOverlay()"
        ><i class="fas fa-times"></i
      ></span>
    </header>

    <section class="overlay-content">
      <transition name="fade">
        <div
          class="notification notification-success"
          transition="fade"
          v-if="showNotification"
        >
          <p><strong>Success!</strong> {{ notificationText }}</p>
        </div>
      </transition>
      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>
      <section class="component-settings" v-if="!isLoading && !hasError">
        <p v-show="version" class="component-version">version: {{ version }}</p>
        <div v-if="!component.settings.length">
          <p>This component doesn't have any settings you can change.</p>
        </div>
        <div
          v-bind:key="key"
          v-for="(setting, key) in component.settings"
          class="setting-group"
        >
          <component-setting @validateForm="validateForm($event)" :_setting="setting"></component-setting>

          <span class="divider"></span>
        </div>
      </section>
      <section v-if="!isLoading && hasError">
        <p>
          Couldn't load component model data. Please try opening the component
          again.
        </p>
      </section>
    </section>

    <footer class="overlay-footer">
      <button
        class="btn btn-danger"
        @click="enableDelete()"
        :class="{ 'is-deleting': isDeletingCompoment }"
      >
        <span class="btn-group" v-if="isDeleteActive">
          <span><i class="far fa-times-circle"></i></span>
          <span @click="removeComponent()"><i class="fas fa-check"></i></span>
        </span>
        <span v-if="isDeletingCompoment" class="small-loader">
          <span class="lds-dual-ring"></span>
        </span>
        <span v-show="!isDeletingCompoment && !isDeleteActive">Remove</span>
      </button>
      <button
        class="btn btn-primary"
        :class="{ 'is-disabled': !component.settings.length, 'is-disabled': formIsInvalid }"
        @click="saveSettings()"
      >
        <span v-if="isSavingComponent" class="small-loader">
          <span class="lds-dual-ring"></span>
        </span>
        <span v-show="!isSavingComponent">Save</span>
      </button>
    </footer>
  </section>
</template>

<script>
import _ from "lodash";

import componentSetting from "../component-setting/component-setting";

export default {
  name: "component-settings",

  components: { componentSetting },

  props: ["component"],

  data() {
    return {
      isLoading: true,
      hasError: false,
      isSavingComponent: false,
      isDeletingCompoment: false,
      showNotification: false,
      isDeleteActive: false,
      version: "",
      notificationText: "Component settings saved.",
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
      // TODO: avoid mutating props
      this.component.settings = this.component.settings.filter(
        set => !set.disabled
      );

      if (!this.component.settings.length) return;
      this.isSavingComponent = true;
      this.$socket.emit("REQUEST_SAVE_COMPONENT", this.component);
    },
    enableDelete() {
      this.isDeleteActive = !this.isDeleteActive;
    },
    formatName(name) {
      return this.uppercaseFirst(name.replace("-", " "));
    },
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    removeComponent() {
      this.isDeletingCompoment = true;
      this.$emit("removing");
      this.$socket.emit("REQUEST_REMOVE_COMPONENT", this.component.id);
    }
  },

  created() {
    this.$socket.emit("REQUEST_COMPONENT_MODEL", {id: this.component.id, isNew: this.component.isNew});
  },

  sockets: {
    UPDATE_COMPONENT_READY(data) {
      if (data.status === "success") {
        setTimeout(() => {
          this.isSavingComponent = false;
          this.notificationText = "Component settings saved.";
          this.showNotification = true;

          setTimeout(() => (this.showNotification = false), 2000);
          setTimeout(() => this.closeOverlay(), 2000);
        }, 500);
      } else {
        setTimeout(() => {
          this.isDeletingCompoment = false;
          this.showNotification = true;
          this.notificationText = "Component removed!";
          setTimeout(() => this.closeOverlay(), 2000);
        }, 1000);
      }
    },
    BROADCAST_COMPONENT_MODEL(data) {
      if (data) {
        let model = data;
        let settings = this.component.settings;

        this.version = model.version;

        if (!this.component.isNew) {
          _.forEach(model.settings, item => {
            _.forEach(settings, setting => {
              if (item.name === setting.name) {
                if (setting.value === false) {
                  item.value = false;
                } else {
                  item.value = setting.value || item.defaultValue;
                }
              }
            });
          });
          settings = model.settings;
        } else {
          settings.map(item => {
            item.value =
              item.value === undefined ? item.defaultValue : item.value;
            return item;
          });
        }

        settings = _.sortBy(settings, "order");

        // FIX: mutating prop is not allowed.
        this.component.settings = settings;

        setTimeout(() => { this.isLoading = false; }, 500);

      } else {
        this.isLoading = false;
        this.hasError = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.is-saving-component {
  pointer-events: none;
}

.loader {
  padding: 40px 0;
  text-align: center;
}

.component-settings {
  position: relative;
}

.overlay-title {
  > i {
    margin-right: 5px;
  }
}

.is-deleting {
  pointer-events: none;
}

.divider {
  position: relative;
  display: inline-block;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  width: 60%;
  left: 20%;
  margin-bottom: $large-spacing+10;
}

.component-settings {
  position: relative;

  .component-version {
    font-size: 14px;
    position: absolute;
    right: -10px;
    top: -20px;
    color: #666;
    font-weight: 500;
  }
}
</style>
