<template>
  <div id="app" class="wrapper">

    <PWAPrompt></PWAPrompt>

    <grid-background></grid-background>
    <div class="wrapper-inner">
      <section v-show="isLoading">
        <intro v-bind:done="readyForAnimation"></intro>
        <p v-if="waitingForConnection" class="connection-error">
          Seems like the server is not responding...
          <br />Waiting for connection.
        </p>
      </section>

      <section
        class="grid"
        ref="grid"
        v-show="!isLoading"
        :class="{ 'place-active': placeActive, 'design-mode': designMode }"
      >
        <div class="columns" ref="column" :style="gridStyleObject">
          <div class="column" v-for="column in grid" v-bind:key="column.id">
            <draggable
              class="drag-area"
              ref="dragArea"
              :data-drag-id="column.name + '.' + area.name"
              v-model="column.areas[key].components"
              v-bind:style="dragAreaHeight(column.name, area.name)"
              :class="[
                {
                  'bottom-area': area.name === 'bottomComponents',
                  'top-area': area.name === 'topComponents',
                }
              ]"
              v-for="(area, key) in column.areas"
              v-bind="dragOptions"
              v-bind:key="area.name"
              :group="{ name: 'components' }"
              @start="startDrag"
              @end="endDrag"
              handle=".component-icon"
            >
              <li
                class="component drag-item"
                :class="{ 'is-compressed': compressed }"
                @click="openComponentSettings(item)"
                v-for="item in area.components"
                :key="item.id"
              >
                <section v-if="item.isLoading" class="small-loader">
                  <div class="lds-dual-ring"></div>
                </section>
                <i v-show="!item.isLoading" class="component-icon" :class="[item.icon]"></i>
                <span class="component-title">{{ formatName(item.name) }}</span>
              </li>
              <div
                class="add-component-overlay"
                v-if="placeActive"
                @click="
                placeComponentToGrid(
                  column.areas[key].components,
                  column.name,
                  area.name
                )
                "
              >
                <span class="plus-sign">
                  <i class="far fa-plus"></i>
                </span>
              </div>
            </draggable>
          </div>
        </div>

        <section class="defaultProfileActive" v-if="defaultProfileActive">
          <h3>Default profile is active</h3>
          <p>You <strong>cannot</strong> change the widgets for the default profile. Please create a new profile in order to add new widgets.</p>
        </section>

        <div class="grid-slider">
          <vue-slider
            v-bind:min="-1"
            v-bind:max="100"
            v-bind:direction="'ttb'"
            :contained="true"
            @change="gridSliderChange($event)"
          >
            <template v-slot:dot>
              <span class="grid-slider-dot">
                <i class="fad fa-grip-lines"></i>
              </span>
            </template>
          </vue-slider>
        </div>
      </section>

      <section class="navigation" v-show="!isLoading">
        <ul>
          <li @click="openOverlaySettings()">
            <span class="icon-group">
              <i class="far fa-square"></i>
              <i class="far fa-square"></i>
            </span>
            <span class="navigation-label">Center</span>
          </li>
          <li @click="toggleSettingsPanel">
            <i class="fad fa-cogs"></i>
            <span class="navigation-label">Settings</span>
            <ul class="navigation-dropup" v-show="showSettingsPanel">
              <li @click="openSettings()">
                <i class="fad fa-sliders-v-square"></i>
                <span class="navigation-label">Settings</span>
              </li>
              <li @click="openOptions()">
                <i class="fad fa-cog"></i>
                <span class="navigation-label">Options</span>
              </li>
              <li @click="toggleCompress()">
                <i class="fad fa-compress"></i>
                <span class="navigation-label">Minimize</span>
              </li>
              <li @click="toggleDesignMode()">
                <i class="fad fa-ruler"></i>
                <span class="navigation-label">Design</span>
              </li>
            </ul>
          </li>
          <li class="pull-up">
            <div @click="addComponent(true)" class="hex-shape is-orange">
              <i class="fad fa-plus"></i>
            </div>
          </li>
          <li @click="toggleModuleWidgets()">
            <i class="fad fa-box"></i>
            <span class="navigation-label">Modules</span>
            <ul class="navigation-dropup" v-show="showModulePanel">
              <li @click="openCustomWidgets()">
                <i class="fad fa-th"></i>
                <span class="navigation-label">Widgets</span>
              </li>
              <li @click="openModules()">
                <i class="fad fa-boxes"></i>
                <span class="navigation-label">Modules</span>
              </li>
            </ul>
          </li>
          <li @click="toggleShowProfileOverlay()">
            <i class="fad fa-users"></i>
            <span class="navigation-label">Profiles</span>
          </li>
        </ul>
      </section>

      <!--  component settings overlay -->
      <section v-if="openComponentSettingsOverlay" class="overlay component-settings">
        <component-settings
          :component="openComponentSettingsOverlay"
          @close="closeOverlay()"
          @removing="isAddingNewOne = false"
        ></component-settings>
      </section>

      <!--  options settings overlay -->
      <section v-if="openOptionsOverlay" class="overlay options-settings">
        <overlay-options @close="closeOverlay()" @toggleUpdate="openUpdateScreen"></overlay-options>
      </section>

      <!-- global settings overlay -->
      <section v-if="changeGlobalSettings" class="overlay">
        <global-settings :_settings="globalSettings" @close="closeOverlay"></global-settings>
      </section>

      <!-- custom widget overlay -->
      <section v-if="showCustomWidgets" class="overlay">
        <custom-widgets @close="closeOverlay"></custom-widgets>
      </section>

      <!-- modules overlay -->
      <section v-if="showModules" class="overlay">
        <modules @close="closeOverlay"></modules>
      </section>

      <!-- update screen -->
      <section v-if="isUpdating" class="overlay">
        <update-screen></update-screen>
      </section>

      <!-- column overlay settings -->
      <section v-if="overlaySettings" class="overlay overlay-settings">
        <overlay-settings
          :overlay="overlayColumn"
          @open="openComponentSettings"
          @close="closeOverlay()"
          @addComponent="addComponent()"
          :componentToAdd="componentToAdd"
        ></overlay-settings>
      </section>

      <section v-if="showLastUpdate">
        <last-update :updateData="lastUpdate" @close="closeOverlay()"></last-update>
      </section>

      <!-- add component overlay -->
      <section v-if="canAddComponent" class="overlay">
        <add-component
          @place="placeComponent"
          @close="
          closeOverlay();
          placeActive = false;
          "
        ></add-component>
      </section>

      <!-- profile overlay -->
      <section v-if="showProfileOverlay" class="overlay">
        <profiles @close="closeOverlay()"></profiles>
      </section>
    </div>
    <!-- wrapper inner -->
  </div>
  <!-- wrapper -->
