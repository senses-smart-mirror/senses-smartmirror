export default (SmartMirror: any) => {
	return (data: any) => {
		SmartMirror.io.emit('PUSH_DATA', data);
	}
};