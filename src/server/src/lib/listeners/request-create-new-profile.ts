
export default (SmartMirror: any) => {
	return (profileName: string) => {
		SmartMirror.createNewProfile(profileName);
	}
};