</template>

<script>
import draggable from "vuedraggable";
import intro from "./lib/components/intro/intro";
import componentSettings from "./lib/components/component-settings/component-settings";
import globalSettings from "./lib/components/global-settings/global-settings";
import overlaySettings from "./lib/components/overlay-settings/overlay-settings";
import overlayOptions from "./lib/components/overlay-options/overlay-options";
import addComponent from "./lib/components/add-component/add-component";
import updateScreen from "./lib/components/update-screen/update-screen";
import lastUpdate from "./lib/components/last-update/last-update";
import customWidgets from "./lib/components/custom-widgets/custom-widgets";
import gridBackground from "./lib/components/grid-background/grid-background";
import profiles from "./lib/components/profiles/profiles";
import modules from "./lib/components/modules/modules";
import VueSlider from "vue-slider-component";
import PWAPrompt from './lib/components/PWAPrompt';

const COMPONENTS = {
  VueSlider,
  intro,
  gridBackground,
  draggable,
  componentSettings,
  globalSettings,
  overlaySettings,
  addComponent,
  updateScreen,
  lastUpdate,
  customWidgets,
  overlayOptions,
  modules,
  profiles,
  PWAPrompt
};

const GRID = [
  {
    name: "column1",
    areas: [
      {
        name: "topComponents",
        components: [],
      },
      { name: "bottomComponents", components: [] },
    ],
  },
  {
    name: "column2",
    areas: [
      {
        name: "topComponents",
        components: [],
      },
      { name: "bottomComponents", components: [] },
    ],
  },
];

