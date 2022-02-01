<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-users"></i>
      <h3 class="overlay-title">User Profiles</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fas fa-times"></i>
      </span>
    </header>

    <section class="modal update-modal" v-if="modalIsOpen">
      <div class="overlay-header">
        <i class="fad fa-user"></i>
        <h3 class="overlay-title">Edit Profile</h3>
        <span @click="closeModal()" class="overlay-close-button">
          <i class="fad fa-times"></i>
        </span>
      </div>

      <div class="overlay-content">
        <transition name="fade">
          <div
            class="notification notification-success"
            transition="fade"
            v-if="showNotification"
          >
            <p>
              <strong>Success!</strong> The {{ profileEdit.label }} profile is
              saved.
            </p>
          </div>
        </transition>

        <p>
          On this screen you can edit your profile. Change the name or specify
          the welcome message.
        </p>

        <form>
          <div class="form-group">
            <label for="name">Profile name</label>
            <input
              class="mb-4"
              type="text"
              v-model="profileEdit.label"
              :disabled="profileEdit.name === 'default'"
              :class="{ 'is-disabled': profileEdit.name === 'default' }"
            />
            <em class="text-muted" v-if="profileEdit.name === 'default'"
              >You cannot change the default profile name.</em
            >
          </div>
          <span class="divider"></span>
          <div class="form-group">
            <label for="name">Profile welcome message</label>
            <textarea v-model="profileEdit.welcome"></textarea>
          </div>
        </form>
      </div>

      <footer class="overlay-footer">
        <button class="btn btn-primary ml-auto" @click="saveProfile()">
          <span v-if="isSavingProfile" class="small-loader">
            <span class="lds-dual-ring"></span>
          </span>
          <span v-if="!isSavingProfile">Save Profile</span>
        </button>
      </footer>
    </section>

    <section class="overlay-content">
      <p class="description">
        On this screen you can manage your <strong>profiles</strong> and switch
        the active profile. Creating a new profile will set up a blank profile
        without any widgets.
      </p>

      <span class="divider"></span>

      <section class="add-new-profile">
        <label class="">
          <strong>Add new Profile</strong>
        </label>
        <div class="input-form">
          <input
            type="text"
            placeholder="Type a profile name"
            v-model="newProfileName"
          />
          <button
            class="btn btn-small"
            v-on:click="addNewProfile()"
            :disabled="!newProfileName.length"
          >
            <span v-if="isCreatingNewProfile" class="small-loader">
              <span class="lds-dual-ring"></span>
            </span>
            <span v-show="!isCreatingNewProfile">Save Profile</span>
          </button>
        </div>

        <p class="error-msg" v-if="error">
          Profile with name "{{ newProfileName }}" already exists.
        </p>
      </section>

      <span class="divider"></span>

      <section class="custom-widgets" v-if="!isLoading">
        <h3 class="mb-4">Profiles</h3>
        <ul class="profiles-list">
          <li v-bind:key="key" v-for="(profile, key) in profiles">
            <i class="fad fa-user"></i>
            <strong class="text-bright">{{ profile.label }}</strong>

            <span class="profile-is-active" v-show="profile.active"
              >(active)</span
            >

            <div class="profile-action-group">
              <a @click="editProfile(profile)">
                <i class="fad fa-edit"></i>
              </a>
              <a
                v-if="!profile.active"
                class="profile-switch"
                v-on:click="switchProfile(profile)"
                ><i class="fad fa-retweet-alt"></i
              ></a>

              <a
                v-on:click="removeProfileOverlay(profile)"
                class="remove-profile"
                v-if="profile.name !== 'default'"
                ><i class="fad fa-times-octagon"></i
              ></a>
            </div>
          </li>
        </ul>
      </section>

      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>

      <section
        class="content-overlay switching-profile-overlay"
        v-if="isSwitchingProfile"
      >
        <section>
          <h1 class="mb-4 text-bright title">Smart <strong>Mirror</strong></h1>
          <p class="subtitle mb-4">
            The mirror is switching profiles.
            <strong>{{ showActivitationProfile }}</strong>
          </p>

          <div class="loader-wrap">
            <loader :theme="'light'"></loader>
          </div>
        </section>
      </section>

      <section class="content-overlay" v-if="showActivitationProfile">
        <section>
          <h4>Are you sure you want to switch profiles?</h4>
          <p class="mb-4">
            You will switch to profile:
            <strong class="text-bright">{{ showActivitationProfile }}</strong>
          </p>

          <div class="button-group">
            <button
              class="btn btn-primary btn-small"
              v-on:click="activateProfile()"
            >
              Switch
            </button>
            <button
              class="btn btn-small"
              v-on:click="showActivitationProfile = null"
            >
              Close
            </button>
          </div>
        </section>
      </section>

      <section class="content-overlay" v-if="showRemoveProfile">
        <section>
          <h4 class="text-bright">Are you sure?</h4>
          <p class="mb-4">
            You want to remove the profile:
            <strong>{{ showRemoveProfile.name }}</strong
            >.
          </p>

          <p class="mb-4">
            <strong class="text-danger"
              >Removing the profile will also remove the configuration! You will
              not be able to revert this.</strong
            >
            <br /><br />
            <span v-show="showRemoveProfile.active"
              ><em>The default profile will be activated.</em></span
            >
          </p>

          <div class="button-group">
            <button
              class="btn btn-primary btn-small btn-danger"
              v-on:click="removeProfile()"
            >
              <span v-if="isRemovingProfile" class="small-loader">
                <span class="lds-dual-ring"></span>
              </span>
              <span v-show="!isRemovingProfile">Remove</span>
            </button>
            <button class="btn btn-small" v-on:click="showRemoveProfile = null">
              Close
            </button>
          </div>
        </section>
      </section>
    </section>
  </section>
