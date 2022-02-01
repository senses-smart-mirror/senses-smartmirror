<template>
  <div
    class="component speed-cameras"
    v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
    v-bind:style="styles"
    v-if="module.settings.show && conditionalShow"
  >
    <header>
      <h4 v-show="module.settings.header">
        <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
        {{ module.settings.header }}
      </h4>
    </header>
    <section class="speed-cameras-list" v-if="!isLoading">
      <ul>
        <li class="speed-camera-item" v-bind:key="key" v-for="(camera, key) in cameras">
          <div>
            <i class="fad fa-camera"></i>
            <span class="desc text-bright">{{ camera.road }} - {{ camera.location }}</span>
            <!-- <span class="position">(HM: {{camera.hmp_from }})</span> -->
            <span class="position">({{camera.location}})</span>
          </div>
          <p v-if="module.settings.description">
            <small class="type text-muted" v-if="camera.subtype">Mobiele flitser:</small>
            {{ camera.direction }}
          </p>
        </li>
      </ul>
      <article v-if="!cameras.length && !error">
        <p>
          No speed cameras found<span v-show="!roads.length">.</span>
          <span v-show="roads.length">&nbsp; on </span>
          <strong>{{roads.join(', ')}}</strong>
          <br v-show="roads.length"> Go for it!
        </p>
      </article>
    </section>
    <section v-if="!isLoading && error">
      <p class="error-msg">Cannot load speed camera info at this time.</p>
    </section>
    <section v-if="isLoading">
      <loader></loader>
    </section>
  </div>
</template>
<script>
export default {
  name: "speed-cameras",

  props: ["module"],

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_SPEED_CAMERA_DATA");
      }
    }
  },

  data() {
    return {
      isLoading: true,
      error: false,
      animateOut: false,
      cameras: [],
      roads: []
    };
  },

  created() {
    this.subscribe("BROADCAST_SPEED_CAMERAS_DATA", this.handler);
  },

  methods: {
    handler(data) {
      if (data.error) {
        console.log("[Speed Control] - error", data.error);
        this.error = true;
        this.isLoading = false;
      } else {
        this.error = false;
        if (this.module.settings.filter) {
          this.roads = this.module.settings.filter.replace(/ /g, "").split(",");
        } else {
          this.roads = [];
        }
        this.cameras = data
          .filter(item => {
            if (this.roads.length) {
              return this.roads.indexOf(item.properties.road) >= 0;
            }
            return item;
          }).map(item => {
            return {
              road: item.properties.road,
              location: item.properties.location,
              direction: item.properties.direction,
              road_letter: item.properties.road_letter
            }
          });

        this.pushNotification();

        this.pushMinimalWidgetData({
          header: 'Enforcement',
          text: this.cameras.length || 0,
          footer: 'Cameras'
        });

        this.storeWidgetText({text: `There are <strong>${this.cameras.length} ${this.cameras.length>1 ? 'cameras' : 'camera'}</strong> active at the moment.`});

        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      }
    },
    pushNotification() {
      if (this.module.settings.pushNotification && this.cameras.length && this.roads.length ) {
        let list = '';
        this.cameras.forEach((item, key) => {
          list += `<strong>${item.road} </strong>${key !== this.cameras.length-1 ? ', ' : '' }`;
        });
        const notification = {
          title: "<strong>Be carefull!</strong> Speed camera's found on " + list
        };
        this.emitNotification(notification);
      }
    }
  },

  computed: {
    conditionalShow() {
      if (this.module.settings.conditional_show && this.cameras.length == 0) {
        return false;
      }
      return true;
    },
    styles() {
      if (this.animateOut) {
        return {
          animationDelay: 0.25 * this.cameras.length + "s",
          width: this.module.settings.widget_width + "px"
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px"
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.speed-camera-item {
  display: flex;
  flex-direction: column;
  margin-bottom: $large-spacing;

  > div {
    display: flex;
    align-items: center;
    margin-bottom: $small-spacing;
  }

  i {
    font-size: 20px;
  }

  .type,
  .desc,
  .position {
    margin-left: $normal-spacing;
  }

  .desc {
    font-weight: 700;
  }
}

.last {
  .speed-camera-item {
    align-items: flex-end;

    > div {
      display: flex;
      flex-direction: row-reverse;
    }

    i {
      margin-left: 10px;
    }
  }

  p {
    text-align: right;
  }
}
</style>
