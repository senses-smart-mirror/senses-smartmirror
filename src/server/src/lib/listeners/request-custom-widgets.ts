export default (SmartMirror: any) => {
	return () => {
		SmartMirror.io.emit('BROADCAST_CUSTOM_WIDGETS', SmartMirror.getInstalledCustomWidgets());
	}
};