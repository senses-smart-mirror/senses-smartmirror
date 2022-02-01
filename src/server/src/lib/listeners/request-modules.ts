export default (SmartMirror: any) => {
	return () => {
		SmartMirror.io.emit('BROADCAST_MODULES', SmartMirror.getModules());
	}
};