export default {
  name: "app",

  components: COMPONENTS,

  data() {
    return {
      readyForAnimation: false,
      isLoading: true,
      isUpdating: false,
      drag: false,
      updatingItem: false,
      canAddComponent: false,
      placeActive: false,
      openComponentSettingsOverlay: null,
      waitingForConnection: false,
      changeGlobalSettings: false,
      overlaySettings: false,
      globalSettings: [],
      grid: GRID,
      overlayColumn: [],
      componentToAdd: null,
      compressed: false,
      lastUpdate: {},
      showLastUpdate: false,
      showCustomWidgets: false,
      showModulePanel: false,
      showSettingsPanel: false,
      openOptionsOverlay: false,
      showModules: false,
      showProfileOverlay: false,
      gridStyleObject: { transform: 'translatey(0px)' },
      designMode: false,
      defaultProfileActive: false
    };
  },

  created() {
    this.$socket.emit("REQUEST_MIRROR_CONFIG");
  },

  methods: {
    dragAreaHeight(column, area) {
      let height = 0;

      this.grid.forEach(section => {
        if (section.name === column) {
          section.areas.forEach(_area => {
            if (_area.name === area) {
              height = _area.components.length * 100 + 100;
            }
          });
        }
      });

      return { height: height + 'px' }
    },
    gridSliderChange(value) {
      const columnsRef = this.$refs['column'];
      const gridRef = this.$refs['grid'];
      const height = columnsRef.offsetHeight;
      const gridHeight = gridRef.offsetHeight - 10;

      value = value < 0 ? 0 : value > 100 ? 100 : value
      value = ((height - gridHeight) / 100 * value) * -1;

      if (height > gridHeight) {
        this.gridStyleObject = { transform: `translateY(${value}px)` }
      } else {
        this.gridStyleObject = { transform: `translateY(0px)` }
      }
    },
    toggleShowProfileOverlay() {
      this.showProfileOverlay = true;
    },
    toggleModuleWidgets() {
      this.showModulePanel = !this.showModulePanel;
      this.showSettingsPanel = false;
    },
    toggleSettingsPanel() {
      this.showSettingsPanel = !this.showSettingsPanel;
      this.showModulePanel = false;
    },
    startDrag: function (evt) {
      let index = this.getListId(evt.to);
      this.grid.forEach((column) => {
        if (column.name === index[0]) {
          column.areas.forEach((area) => {
            if (area.name === index[1]) {
              area.components[evt.oldIndex].isLoading = true;
            }
          });
        }
      });
    },
    endDrag: function (evt) {
      let index = this.getListId(evt.to);
      let item;
      let columnIndex;
      let areaIndex;

      const findItem = () =>
        this.grid.forEach((column, _index) => {
          if (column.name === index[0]) {
            columnIndex = _index;
            column.areas.forEach((area) => {
              if (area.name === index[1]) {
                areaIndex = area.name;
                item = area.components[evt.newIndex];
              }
            });
          }
        });

      this.updatingItem = true;
      findItem();

      // Issue: Vue Draggable is returning a wrong index position when you drag to the same area
      if (!item) {
        evt.newIndex = 0;
        findItem();
      }

      const data = {
        widgetId: item.id,
        toColumnId: columnIndex + 1,
        toAlignKey: areaIndex,
        toPositionId: evt.newIndex,
      };
      setTimeout(() => {
        this.$socket.emit("REQUEST_MOVE_COMPONENT", data);
        item.isLoading = false;
        this.updatingItem = false;
      }, 500);
    },
    formatName(name) {
      return this.uppercaseFirst(name.split("-").join(" "));
    },
    openCustomWidgets() {
      this.showCustomWidgets = true;
    },
    openModules() {
      this.showModules = true;
    },
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    toggleDesignMode() {
      this.designMode = !this.designMode;
    },
    toggleCompress() {
      this.compressed = !this.compressed;
    },
    openSettings() {
      this.changeGlobalSettings = true;
    },
    openComponentSettings(component) {
      this.openComponentSettingsOverlay = component;
    },
    getListId(elm) {
      return elm.getAttribute("data-drag-id").split(".");
    },
    addComponent(own) {
      if ( this.defaultProfileActive ) return;
      if (own) this.placeActive = true;
      this.canAddComponent = true;
    },
    openOverlaySettings() {
      if ( this.defaultProfileActive ) return;
      this.overlaySettings = true;
    },
    openUpdateScreen() {
      this.changeGlobalSettings = false;
      this.$set(this, "isUpdating", true);
    },
    placeComponent(component) {
      this.canAddComponent = false;
      this.componentToAdd = component;
    },
    placeComponentToGrid(positionArray, columnName, areaName) {
      this.placeActive = false;
      this.$set(this.componentToAdd, "isLoading", true);

      positionArray.push(this.componentToAdd);
      const itemPosition = positionArray.length - 1;

      this.isAddingNewOne = true;
      this.$socket.emit(
        "REQUEST_ADD_COMPONENT",
        { columnName, areaName, itemPosition },
        this.componentToAdd
      );

      setTimeout(() => {
        this._disableLoaderOnComponent(columnName, areaName, itemPosition);
      }, 500);
    },
    _disableLoaderOnComponent(columnName, areaName, itemPosition) {
      this.grid.forEach((column) => {
        if (column.name === columnName) {
          column.areas.forEach((area) => {
            if (area.name === areaName) {
              area.components[itemPosition].isLoading = false;
            }
          });
        }
      });
    },
    closeOverlay() {
      this.openComponentSettingsOverlay =
        this.canAddComponent =
        this.changeGlobalSettings =
        this.overlaySettings =
        this.showLastUpdate =
        this.showCustomWidgets =
        this.openOptionsOverlay =
        this.showModules =
        this.showProfileOverlay =
        false;
    },
    openOptions() {
      this.openOptionsOverlay = true;
    },
    doHealthChech() {
      console.log("[Senses - App]: Performing health check.");
      this.waitingForConnection = true;
      this.isLoading = true;
      this.$socket.emit("REQUEST_MIRROR_CONFIG");
    },
    checkIfUpdating(settings) {
      const formattedSettings = this.formatSettings(settings);
      return formattedSettings.updating ? true : false;
    },
    formatSettings(settings) {
      let rv = {};
      settings.forEach((s) => {
        rv[s.name] = s.value;
      });
      return rv;
    },
  },

  computed: {
    dragOptions() {
      return {
        animation: 100,
        ghostClass: "ghost-item",
        easing: "cubic-bezier(1, 0, 0, 1)",
        swapThreshold: 1,
        disabled: this.updatingItem ? true : false,
        draggable: ".drag-item",
        reload: false,
      };
    },
  },

  sockets: {
    BROADCAST_ADDED_COMPONENT(data) {
      data.isNew = true;
      this.componentToAdd = null;
      this.isAddingNewOne = false;

      setTimeout(() => {
        this.openComponentSettings(data);
      }, 250);
    },
    BROADCAST_MIRROR_RELOAD() {
      this.reload = true;
    },
    BROADCAST_MIRROR_CONFIG(data) {
      clearInterval(this.healthCheckInterval);

      if ( data.profile && data.profile.name === 'default' ) {
        this.defaultProfileActive = true;
      } else {
        this.defaultProfileActive = false;
      }

      if (this.checkIfUpdating(data.settings)) {
        this.isUpdating = true;
      } else {
        this.isUpdating = false;
      }

      if (data.lastUpdate) {
        this.showLastUpdate = true;
        this.isUpdating = false;
        this.lastUpdate = data.lastUpdate;
      }


      this.globalSettings = data.settings;
      this.overlayColumn = data.columns.filter((c) => c.id === 1000)[0];
      this.waitingForConnection = false;

      // In case of adding a new widget to the grid:
      // wait for the component to open its settings first before updating the grid.
      let timer = 0;
      if (this.isAddingNewOne) timer = 1000;

      setTimeout(() => {
        if (data) {
          data.columns.forEach((column) => {
            this.grid.forEach((gridColumn) => {
              if ("column" + column.id === gridColumn.name) {
                gridColumn.areas.forEach((area) => {
                  if (area.name === "topComponents")
                    area.components = column.topComponents;
                  if (area.name === "bottomComponents")
                    area.components = column.bottomComponents;
                });
              }
            });
          });
        }
      }, timer);

      setTimeout(() => (this.readyForAnimation = true), 2000);
      setTimeout(() => (this.isLoading = false), 2000);
    },
    connect() {
      console.log("[Senses - App]: Connected to socket!");
    },
    disconnect() {
      console.log("[Senses - App]: Connection closed!");

      this.readyForAnimation = false;

      clearInterval(this.healthCheckInterval);

      if (this.reload) {
        this.$socket.connect();
        this.reload = false;
      } else {
        this.isLoading = true;
        this.healthCheckInterval = setInterval(this.doHealthChech, 5000);
      }
    },
  },
};
</script>