</template>
<script>
export default {
  name: "profiles",

  data() {
    return {
      isLoading: true,
      newProfileName: "",
      isCreatingNewProfile: false,
      profiles: [],
      error: null,
      showActivitationProfile: null,
      isSwitchingProfile: false,
      showRemoveProfile: false,
      isRemovingProfile: false,
      modalIsOpen: false,
      profileEdit: null,
      isSavingProfile: false,
      showNotification: false,
    };
  },

  methods: {
    saveProfile() {
      this.isSavingProfile = true;
      this.$socket.emit("REQUEST_SAVE_PROFILE", this.profileEdit);
    },
    editProfile(profile) {
      this.modalIsOpen = true;
      this.profileEdit = profile;
    },
    removeProfile() {
      this.isRemovingProfile = true;
      this.$socket.emit("REQUEST_REMOVE_PROFILE", this.showRemoveProfile.name);
    },
    removeProfileOverlay(profile) {
      this.showRemoveProfile = profile;
    },
    closeOverlay() {
      this.$emit("close");
    },
    addNewProfile() {
      if (!this.newProfileName.length) return;
      this.isCreatingNewProfile = true;
      this.$socket.emit("REQUEST_CREATE_NEW_PROFILE", this.newProfileName.trim());
    },
    switchProfile(profile) {
      this.showActivitationProfile = profile.name;
    },
    activateProfile() {
      if (this.showActivitationProfile) {
        this.$socket.emit(
          "REQUEST_SET_ACTIVE_PROFILE",
          this.showActivitationProfile
        );
      }
    },
    closeModal() {
      this.modalIsOpen = false;
    },
  },

  created() {
    this.$socket.emit("REQUEST_PROFILES");
  },

  sockets: {
    BROADCAST_SAVED_PROFILE(data) {
      if (data.success) {
        setTimeout(() => {
          this.isSavingProfile = this.modalIsOpen = false;
          this.profileEdit = null;
        }, 500);
      }
    },
    BROADCAST_MIRROR_CONFIG() {
      this.isSwitchingProfile = false;
    },
    BROADCAST_IS_SWITCHING_PROFILES() {
      this.isSwitchingProfile = true;
    },
    BROADCAST_PROFILE_REMOVE() {
      setTimeout(() => {
        this.showRemoveProfile = null;
        this.isRemovingProfile = false;
      }, 1000);
    },
    BROADCAST_PROFILES(data) {
      this.isLoading = true;

      if (data.error) {
        this.error = data.error;
        this.isCreatingNewProfile = false;
        return;
      }

      if (this.showActivitationProfile) {
        this.showActivitationProfile = null;
      }

      if (this.isCreatingNewProfile) {
        this.newProfileName = "";
        this.isCreatingNewProfile = false;
      }

      this.profiles = data;

      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../styles/vars";

.modal {
  .overlay-content {
    padding: 60px 0;
  }

  p {
    font-size: 14px;
  }

  h5 {
    font-size: 14px;
  }
}

.content-overlay {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  background-color: #17191d;
  text-align: center;

  > section {
    padding: $large-spacing;
    width: 100%;
  }

  &.switching-profile-overlay {
    justify-content: center;
    text-align: center;
  }
}

.input-form {
  display: flex;
  margin-bottom: $large-spacing;
  justify-content: space-between;

  input {
    width: 50%;
  }
}

input {
  padding: 15px 10px;
  color: #d3d3d3;
  font-size: 14px;
  -webkit-box-shadow: inset 0 0 3px #111;
  box-shadow: inset 0 0 3px #111;
  outline: none;
}

button:disabled,
.disabled {
  opacity: 0.8;
  pointer-events: none;
}

label {
  display: inline-block;
  color: #aebfc6;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 20px;
}

.mb-4 {
  margin-bottom: $large-spacing;
}

.profiles-list {
  li {
    padding-bottom: $large-spacing;
    margin-bottom: $large-spacing;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;

    > i {
      margin-right: $normal-spacing;
      font-size: 20px;
    }

    > span {
      margin-left: $normal-spacing;
    }

    .profile-action-group {
      width: 100px;
      margin-left: auto;
      display: flex;
      justify-content: flex-end;

      > a {
        display: inline-block;
        padding: 6px;
        min-width: 20px;
      }

      i {
        font-size: 16px;
        color: #c2c2c2;
      }
    }
  }
}

.text-danger {
  color: #ff0000;
}
</style>
