export default (SmartMirror: any) => {	
	return (data: Object) => {
		SmartMirror
			.saveModuleSsettings(data)
			.saveConfig().then(() => {
				SmartMirror.io.emit('BROADCAST_MIRROR_CONFIG', SmartMirror.getConfig());
				SmartMirror.io.emit('UPDATE_MODULE_SAVE_SETTINGS', {status: 'success'});
			});
	}
};