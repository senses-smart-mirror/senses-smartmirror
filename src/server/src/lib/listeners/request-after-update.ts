
export default (SmartMirror: any) => {
	return () => {
		SmartMirror.requestAfterUpdate();
	}
};