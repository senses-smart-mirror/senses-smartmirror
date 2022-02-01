import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const MercedesMeConfig: IWidgetConfig = {
	"name": "mercedes",
	"icon": "fad fa-car",
	"helper": true,
	"speech": 'mercedes, car information, car details',
	"settings": [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: "text",
		description:
			"This widget requires Mercedes Developer Account to be connected. Click on the button below to connect with your Mercedes Me account. The page will ask you to authorize the Smart Mirror to retreive your vehicle data. <em>Please note: The Mercedes API doesn't always provide data! In that case you can try to start your car and wait a bit.</em>",
	}, {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Mercedes",
		description: "The header title of the widget."
	}, {
		name: "none",
		displayOnly: true,
		label: "",
		order: 2,
		type: "button",
		value: "Connect Mercedes API",
		defaultValue: "Connect Mercedes API",
		link: "mercedes/login",
    description: ""
	},
	{
		name: "clientId",
		label: "Client ID",
		type: "input",
		value: "",
		description:
			"Paste client id. You can create this ID at the Mercedes Developer Console.",
	},
	{
		name: "clientSecret",
		label: "Client Secret",
		type: "input",
		value: "",
		description:
			"Paste client secret. You can create this secret at the Mercedes Console.",
	}, {
		name: "vehicle_id",
		label: "Vehicle ID (VIN)",
		type: "input",
		value: "",
		description:
			"Provide the Vehicle ID (VIN).",
	}, {
		name: "accessToken",
		disabled: true,
		scramble: true,
		label: "Access Token",
		type: "input",
		value: "",
		description:
			"You <strong>cannot</strong> edit this setting as it is set automatically when you login with Mercedes API.",
	}, {
		name: "refreshToken",
		disabled: true,
		scramble: true,
		label: "Refresh Token",
		type: 'input',
		value: "",
		description: "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Mercedes API."
	}, {
		name: "showHeading",
		label: "Show car heading",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show the heading (direction in which the car is parked)."
	}, {
		name: "showMileage",
		label: "Show Mileage",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show the mileage."
	}, {
		name: "showCarIsLocked",
		label: "Show Car is locked",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show if the car is fully locked"
	},
	{
		name: "showRooftopClosed",
		label: "Show rooftop locked",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show if the rooftop of the car is locked"
	},
	{
		name: "showGasIntakeClosed",
		label: "Show gas intake locked",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show if the gas intake of the car is locked"
	}, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 600000,
		description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
	}]
}

module.exports = MercedesMeConfig;
