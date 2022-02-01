<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-box-alt"></i>
      <h3 class="overlay-title">Modules</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fas fa-times"></i>
      </span>
    </header>

    <section class="modal" v-if="modalIsOpen">
      <div class="overlay-header">
        <i class="fad fa-box-alt"></i>
        <h3 class="overlay-title">Module Settings</h3>
        <span @click="closeModalScreen()" class="overlay-close-button">
          <i class="fad fa-times"></i>
        </span>
      </div>

      <transition name="fade">
        <div
          class="notification notification-success"
          transition="fade"
          v-if="showNotification"
        >
          <p><strong>Success!</strong> module settings saved.</p>
        </div>
      </transition>

      <div class="modal-content">
        <h3 class="text-bright">Module status</h3>

        <p>Enable or disable the {{ editModule.name }} module.</p>

        <div class="mb-4">
          <label for="setting_0000" class="switch">
            <input
              id="setting_0000"
              v-model="editModule.enabled"
              type="checkbox"
              @change="toggleModule(editModule)"
            />
            <span class="switch-slider"></span>
          </label>
        </div>

        <span class="divider"></span>

        <div v-if="!editModule.settings.length">
          <p>This module doesn't have any settings.</p>
        </div>
        <div
          v-bind:key="key"
          v-for="(setting, key) in editModule.settings"
          class="setting-group"
        >
          <component-setting @validateForm="validateForm($event)" :_setting="setting"></component-setting>

          <span class="divider"></span>
        </div>

        <footer class="overlay-footer">
          <button class="btn btn-primary ml-auto" :class="{ 'is-disabled': formIsInvalid }" @click="saveSettings()">
            <span v-if="isSavingModule" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isSavingModule">Save</span>
          </button>
        </footer>
      </div>
    </section>

    <section class="overlay-content">
      <p class="description mb-4">
        In this screen you can view all installed modules. Open the
        <strong>module settings</strong> by clicking on them.
      </p>

      <section class="modules" v-if="!isLoading">
        <div
          class="module"
          @click="openModuleSettings(module)"
          v-for="(module, key) in modules"
          v-bind:key="key"
          :class="{ 'is-disabled': !module.enabled }"
        >
          <i class="fad" :class="[module.icon]"></i>
          <a>
            <span>{{ uppercaseFirst(module.name.trim()) }} </span>
          </a>
        </div>
      </section>

      <section v-if="!isLoading && !modules.length">
        <p><em>No modules found.</em></p>
      </section>

      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>
    </section>
  </section>
</template>
<script>
import componentSetting from "../component-setting/component-setting";

export default {
  name: "modules",

  components: { componentSetting },

  data() {
    return {
      modules: [],
      isLoading: false,
      isSavingModule: false,
      modalIsOpen: false,
      editModule: null,
      showNotification: false,
      formIsInvalid: false
    };
  },

  methods: {
    validateForm(hasError) {
      this.formIsInvalid = hasError ? true : false;
    },
    saveSettings() {
      this.isSavingModule = true;
      this.$socket.emit("REQUEST_SAVE_MODULE_SETTINGS", this.editModule);
    },
    openModuleSettings(module) {
      this.editModule = module;
      this.modalIsOpen = true;
    },
    closeModalScreen() {
      this.editModule = null;
      this.modalIsOpen = false;
    },
    closeOverlay() {
      this.$emit("close");
    },
    toggleModule(module) {
      this.$socket.emit("REQUEST_TOGGLE_MODULE", module.name);
    },
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
  },

  created() {
    this.$socket.emit("REQUEST_MODULES");
  },

  sockets: {
    UPDATE_MODULE_SAVE_SETTINGS() {
      setTimeout(() => {
        this.$socket.emit("REQUEST_MODULES");

        this.showNotification = true;
        this.isSavingModule = false;

        setTimeout(() => {
          this.showNotification = false;
        }, 1500);
      }, 500);
    },
    BROADCAST_MODULES(data) {
      this.modules = data;
    },
    BROADCAST_TOGGLE_MODULE(data) {
      const modules = this.modules;

      modules.map((module) => {
        if (module.name === data.name) {
          module.started = data.started;
          module.enabled = data.enabled;
        }
        return module;
      });

      this.modules = modules;
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.modal p {
  font-size: 14px;
}

.modules {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -5px;

  .module {
    box-sizing: border-box;
    display: flex;
    flex: 45% 0;
    margin: 0 5px 20px 5px;
    flex-direction: column;
    padding: 14px 0;
    text-align: center;
    border-radius: 10px;
    border: 1px solid #434c55;
    padding: 20px;
    justify-content: center;
    box-shadow: 3px 5px 20px rgba(37, 41, 46, .8);

    background: repeating-linear-gradient(
      -40deg,
      #383F47,
      #383F47 10px,
      #353b43 10px,
      #353b43 20px
    );

    &.is-disabled {
      color: #666;
      position: relative;

      &:after {
        content: "";
        position: absolute;
        display: inline-block;
        height: 3px;
        width: 50px;
        background: #666;
        transform: rotate(45deg);
        left: 50px;
        top: 35px;
      }

      a span {
        color: #666;
      }
    }

    i.fad {
      font-size: 30px;
      margin-bottom: 10px;
    }

    a {
      display: inline-block;
      line-height: 24px;
    }

    .small-loader {
      min-height: 28px;
      margin: 10px;
    }
  }
}
</style>
