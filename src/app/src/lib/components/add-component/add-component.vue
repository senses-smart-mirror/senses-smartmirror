<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-plus"></i>
      <h3>Add component</h3>
      <span class="overlay-close-button" @click="closeOverlay()"
        ><i class="fad fa-times"></i
      ></span>
    </header>

    <section class="overlay-content" v-if="!isLoading">
      <p class="description">
        Choose and click a widget and then select the area you want to drop the
        widget.
      </p>

      <section class="components-filter">
        <div class="filter-input">
          <span><i class="fad fa-filter"></i></span>
          <input
            v-on:keyup="filter()"
            class="input"
            type="text"
            v-model="filterText"
            placeholder="Filter widgets..."
          />
        </div>
      </section>

      <span class="divider"></span>

      <ul class="component-list">
        <li
          class="component"
          :class="{ 'is-custom': comp.custom }"
          @click="placeComponent(comp)"
          v-for="comp in components"
          :key="comp.name"
        >
          <i class="component-icon" :class="[comp.icon]"></i>
          <span class="component-title">{{ formatName(comp.name) }}</span>
          <span class="custom-tag" v-show="comp.custom">
            <span class="content">
              <i class="far fa-star"></i>
            </span>
          </span>
        </li>
      </ul>
    </section>

    <section class="overlay-content">
      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>
    </section>
  </section>
</template>
<script>
export default {
  name: "add-component",

  props: ["overlay", ""],

  data() {
    return {
      isLoading: true,
      availableComponents: [],
      components: [],
      filterText: "",
    };
  },

  methods: {
    filter() {
      if (this.filterText) {
        this.components = this.availableComponents.filter((comp) =>
          comp.name.toLowerCase().includes(this.filterText.toLowerCase())
        );
      } else {
        this.components = this.availableComponents;
      }
    },
    closeOverlay() {
      this.$emit("close");
    },
    placeComponent(comp) {
      this.$emit("place", comp);
    },
    formatName(name) {
      return this.uppercaseFirst(name.replace("-", " "));
    },
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
  },

  created() {
    this.isLoading = true;
    this.$socket.emit("REQUEST_AVAILABLE_COMPONENTS");
  },

  sockets: {
    BROADCAST_AVAILABLE_COMPONENTS(data) {
      setTimeout(() => {
        this.components = this.availableComponents = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.isLoading = false;
      }, 500);
    },
  },
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.overlay-content {
  position: relative;
  z-index: 8;
}

.filter-input {
  display: flex;
  margin-bottom: $large-spacing;

  span {
    background-color: #1f2328;
    border: 1px solid #373f48;
    border-right: 0;
    color: #aaa;
    font-size: 20px;
    display: inline-block;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60px;
  }

  input {
    width: 100%;
    padding: 15px 10px;
    font-size: 14px;
    border-radius: 2px;

    &:focus {
      outline: none;
    }
  }
}

.divider {
  position: relative;
  display: inline-block;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.05);
  width: 60%;
  left: 20%;
  margin-bottom: $large-spacing;
}

.component {
  position: relative;

  &.is-custom {
    background: repeating-linear-gradient(
      -55deg,
      #474f59,
      #474f59 10px,
      #383f47 10px,
      #383f47 20px
    );

    .custom-tag {
      position: absolute;
      right: 4px;
      top: 0;
      filter: drop-shadow(2px 3px 2px rgba(0, 0, 0, 0.2));

      > .content {
        color: white;
        font-size: 16px;
        text-align: center;
        font-weight: 400;
        background: var(--color, #2ca7d8)
          linear-gradient(
            45deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(255, 255, 255, 0.25) 100%
          );
        padding: 6px 4px;
        border-radius: 5px;
        clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 100%, 0 100%);
        width: var(--width, 32px);
      }
    }
  }
}
</style>
