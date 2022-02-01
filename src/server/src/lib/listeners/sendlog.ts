export default (SmartMirror: any) => {
	return (data: string) => {
		SmartMirror.sendLog(data);
	}
};