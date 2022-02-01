export default (SmartMirror: any) => {
	return (data: string) => {
		SmartMirror.io.emit('BROADCAST_TOGGLE_MODULE', SmartMirror.toggleModule(data));
	}
};