<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <span class="icon-group">
        <i class="far fa-square"></i>
        <i class="far fa-square"></i>
      </span>
      <h3 class="overlay-title">Center Column</h3>
      <span class="overlay-close-button" @click="closeOverlay()"><i class="fad fa-times"></i></span>
  </header>

  <section class=overlay-content>
    <div class="loader-wrap" v-if="isLoading">
      <loader :theme="'light'"></loader>
    </div>
    <section class="drag-areas-wrapper" v-if="!isLoading">
      <div class="drag-areas">
        <draggable
          class="drag-area"
          :data-drag-id="'overlay_'+area.name"
          v-model="area.components"
          v-bind="dragOptions"
          v-for="area in areas"
          v-bind:key="area.id"
          :class="[{'bottom-area': area.name === 'bottomComponents', 'top-area': area.name === 'topComponents'}, 'size-'+[sizes[currentResizeMode]]]"
          :group="{ name: 'overlay_components' }"
          @end="endDrag"
          handle=".component-icon">
          <li class="component drag-item" :class="{'is-compressed': compressed}" @click="openComponentSettings(item)" v-for="item in area.components" :key="item.id">
            <section v-if="item.isLoading" class="small-loader">
              <div class="lds-dual-ring"></div>
            </section>
            <i v-show="!item.isLoading" class="component-icon" :class="[item.icon]"></i>
            <span class="component-title">{{ item.name }}</span>
          </li>

          <div class="add-component-overlay"
            v-if="placeActiveOverlay"
            @click="placeComponentToGrid(area.components, area.name)">
            <span class="plus-sign"><i class="fas fa-plus"></i></span>
          </div>
        </draggable>
      </div>
    </section>
  </section>

    <footer class="overlay-footer navigation" v-show="!isLoading">
      <ul>
        <li @click="addComponent()"><i class="fas fa-plus"></i><span class="navigation-label">Add</span></li>
        <li @click="toggleCompress()"><i class="fad fa-compress"></i><span class="navigation-label">Compress</span></li>
        <li @click="toggleResize()"><i class="fad fa-arrows-alt-v"></i><span class="navigation-label">Resize</span></li>
      </ul>
    </footer>
  </section>
</template>
<script>
import draggable from "vuedraggable";

export default {
  name: 'overlay-settings',

  props: ["overlay", "componentToAdd"],

  components: { draggable },

  data() {
    return {
      isLoading: true,
      areas: [],
      placeActiveOverlay: false,
      compressed: false,
      currentResizeMode: 0,
      sizes: ['normal', 'top', 'bottom'],
      dragOptions: {
        animation: 100,
        ghostClass: "ghost",
        easing: "cubic-bezier(1, 0, 0, 1)",
        swapThreshold: 1,
        disabled: this.updatingItem ? true : false,
        draggable: '.drag-item'
      }
    }
  },

  computed: {
    _componentToAdd: {
      get() { return this.componentToAdd },
      set(value) { this.value = value}
    }
  },

  methods: {
    toggleCompress() { this.compressed = !this.compressed; },
    toggleResize() {
      this.currentResizeMode = this.currentResizeMode < this.sizes.length-1 ? this.currentResizeMode+1 : 0;
    },
    placeComponentToGrid(area, areaName) {
      this.placeActiveOverlay = false;

      this.$set(this.componentToAdd, 'isLoading', true);
      area.push(this._componentToAdd);

      const itemPosition = area.length-1;
      const columnName = 'column1000';

      this.$socket.emit(
        "REQUEST_ADD_COMPONENT",
        { columnName, areaName, itemPosition },
        this._componentToAdd
      );

      setTimeout(() => {
        this._disableLoaderOnComponent();
      }, 1000);
    },
    _disableLoaderOnComponent() {
      this.areas.forEach(area => {
        area.components.forEach(component => {
          if ( component.isLoading ) component.isLoading = false;
        });
      });
    },
    closeOverlay() { this.$emit('close') },
    endDrag(evt) {
      const index = this.getListId(evt.to);
      let item;
      let areaIndex;

      this.updatingItem = true;

      this.areas.forEach((area) => {
        if ( area.name === index[1] ) {
          areaIndex = area.name;
          item = area.components[evt.newIndex];
          this.$set(item, 'isLoading', true);
        }
      });

      const data = { widgetId: item.id, toColumnId: 1000, toAlignKey: areaIndex, toPositionId: evt.newIndex}
      setTimeout(() => {
        this.$socket.emit('REQUEST_MOVE_COMPONENT', data);
        this.$set(item, 'isLoading', false);
        this.updatingItem = false;
      }, 2000)
    },
    getListId(elm) { return elm.getAttribute("data-drag-id").split('_'); },
    openComponentSettings(item) {
      this.$emit('open', item);
    },
    addComponent() {
      this.placeActiveOverlay = true;
      this.$emit('addComponent');
    }
  },

  created() {
    const area1 = {name: 'topComponents', components: this.overlay.topComponents};
    const area2 = {name: 'bottomComponents', components: this.overlay.bottomComponents};

    this.areas.push(area1);
    this.areas.push(area2);
    this.isLoading = false;
  },

  sockets: {
    BROADCAST_ADDED_COMPONENT(data) {
      data.isNew = true;
      this._componentToAdd = null;

      setTimeout(() => {
        this.openComponentSettings(data);
      }, 250);
    },
  }
}
</script>

<style lang="scss">
  @import '../../../styles/vars';

  section.overlay {
    padding: 0;
  }

  .overlay-settings {
    padding: 60px 0 80px 0;
    box-sizing: border-box;
    overflow: scroll;
    height: 100%;
    margin-bottom: 60px;
  }

  .loader-wrap {
    text-align: center;
  }

  .drag-areas, .drag-areas-wrapper {
    height: 100%;

    .drag-area {
      margin-bottom: 20px;
      align-items: center;

      .drag-item { width: 90%; }

      &.size-normal { height: 48%; }
      &.size-top { height: 83%; }

      &.top-area.size-bottom {
        height: 86px;
        overflow: hidden;
        .component {
          padding: 10px 0;
          .component-icon { margin: 0; }
          .component-title {
            display: none;
          }
        }
      }
      &.bottom-area.size-normal { height: 48%; }
      &.bottom-area.size-top {
        height: 86px;
        overflow: hidden;
        .component {
          padding: 10px 0;
          .component-icon { margin: 0; }
          .component-title {
            display: none;
          }
        }
      }
      &.bottom-area.size-bottom { height: 83%; }
    }
  }

</style>
