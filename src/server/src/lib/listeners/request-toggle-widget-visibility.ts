
interface IWidgetData {
  name: string;
  type: string;
}

export default (SmartMirror: any) => {
	return (data: IWidgetData) => {
		SmartMirror.toggleWidgetVisibility(data);
	}
};