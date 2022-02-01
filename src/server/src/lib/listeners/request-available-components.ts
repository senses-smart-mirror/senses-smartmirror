export default (SmartMirror: any) => {
	return () => {
		SmartMirror.io.emit('BROADCAST_AVAILABLE_COMPONENTS', SmartMirror.getAvailableWidgets());
	}
};