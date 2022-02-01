<template>
  <section class="overlay-inner">
    <header class="overlay-header">
      <i class="fad fa-box-alt"></i>
      <h3 class="overlay-title">Custom Widgets</h3>
      <span class="overlay-close-button" @click="closeOverlay()">
        <i class="fas fa-times"></i>
      </span>
    </header>

    <section class="overlay-content">
      <p class="description">
        On this screen you can view &amp; manage the custom widgets that are installed.
      </p>
      <section class="custom-widgets" v-if="!isLoading">
        <p v-if="!widgets.length"><em>There are no custom widgets installed.</em></p>
        <ul v-if="widgets.length">
          <li class="widget" v-bind:key="key" v-for="(widget, key) in widgets">
            <div class="widget-header">
              <i class="" :class="[widget.icon]"></i>
              <h4>{{ formatName(widget.name) }}</h4>
            </div>
            <span class="widget-info"
              ><strong>Version:</strong> {{ widget.version }}</span
            >
            <br />
            <span class="widget-info"
              ><strong>Author:</strong> {{ widget.author }}</span
            >
            <br />
            <span class="widget-info"
              ><strong>Info: </strong
              ><a target="_blank" v-bind:href="widget.link">Website</a></span
            >

            <span class="widget-remove" @click="showRemove(widget)">
              <i class="fad fa-trash"></i>
            </span>

            <div v-show="widget.shouldRemove" class="widget-remove-confirm">
              <p>
                Are you sure you? This action will completely remove the widget code and any reference in the config files.
              </p>
              <button class="btn btn-primary" @click="removeWidget(widget)">
                <span v-if="widget.isRemovingWidget" class="small-loader">
                  <span class="lds-dual-ring"></span>
                </span>
                <span v-show="!widget.isRemovingWidget">Yes</span>
              </button>
              <button class="btn" @click="cancelRemove(widget)">Go Back</button>
            </div>
          </li>
        </ul>
      </section>

      <div class="loader-wrap" v-if="isLoading">
        <loader :theme="'light'"></loader>
      </div>
    </section>
  </section>
</template>
<script>
export default {
  name: "custom-widgets",

  data() {
    return {
      widgets: [],
      isLoading: true,
    };
  },

  methods: {
    closeOverlay() {
      this.$emit("close");
    },
    formatName(name) {
      return this.uppercaseFirst(name.split("-").join(" "));
    },
    uppercaseFirst(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    showRemove(widget) {
      widget.shouldRemove = true;
      this.$forceUpdate();
    },
    removeWidget(widget) {
      widget.isRemovingWidget = true;
      this.$forceUpdate();

      this.$socket.emit("REQUEST_REMOVE_CUSTOM_WIDGET", widget);
    },
    cancelRemove(widget) {
      widget.shouldRemove = widget.isRemovingWidget = false;
      this.$forceUpdate();
    },
    removeWidgetFromList(widget) {
      this.widgets.forEach((_widget, index) => {
        if (_widget.name === widget.name) {
          this.widgets.splice(index, 1);
        }
      });
    },
  },

  created() {
    this.$socket.emit("REQUEST_CUSTOM_WIDGETS");
  },

  sockets: {
    BROADCAST_CUSTOM_WIDGETS(data) {
      this.widgets = data;

      setTimeout(() => {
        this.isLoading = false;
      }, 500);
    },
    BROADCAST_WIDGET_REMOVED(widget) {
      setTimeout(() => {
        this.removeWidgetFromList(widget);

        this.$socket.emit("REQUEST_MIRROR_CONFIG");
      }, 1000);
    },
  },
};
</script>

<style lang="scss">
@import "../../../styles/vars";

.widget {
  border-bottom: 1px solid #444;
  margin-bottom: $large-spacing;
  padding-bottom: $large-spacing;
  position: relative;

  i {
    font-size: 26px;
  }

  &-overlay {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #222;
    padding: $normal-spacing;
    color: white;

    .btn {
      margin-right: $normal-spacing;
    }
  }

  &-info {
    display: inline-block;
    margin-bottom: $small-spacing;
  }

  &-remove {
    display: inline-block;
    padding: 5px;
    position: absolute;
    right: 0;
    top: 20px;
  }

  &-header {
    display: flex;
    align-items: center;
    min-height: 60px;

    h4 {
      margin: 0;
    }

    i {
      margin-right: $normal-spacing;
    }
  }
}

.widget-remove-confirm {
  border-radius: 10px;
  border: 2px solid rgb(40, 40, 40);
  padding: 20px;
  background-color: #121212;
  position: absolute;
  z-index: 99;
  top: 0;

  button {
    margin-right: 20px;
  }
}

</style>
