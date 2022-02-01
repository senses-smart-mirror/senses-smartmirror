export default {
  data() {
    return {
      timeInterval: null
    }
  },
  methods: {
    clearInterval() {
      if ( this.timeInterval ) {
        clearInterval(this.timeInterval);
      }
    },
    createInterval() {
      this.timeInterval = setInterval(this.intervalHandler.bind(this), 5000);
    },
    intervalHandler() {
      const timeshow = this.module.settings.time_show.trim();
      const startTime = timeshow.split('-') && timeshow.split('-')[0] ? timeshow.split('-')[0].trim() : false;
      const endTime = timeshow.split('-') && timeshow.split('-')[1] ? timeshow.split('-')[1].trim() : false;

      if ( startTime && endTime ) {
        const currentDate = new Date()

        const startDate = new Date(currentDate.getTime());
        startDate.setHours(startTime.split(":")[0]);
        startDate.setMinutes(startTime.split(":")[1]);
        startDate.setSeconds(0);

        const endDate = new Date(currentDate.getTime());
        endDate.setHours(endTime.split(":")[0]);
        endDate.setMinutes(endTime.split(":")[1]);
        endDate.setSeconds(0);

        const inBetween = startDate < currentDate && endDate > currentDate;

        if ( ! inBetween ) {
          this.hideWidget();
        } else {
          this.showWidget();
        }
      }
    },
    hideWidget() {
      if ( this.module.settings.show ) {
        this.sendRequest(this.module.name, 'hide');
      }
    },
    showWidget() {
      if ( ! this.module.settings.show ) {
        this.sendRequest(this.module.name, 'show');
      }
    },
    sendRequest(name, type) {
      this.$socket.emit("REQUEST_TOGGLE_WIDGET_VISIBILITY", {name, type});
    }
  },
  watch: {
    module: {
      immediate: true,
      handler() {
        this.clearInterval();

        if ( this.module && this.module.settings.time_show && this.module.settings.show ) {
          this.intervalHandler();
          this.createInterval();
        }
      }
    }
  }
}
