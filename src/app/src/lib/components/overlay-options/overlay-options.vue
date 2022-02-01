<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-cogs"></i>
      <h3 class="overlay-title">Options</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fad fa-times"></i>
      </span>
    </header>

    <transition name="fade">
      <div class="notification notification-success" transition="fade" v-if="showNotification">
        <p>
          <strong>Success!</strong>
          {{ notificationText }}
        </p>
      </div>
    </transition>

    <section class="modal update-modal" v-if="modalIsOpen">
      <div class="overlay-header">
        <i class="fad fa-cogs"></i>
        <h3 class="overlay-title">Update Smart Mirror</h3>
        <span @click="closeUpdateScreen()" class="overlay-close-button">
          <i class="fad fa-times"></i>
        </span>
      </div>

      <div class="overlay-content">
        <h4>Senses - Update</h4>
        <section v-if="versions.error">
          <p>There is an error fetching the latest version.</p>
        </section>
        <section v-else>
          <div v-show="versions.current < versions.latest">
            <p>There is a new version available. Do you want to update the Smart Mirror software?</p>
            <p>
              Installed Version:
              <strong>{{ versions.current }}</strong>
              <br />Latest Version:
              <strong>{{ versions.latest }}</strong>
            </p>

            <div class="divider"></div>

            <p class="description">
              <em>The update process will automatically backup your configuration and any profiles you created. Once you start the update the software will install the latest version and show a message when the update is ready.</em>
            </p>

            <div class="divider"></div>
          </div>

          <div v-show="versions.current > versions.latest">
            <p>It seems the version you installed is newer than the latest released version. We advise to preform a new clean install. Please head over to the documentation to find the instructions on how to install the software.</p>
          </div>

          <div v-show="versions.current == versions.latest">
            <p>
              No update available, the latest version of
              <strong>Senses - Smart Mirror</strong> is already installed.
            </p>

            <p>
              <em>Current version: {{ versions.current }}</em>
            </p>
          </div>
        </section>

        <footer>
          <button @click="closeModal()" class="btn btn-secondary">Close</button>
          <button
            v-show="versions.current != versions.latest && versions.current < versions.latest"
            @click="updateMirror()"
            class="btn btn-primary"
          >Update</button>
        </footer>
      </div>
    </section>

    <div class="overlay-content" v-if="showConnectToWifiOverlay">
      <h3>Connect the Smart Mirror to the internet</h3>

      <connect-to-internet @close="closeOverlay"></connect-to-internet>
    </div>

    <section class="overlay-content">
      <section class="settings">
        <div class="setting">
          <a class @click="reloadConfiguration()">
            <i class="fad fa-file-code"></i>
            <span v-if="isReloadingConfiguration" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isReloadingConfiguration">Reload config file</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="activateStandby()">
            <i class="fad fa-bolt"></i>
            <span v-if="isUpdatingPower" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isUpdatingPower">Toggle Standby Mode</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="activateBackup()">
            <i class="fad fa-file-code"></i>
            <span v-if="isBackupActive" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isBackupActive">Create Backup Configuration</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="activateUseBackup()">
            <i class="fad fa-file-code"></i>
            <span v-if="isUseBackupActive" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isUseBackupActive">Use Backup Configuration</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="turnOffMirror()">
            <i class="fad fa-power-off"></i>
            <span v-if="isTurningMirrorOff" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isTurningMirrorOff">Turn Off / On</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="turnOffMonitor()">
            <i class="fad fa-tv"></i>
            <span v-if="isTurningOffMonitor" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isTurningOffMonitor">Turn Off / On Monitor</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="checkForUpdates()">
            <i class="fad fa-clock"></i>
            <span v-if="isCheckingForUpdates" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isCheckingForUpdates">Check for Updates</span>
          </a>
        </div>

        <div class="setting">
          <a class @click="connectToInternet()">
            <i class="fad fa-wifi"></i>
            <span>Connect to WIFI</span>
          </a>
        </div>
      </section>
    </section>
  </section>
</template>
<script>
import api from "../../helpers/api";

import connectToInternet from '../connect-to-internet/connect-to-internet';

