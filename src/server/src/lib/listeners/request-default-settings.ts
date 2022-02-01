export default (SmartMirror: any) => {
	return () => {
		SmartMirror.io.emit('BROADCAST_DEFAULT_SETTINGS', SmartMirror.getGlobalSettings());
	}
};