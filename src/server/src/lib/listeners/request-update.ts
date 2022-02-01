export default (SmartMirror: any) => {
	return () => {
		SmartMirror.requestUpdate();
	}
};