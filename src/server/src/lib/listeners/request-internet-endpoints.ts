export default (SmartMirror: any) => {
	return () => {
		SmartMirror.getInternetEndpoints();
	}
};