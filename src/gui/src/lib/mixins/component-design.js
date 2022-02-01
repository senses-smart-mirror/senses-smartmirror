export default {
  computed: {
    componentDesign() {
      const settings = this.module.settings;
      return settings.widget_design ? settings.widget_design : '';
    },
    showHeaderIcon() {
      return this.module.settings.show_icon_in_header || false;
    }
  }
};
