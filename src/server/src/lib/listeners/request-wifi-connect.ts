import IConnectData from "../types/Endpoint";

export default (SmartMirror: any) => {
	return (data: IConnectData) => {
		SmartMirror.requestWifiConnect(data);
	}
};