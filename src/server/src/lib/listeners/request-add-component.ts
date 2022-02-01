export default (SmartMirror: any) => {
	return (position: string, component: object) => {
		SmartMirror.addWidgetToGrid(position, component);
	}
};