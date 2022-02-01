export default {
  sockets: {
    BROADCAST_SHOW_WIDGET(data) {
      if (data.whichOne === this.$options.name || data.whichOne === this.name ) {
        this.module.settings.show = data.mode === "hide" ? false : true;
      }
    }
  }
};
