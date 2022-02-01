import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const HueConfig: IWidgetConfig = {
	"name": "hue",
	"icon": "fad fa-lamp",
	"helper": true,
	"speech": 'lights, light, hue, the lights',
	"settings": [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "This widget requires your HUE to be connected!. After adding this widget the Mirror will try to access your local HUE bridge. Please <strong>save</strong> the widget first and then press the button on the HUE Bridge. After opening the widget settings again, you will see the bridge IP and user ID are provided."
	}, {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Rooms lights",
		description: "The header title of the widget."
	}, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 50000,
		description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
	}, {
		name: "bridgeIp",
		label: "Bridge IP address",
		type: 'input',
		disabled: true,
		value: "",
		description: "Specify the Phillips HUE bridgeIp."
	}, {
		name: "userId",
		label: "User ID",
		type: 'input',
    disabled: true,
		value: "",
		description: "Your Phillips HUE User ID."
	}]
}

module.exports = HueConfig;