export default {
  name: "overlay-options",

  components: { connectToInternet },

  data() {
    return {
      isReloadingConfiguration: false,
      isUpdatingPower: false,
      isTurningMirrorOff: false,
      isBackupActive: false,
      isUseBackupActive: false,
      standbyMode: "on",
      mode: "on",
      isTurningOffMonitor: false,
      monitorStatus: "on",
      isCheckingForUpdates: false,
      modalIsOpen: false,
      versions: {},
      showConnectToWifiOverlay: false,
      showNotification: false,
      notificationText: "Option successfully executed"
    };
  },

  methods: {
    connectToInternet() {
      this.showConnectToWifiOverlay = true;
    },
    closeOverlay() {
      this.$emit("close");
    },
    closeUpdateScreen() {
      this.modalIsOpen = false;
    },
    activateBackup() {
      this.isBackupActive = true;
      api.axios.post("/backup").finally(() => {
        setTimeout(() => (this.isBackupActive = false), 1000);
      });
    },
    activateUseBackup() {
      this.isUseBackupActive = true;
      api.axios.post("/usebackup").finally(() => {
        setTimeout(() => (this.isUseBackupActive = false), 1000);
      });
    },
    reloadConfiguration() {
      this.isReloadingConfiguration = true;
      api.axios.post("/reload").finally(() => {
        setTimeout(() => (this.isReloadingConfiguration = false), 1000);
      });
    },
    activateStandby() {
      this.isUpdatingPower = true;
      this.standbyMode = this.standbyMode === "on" ? "standby" : "on";
      api.axios.post("/power", { mode: this.standbyMode }).finally(() => {
        setTimeout(() => (this.isUpdatingPower = false), 1000);
      });
    },
    closeModal() {
      this.modalIsOpen = false;
    },
    turnOffMonitor() {
      this.isTurningOffMonitor = true;
      this.monitorStatus = this.monitorStatus === "off" ? "on" : "off";
      api.axios.post("/monitor", { mode: this.monitorStatus }).finally(() => {
        setTimeout(() => (this.isTurningOffMonitor = false), 1000);
      });
    },
    checkForUpdates() {
      this.isCheckingForUpdates = true;
      this.$socket.emit("REQUEST_UPDATE");
    },
    updateMirror() {
      setTimeout(() => (this.modalIsOpen = false), 1000);
      api.axios.post("/update").finally(() => { });
    },
    turnOffMirror() {
      this.isTurningMirrorOff = true;
      this.mode = this.mode === "off" ? "on" : "off";
      api.axios.post("/power", { mode: this.mode }).finally(() => {
        setTimeout(() => (this.isTurningMirrorOff = false), 1000);
      });
    },
  },

  created() { },

  sockets: {
    BROADCAST_OPTION_SUCCESS() {
      setTimeout(() => {
        this.showNotification = true;
      }, 500);
    },
    BROADCAST_UPDATE_VERSIONS(data) {
      this.versions = data;
      setTimeout(() => {
        this.modalIsOpen = true;
        this.isCheckingForUpdates = false;
      }, 1000);
    },
    BROADCAST_UPDATING() {
      this.$emit("toggleUpdate");
    },
  },

  watch: {
    showNotification: function () {
      setTimeout(() => this.showNotification = false, 1500);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.loader-wrap {
  text-align: center;
}

.description {
  color: $text-color;
}

.settings {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -5px;

  .setting {
    box-sizing: border-box;
    display: flex;
    flex: 45% 0;
    margin: 0 5px 20px 5px;
    text-align: center;
    border-radius: 10px;
    border: 1px solid #434c55;
    box-shadow: 3px 5px 20px rgba(37, 41, 46, 0.8);

    background: repeating-linear-gradient(
      -40deg,
      #383f47,
      #383f47 10px,
      #353b43 10px,
      #353b43 20px
    );

    i.fad {
      font-size: 30px;
      margin-bottom: 20px;
    }

    a {
      display: inline-block;
      padding: 20px;
      display: flex;
      flex-direction: column;
      text-align: center;
      width: 100%;
      line-height: 20px;
    }

    .small-loader {
      min-height: 22px;
    }
  }
}
</style>
