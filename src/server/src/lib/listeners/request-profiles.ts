
export default (SmartMirror: any) => {
	return () => {
		SmartMirror.requestProfiles();
	}
};