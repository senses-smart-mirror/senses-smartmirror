
export default (SmartMirror: any) => {
	return (profile: string) => {
		SmartMirror.switchProfile(profile);
	}
};