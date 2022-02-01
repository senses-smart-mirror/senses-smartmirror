<template>
  <transition name="fade">
    <div
      class="component"
      v-bind:class="[componentDesign]"
      v-if="module.settings.show && conditionalShow"
      v-bind:style="styles"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>

      <section
        class="notifications"
        :class="{'no-notifications': !notifications.length}"
        v-if="module.settings.show_one"
      >
        <transition-group name="fade" tag="div" v-if="notifications.length">
          <article
            class="notification text-bright"
            key="notification.title"
            v-if="notification"
          >
            <header>
              <i class="fad fa-bell"></i>
            </header>
            <content>
              <h4 v-html="notification.title"></h4>
              <span v-if="notification.meta" class="notification-meta">{{
                notification.meta
              }}</span>
            </content>
          </article>
        </transition-group>

        <section v-if="!notifications.length">
          <h6>There are no notifications.</h6>
        </section>
      </section>

      <section v-if="!module.settings.show_one && notifications.length">
        <ul class="notifications-list">
          <li
            class="notification"
            v-bind:key="key"
            v-for="(notification, key) in notifications"
          >
            <section>
              <i class="fad fa-bell"></i>
              <p
                class="feed-text text-bright m0"
                v-html="notification.title"
              ></p>
            </section>

            <span class="text-muted notification-meta">{{
              notification.meta
            }}</span>
          </li>
        </ul>
      </section>

      <section v-if="!notifications.length && !module.settings.show_one">
        <p>There are no notifications.</p>
      </section>
    </div>
  </transition>
</template>
<script>
export default {
  name: "notifications",

  props: ["module"],

  data() {
    return {
      name: "notifications",
      isLoading: true,
      error: false,
      notifications: [],
      notification: null,
      animationIndex: 0,
      interval: null,
    };
  },

  created() {
    this.subscribe("BROADCAST_NOTIFICATION", this.handler);
    this.subscribe("BROADCAST_NOTIFICATIONS_CLEAR", this.clearHandler);
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        if (this.module.settings.show_one) {
          this.setupInterval();
        } else {
          clearInterval(this.interval);
        }
        this.pushSmallWidgetData();
      },
    },
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
    conditionalShow() {
      if (
        this.module.settings.conditional_show &&
        this.notifications.length == 0
      ) {
        return false;
      }
      return true;
    },
  },

  methods: {
    pushSmallWidgetData() {
      this.pushMinimalWidgetData({
        header: "Notifications",
        text: this.notifications.length || 0,
        footer: "today",
      });
    },
    setupInterval() {
      this.intervalFunction();

      if (this.interval) clearInterval(this.interval);

      this.interval = setInterval(() => {
        this.intervalFunction();
      }, 10000);
    },
    intervalFunction() {
      if (this.notifications.length > 1) {
        this.animationIndex =
          this.animationIndex + 1 < this.notifications.length
            ? this.animationIndex + 1
            : 0;
        this.notification = null;

        setTimeout(() => {
          this.notification = this.notifications[this.animationIndex];
        }, 500);
      } else {
        this.notification = this.notifications[0];
      }
    },
    handler(data) {
      this.notifications.push(data);
    },
    clearHandler() {
      this.notification = {};
      this.notifications = [];
      clearInterval(this.interval);
    },
  },

  sockets: {
    PUSH_NOTIFICATION(data) {
      if (this.notifications.length > 0) {

        const found = this.notifications.find(item => item.name === data.name);

        if ( ! found ) {
          this.notifications.push(data);
          this.setupInterval();
        } else {
          this.notifications = this.notifications.filter(item => item.name !== data.name);
          this.notifications.push(data);
          this.setupInterval();
        }
      } else {
        this.notifications.push(data);
        this.setupInterval();
      }

      this.pushSmallWidgetData();
    },
  },

  destroyed() {
    clearInterval(this.interval);
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";

.last {
  p {
    text-align: right;
  }

  .notifications-list {
    .notification {
      align-items: flex-end;

      section {
        flex-direction: row-reverse;

        .fad {
          margin-left: $normal-spacing;
        }
      }

      &-meta {
        margin: 5px $large-spacing + 20 0 0;
      }
    }
  }
}

.notifications {
  &.no-notifications {
    min-height: 40px;
  }

  h6 {
    margin-bottom: 0;
  }
}

// animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.notifications-list {
  .notification {
    position: relative;
    margin-bottom: $large-spacing;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    section {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .notification-meta {
      display: inline-block;
      margin: 5px 0 0 $large-spacing + 12;
    }
  }
}

.notifications {
  position: relative;

  min-height: 60px;

  > div {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}

.notification {
  position: absolute;
  display: flex;
  align-items: center;

  h4 {
    font-weight: 400;
    margin-bottom: $small-spacing;
    line-height: 24px;
  }

  strong {
    font-weight: 700;
  }

  > header {
    width: 40px;
  }

  .fad {
    font-size: 24px;
    margin-right: $normal-spacing;
  }
}
</style>
