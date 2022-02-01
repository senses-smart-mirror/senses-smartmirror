<template>
  <transition name="fade">
    <div
      class="component calendar"
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

      <section v-if="!error && !isLoading" class>
        <article v-if="module.settings.dailyOnly">
          <ul>
            <li v-bind:key="item.id" v-for="item in calendarDaily">
              <section class="calendar-item">
                <i v-show="module.settings.showIcon" class="fad fa-calendar-check"></i>
                <span
                  class="start-time text-bright"
                  v-show="module.settings.showStartTime"
                >{{ moment(item.start.dateTime).format("HH:mm") }}</span>
                <span class="summary text-bright">{{ item.summary }}</span>
                <span
                  v-show="module.settings.showFromNow"
                  class="calendar-item-date text-muted"
                >{{ formatDate(item.start.dateTime) }}</span>
              </section>
            </li>
          </ul>
          <p class="text-bright" v-show="!calendarDaily.length">No appointments today.</p>
        </article>
        <article v-else>
          <ul class="animate-list" ref="list">
            <li v-bind:key="item.id" v-for="item in calendar">
              <section>
                <i v-show="module.settings.showIcon" class="fad fa-calendar-check text-muted"></i>
                <span
                  class="start-time text-bright"
                  v-show="module.settings.showStartTime"
                >{{ moment(item.start.dateTime).format("DD-MM HH:mm") }}</span>
                <span class="text-bright">{{ item.summary }}</span>
              </section>
              <footer>
                <span
                  v-show="module.settings.showFromNow"
                  class="calendar-item-date text-muted"
                >{{ formatDate(item.start.dateTime) }}</span>
              </footer>
            </li>
          </ul>
          <p class="text-bright" v-show="!calendar.length">No appointments today.</p>
        </article>
      </section>

      <section v-if="error.length">
        <p
          class="error-msg"
          v-if="error === 'missing_ids'"
        >The Client ID and Client Secret are not provided in the Senses - App. Please go to the app and follow the instructions.</p>
        <p class="error-msg" v-if="error === 'missing_tokens'">
          The Access Token is not set correctly. Please use the Senses - App
          to setup the access token.
        </p>
        <p class="error-msg" v-if="error === 're-auth'">
          The Access Token is not valid anymore. Please use the Senses - App
          to re-authenticate.
        </p>
      </section>

      <section v-if="isLoading">
        <loader></loader>
      </section>
    </div>
  </transition>
</template>
<script>
import moment from "moment";

export default {
  name: "calendar",

  props: ["module"],

  data() {
    return {
      isLoading: true,
      error: false,
      moment: moment,
      calendar: [],
      calendarDaily: []
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.emit("REQUEST_CALENDAR_DATA");
      }
    }
  },

  methods: {
    formatDate(time) {
      return moment(time).fromNow();
    },
    iscurrentDate(date) {
      if (!date) return;
      return moment(date).isSame(new Date(), "d");
    },
    handler(data) {
      if (data.error) {
        this.error = data.error;
        this.isLoading = false;
      } else {
        this.error = false;
        this.calendar = data;
        this.calendarDaily = [];

        if (this.module.settings.amount) {
          data.splice(this.module.settings.amount);
        }

        data = data.forEach(item => {
          if (this.iscurrentDate(item.start.dateTime)) {
            this.calendarDaily.push(item);
          }

          if (!item.start.dateTime) {
            item.start.dateTime = moment(item.start.date);
          }
        });

        if (this.calendarDaily[0]) {
          this.pushMinimalWidgetData({
            header: 'Agenda',
            text: this.calendarDaily ? this.calendarDaily.length : 0,
            footer: moment().format('DD MMMM')
          });
        }

        if (this.calendarDaily[0] || this.calendar.length) {
          const firstAppointment = this.calendarDaily[0] || this.calendar[0];
          const toNow = moment().to(moment(firstAppointment.start.dateTime));
          this.storeWidgetText({ text: `Your next appointment today is <strong>${firstAppointment.summary}</strong> ${toNow}.` });
        }

        setTimeout(() => {
          this.isLoading = false;

          setTimeout(() => { this.fadeInListItems(); }, 500);
        }, 1000);
      }
    }
  },

  destroyed() {
    clearInterval(this.broadcastInterval);
  },

  computed: {
    conditionalShow() {
      if (
        this.module.settings.conditional_show &&
        (this.calendar.length == 0 || this.calendarDaily.length == 0)
      ) {
        return false;
      }
      return true;
    },
    styles() {
      if (this.animateOut) {
        return {
          width: this.module.settings.widget_width + "px",
          animationDelay:
            0.25 *
            (this.module.settings.dailyOnly
              ? this.calendarDaily.length
              : this.calendar.length) +
            "s"
        };
      } else {
        return {
          width: this.module.settings.widget_width + "px"
        };
      }
    }
  },

  created() {
    this.subscribe("BROADCAST_CALENDAR_DATA", this.handler);
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.calendar {
  ul {
    li {
      &:first-child {
        font-weight: 700;
      }

      section {
        display: flex;
        margin-bottom: 5px;
        align-items: center;

        i {
          margin-right: $normal-spacing;
          font-size: 20px;
        }
      }
    }

    footer {
      text-align: left;
      margin: 0 0 $large-spacing 28px;
    }
  }

  .start-time {
    margin-right: $small-spacing;
  }

  .calendar-item {
    display: flex;
    align-items: center;
    flex: 1 1 100%;
    margin-bottom: $large-spacing;
  }

  .location {
    margin-left: auto;
  }

  &-item-date {
    margin-left: auto;
  }
}

.last .calendar {
  article p {
    text-align: right;
  }

  ul {
    li {
      section {
        flex-direction: row-reverse;

        i {
          margin: 0 0 0 $normal-spacing;
        }

        .start-time {
          margin: 0 0 0 $small-spacing;
        }
      }
      footer {
        text-align: right;
        margin-right: 28px;
      }
    }
  }
}
</style>