<style lang="scss">
@import "styles/main";

body {
  background-color: #17191d;
  overflow: hidden;
}

.defaultProfileActive {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: rgba(0,0,0, .7);
  text-align: center;
  padding: 40px;
  font-size: 14px;
}

.resize-handler {
  display: inline-block;
  width: 20px;
  height: 40px;
  position: absolute;
  z-index: 10;

  i {
    font-size: 22px;
  }
}

.connection-error {
  text-align: center;
  margin: $jumbo-spacing 0;
}

.overlay {
  box-sizing: border-box;
  overflow: hidden;
  padding: 20px;
  background: #17191d;
  height: 100%;
  position: absolute;
  width: 100%;
  z-index: 888;
  top: 0;
  left: 0;

  &.component-settings {
    z-index: 999;
  }

  &-inner {
    height: 100%;
  }

  &-content {
    box-sizing: border-box;
    padding: 100px 20px;
    overflow: scroll;
    height: 100%;
    font-size: 14px;
  }

  &-header {
    box-sizing: border-box;
    position: fixed;
    top: 0;
    padding: 22px 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 9;
    left: 0;
    background-color: #1f2328;

    > h3 {
      margin: 0;
      text-transform: uppercase;
      font-weight: 500;
      color: #aebfc6;
    }

    i {
      font-size: 20px;
    }
  }

  &-close-button {
    position: relative;
    right: -5px;
    top: 3px;
    text-align: center;
    line-height: 30px;
    box-sizing: border-box;
    display: inline-block;
    width: 30px;
    height: 30px;
  }
}

