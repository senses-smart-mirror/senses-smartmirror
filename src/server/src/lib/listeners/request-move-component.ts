export default (SmartMirror: any) => {
	return async (data: object) => {
		SmartMirror.moveWidget(data)

		await SmartMirror.saveProfile();
	
		SmartMirror.saveConfig()
			.then(() => {
				SmartMirror.io.emit('BROADCAST_MIRROR_CONFIG', SmartMirror.getConfig());
			});
	}
};