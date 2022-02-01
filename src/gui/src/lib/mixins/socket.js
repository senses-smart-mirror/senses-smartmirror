export default {
  methods: {
    emit(name) {
      this.$socket.emit(`${name}-${this.module.id.substring(0, 8)}`);
    },
    subscribe(name, callback) {
      this.sockets.subscribe(
        `${name}-${this.module.id.substring(0, 8)}`,
        callback
      );
    },
    emitNotification(data) {
      data.name = this.module ? this.module.name : "";
      this.$socket.emit("PUSH_NOTIFICATION", data);
    },
    emitLog(data) {
      this.$socket.emit("SEND_LOG", data);
    },
    simpleEmit(name) {
      this.$socket.emit(name);
    },
    pushMinimalWidgetData(data) {
      if (!data) return;

      data.icon = data.icon || this.module.icon;
      data.name = this.module.name;
      this.$socket.emit("PUSH_DATA", data);
    },
  },
  created() {
    if (this.module && this.module.id) {
      this.subscribe(`BROADCAST_IS_LOADING`, () => {
        this.isLoading = true;
      });
    }
  },
};
