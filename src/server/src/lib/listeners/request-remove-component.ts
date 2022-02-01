import { IWidgetData } from "../types/WidgetData";

export default (SmartMirror: any) => {	
	return async (id: string) => {
		const widget:IWidgetData = SmartMirror.removeWidgetById(id);
		SmartMirror.stopAndRemoveWidget(widget);

		await SmartMirror.saveProfile();
		
		SmartMirror.saveConfig().then(() => {
			SmartMirror.io.emit('BROADCAST_MIRROR_CONFIG', SmartMirror.getConfig());
			SmartMirror.io.emit('UPDATE_COMPONENT_READY', {status: 'delete_success'});
		});
	}
};