export default (SmartMirror: any) => {
  return async (data: Object) => {
    SmartMirror.updateWidget(data);

    await SmartMirror.saveProfile();

    SmartMirror.saveConfig().then(() => {
      SmartMirror.io.emit("BROADCAST_MIRROR_CONFIG", SmartMirror.getConfig());
      SmartMirror.io.emit("UPDATE_COMPONENT_READY", { status: "success" });
    });
  };
};
