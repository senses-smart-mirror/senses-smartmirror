export default (SmartMirror: any) => {	
	return (widget: {id: string}) => {
		SmartMirror.removeCustomWidget(widget);
	}
};