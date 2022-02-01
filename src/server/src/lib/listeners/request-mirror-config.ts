export default (SmartMirror: any) => {
	return () => {
		SmartMirror.io.emit('BROADCAST_MIRROR_CONFIG', SmartMirror.getConfig());
	}
};