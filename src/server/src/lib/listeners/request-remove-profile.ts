export default (SmartMirror: any) => {
	return (data: string) => {
		SmartMirror.requestRemoveProfile(data);
	}
};