.place-active {
  position: relative;

  .component {
    display: none;
  }
}

.wrapper {
  height: 100%;
  width: 100%;
  touch-action: none;

  .wrapper-inner {
    height: 100%;
    width: 100%;
    overflow: hidden;
    transform: translateZ(1000px);
    transform-style: preserve-3d;
    position: absolute;
    z-index: 10;
  }
}

.area-title {
  position: relative;
  font-size: 11px;
  left: -10px;
  top: -10px;
  color: #aaa;
}

.grid {
  position: relative;
  box-sizing: border-box;
  padding: 16px;
  height: calc(100% - 90px);

  &.place-active {
    .columns {
      width: 100%;
      height: 100%;
      display: flex;
      transform: unset !important;

      .column {
        height: 100%;

        .drag-area {
          height: 50% !important;
        }
      }
    }

    .grid-slider {
      display: none;
    }
  }
}

.grid {
  &.design-mode {

    .columns {
      width: 90%;
    }

    .grid-slider {
      display: flex;
    }
  }
}

.grid-slider {
  display: none;
  width: 10%;
  height: calc(100% - 140px);
  justify-content: flex-end;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 99;

  .vue-slider {
    height: 98% !important;

    .vue-slider-rail {
      width: 10px;
      background-color: #1f2328;
      border-radius: 2px;
    }

    .vue-slider-process {
      background-color: #1f2328;
    }
  }

  .grid-slider-dot {
    position: relative;
    top: -4px;
    z-index: 100;
    left: 0;
    display: inline-block;
    width: 26px;
    height: 26px;
    background-color: #34404f;
    border-radius: 6px;
    align-items: center;
    justify-content: center;
    display: flex;
    font-size: 16px;
  }

  .vue-slider-dot-tooltip {
    display: none;
  }
}

