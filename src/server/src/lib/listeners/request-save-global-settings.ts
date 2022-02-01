export default (SmartMirror: any) => {	
	return (data: Object) => {
		SmartMirror
			.saveGlobalSettings(data)
			.saveConfig().then(() => {
				SmartMirror.io.emit('BROADCAST_MIRROR_CONFIG', SmartMirror.getConfig());
				SmartMirror.io.emit('UPDATE_SAVE_SETTINGS', {status: 'success'});
			});
	}
};