export default (SmartMirror: any) => {	
	return (data: Object) => {
		SmartMirror.io.emit('BROADCAST_COMPONENT_MODEL', SmartMirror.getWidgetModel(data));
	}
};