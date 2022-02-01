export default {
  methods: {
    storeWidgetText(data) {
      if ( ! data ) return;
      this.$store.commit('addData', {name: this.$options.name, ...data});
    },
    getWidgetText(name) {
      if ( ! name || ! this.$store.state.widgetData ) return;
      return this.$store.state.widgetData.filter(item => item.name === name);
    }
  }
};
