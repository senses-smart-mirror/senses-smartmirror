<template>
  <transition name="fade">
    <div
      class="component reminders"
      v-bind:class="[{ 'animate-out': animateOut }, componentDesign]"
      v-bind:style="styles"
      v-if="module.settings.show"
    >
      <header>
        <h4 v-show="module.settings.header">
          <i v-show="showHeaderIcon" class="header-icon" v-bind:class="module.icon"></i>
          {{ module.settings.header }}
        </h4>
      </header>
      <section v-if="!isLoading">
        <ul class="reminders-list" v-if="!module.settings.showSingle">
          <li v-for="(reminder, key) in reminders" :key="key">
            <section>
              <i
                v-show="module.settings.showIcon"
                class="fad fa-alarm-exclamation text-muted"
              ></i>
              <p>
                <strong>{{ reminder.reminder }}</strong>
                {{ reminder.in }}
              </p>
            </section>
            <span class="datetime"
              >{{ reminder.datetime.format('DD MMM') }} - {{ reminder.time }}</span
            >
          </li>
        </ul>

        <section
          class="reminder"
          v-if="module.settings.showSingle && reminders.length"
        >
          <h2>{{ reminders[0].in }}</h2>
          <h4 class="text-bright">{{ reminders[0].reminder }}</h4>
        </section>
      </section>

      <section class="no-reminders" v-if="!reminders.length">
        <p>No reminders set for today.</p>
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
  name: "reminders",

  props: ["module"],

  data() {
    return {
      interval: null,
      isLoading: true,
      reminders: [],
    };
  },

  watch: {
    module: {
      immediate: true,
      handler() {
        this.isLoading = true;
        clearInterval(this.interval);

        setTimeout(() => this.setupReminders(), 1000);
      },
    },
  },

  destroyed() {
    clearInterval(this.interval);
  },

  methods: {
    setupReminders() {
      this.interval = setInterval(() => {
        const now = moment();
        this.reminders = [];

        this.module.settings.reminders.forEach((reminder) => {

          const datetime = moment(
            `${reminder.date} ${reminder.time}`,
            "DD-MM hh:mm"
          );

          if (
            datetime.isBetween(now, now.clone().add("24", "hours"), null, "[]")
          ) {
            reminder.in = moment().to(datetime);
            reminder.datetime = datetime;
            this.reminders.push(reminder);
          }

          if (this.module.settings.pushNotification) {
            if (
              datetime.isBetween(now, now.clone().add("2", "hours"), null, "[]")
            ) {
              this.sendNotification(reminder);
            }
          }
        });

        if (this.reminders.length) {
          this.pushMinimalWidgetData({
            header: "Reminders",
            text: this.reminders.length,
            footer: "Today",
          });
        }

        this.storeWidgetText({text: `You currently have <strong>${this.reminders.length} reminders</strong> active.`});

        this.reminders = this.reminders.sort((a, b) => a.datetime - b.datetime);
        this.isLoading = false;
      }, 1000);
    },
    sendNotification(reminder) {
      if (  this.hasSendNotification ) return;
      const notification = {
        title: "Reminder coming up: <strong>" + reminder.reminder + "</strong>",
        meta: `${moment(reminder.dateTime).format('DD MMM')} - ${reminder.time}`,
      };
      this.emitNotification(notification);
      this.hasSendNotification = true;
    },
  },

  computed: {
    styles() {
      return {
        width: this.module.settings.widget_width + "px",
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/vars";
@import "../../styles/partials/animations";

.last {
  .reminders-list {
    text-align: right;

    i {
      margin-left: $normal-spacing;
    }

    section {
      display: flex;
      flex-direction: row-reverse;
    }

    .datetime {
      margin-right: 40px;
    }
  }

  .no-reminders {
    text-align: right;
  }
}

.reminders-list {
  li {
    margin-bottom: $large-spacing;

    i {
      margin-right: $normal-spacing;
      font-size: 20px;
    }

    p {
      color: $text-bright;
    }

    section {
      display: flex;
      align-items: center;
    }

    .datetime {
      margin-left: 30px;
    }
  }
}
</style>