.overlay-footer,
.navigation {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 101;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #1f2328;
  padding: 20px;
  border-radius: 2px;
}

.navigation {
  padding: 0;

  ul {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;

    li {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      flex-grow: 100%;
      color: $icon-color;
      padding: $large-spacing $medium-spacing;

      .navigation-label {
        padding: 10px 0 0;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
      }

      i {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.7);
      }

      &.pull-up {
        padding: 5px;
        margin-top: -50px;
        color: #fff;
        position: relative;
        z-index: 9;

        > .hex-shape {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        i {
          z-index: 9;
          font-size: 24px;
        }

        > div {
          box-shadow: 3px 5px 20px rgba(255, 166, 0, 0.8);
        }
      }
    }
  }

  .navigation-dropup {
    box-sizing: border-box;
    position: fixed;
    width: 100%;
    left: 0;
    right: 0;
    bottom: 80px;
    height: 70px;
    display: flex;
    background-color: #1f2328;
    flex-direction: row;
    width: auto;
    border: 1px solid #2a3037;
    border-width: 1px 0;
    z-index: 0;

    .navigation-label {
      color: rgba(255, 255, 255, 0.7);
    }

    li {
      display: flex;
      padding: $large-spacing;
      border-right: 1px solid #2a3037;
      text-align: center;
      justify-content: center;

      &:last-child {
        border: none;
      }
    }
  }
}

.drag-area {
  min-height: 320px;
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
  display: flex;
  width: 100%;
  flex-direction: column;
  border-radius: 5px;
  margin-bottom: 20px;

  &.top-area.size-bottom {
    .component {
      padding: 10px 0;
      .component-icon {
        margin: 0;
      }
      .component-title {
        display: none;
      }
    }
  }

  &.bottom-area.size-top {
    .component {
      padding: 10px 0;
      .component-icon {
        margin: 0;
      }
      .component-title {
        display: none;
      }
    }
  }

  .add-component-overlay {
    box-sizing: border-box;
    position: absolute;
    left: -1px;
    top: -1px;
    bottom: -1px;
    right: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 12;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    background: #1f2328;

    > span {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .drag-item {
    margin-bottom: 20px;
    position: relative;
    transition: all ease-out 0.2s;
    color: #f2f2f2;
    opacity: 1;
    z-index: 11;

    &:last-child {
      margin: 0;
    }

    &:after {
      display: inline-block;
      position: absolute;
      right: 8px;
      font-style: normal;
      font-variant: normal;
      text-rendering: auto;
      -webkit-font-smoothing: antialiased;
      bottom: 2px;
      content: "\f7a4";
      font-weight: 900;
      font-family: "Font Awesome 5 Pro";
      color: #666;
    }

    &:hover,
    &:focus {
      cursor: pointer;
    }

    &.ghost-item {
      transition: none;
      transform: scale(0.9);
      background-color: #383f47;
      opacity: 0.9;

      .component-icon,
      .component-title {
        color: #999;
      }
    }

    &.sortable-drag {
      transition: none;
      transform: scale(1);
      opacity: 1;
    }
  }
}

/* Components */
.component-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -5px;

  .component {
    display: flex;
    justify-content: center;
    flex: 29% 0;
    margin: 0 5px 20px 5px;
  }
}

.component {
  &.is-compressed {
    padding: 10px 0;

    .component-icon {
      margin: 0;
    }
    .component-title {
      display: none;
    }
    .small-loader {
      margin-bottom: 0;
    }
  }

  .loader {
    padding: 0;
  }

  &-title {
    color: #f2f2f2;
    font-size: 14px;
  }

  &-icon {
    color: $icon-color;
    font-size: 22px;
    width: 100%;
    margin-bottom: 10px;
  }
}

.last .drag-area {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

// loader
.small-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  margin-bottom: 10px;
}
.lds-dual-ring {
  display: inline-block;
  width: 22px;
  height: 22px;
}
.lds-dual-ring:after {
  content: "";
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 4px solid #aaa;
  border-color: #aaa transparent #aaa transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
