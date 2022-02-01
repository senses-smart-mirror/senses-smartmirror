
export default (SmartMirror: any) => {
	return (profile: string): void => {
		SmartMirror.requestSaveProfile(profile);
	}
};