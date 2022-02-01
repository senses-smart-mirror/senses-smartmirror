import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const CalendarConfig: IWidgetConfig = {
	name: "calendar",
	icon: "fad fa-calendar-alt",
	helper: true,
	speech: "calendar, events",
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "This widget requires Google Account to be connected. You need to create a project on <a class='link' target='_blank' href='https://console.cloud.google.com'>Google Console</a> first. After that you fill in the Client ID and the Client Secret. When those are set up you can authenticate with the button below."
	}, {
		name: "none",
		displayOnly: true,
		label: "",
		order: 2,
		type: 'button',
		value: "Connect Google",
		defaultValue: "Connect Google",
		link: "google/login",
		description: ""
	}, {
		name: "clientId",
		label: "Client ID",
		type: 'input',
		value: "",
		description: "Paste client id. You can create this ID at the Google Developer Console."
	}, {
		name: "clientSecret",
		label: "Client Secret",
		type: 'input',
		value: "",
		description: "Paste client secret. You can create this secret at the Google Developer Console."
	}, {
		name: "accessToken",
		disabled: true,
		scramble: true,
		label: "Access Token",
		type: 'input',
		value: "",
		description: "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Google"
	}, {
		name: "refreshToken",
		disabled: true,
		scramble: true,
		label: "Refresh Token",
		type: 'input',
		value: "",
		description: "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Google"
	}, {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Appointments",
		description: "The header title of the widget."
	}, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 500000,
		description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
	}, {
		name: "showIcon",
		label: "Icons",
		type: 'bool',
		value: false,
		description: "Show or hide icons."
	}, {
		name: "dailyOnly",
		label: "Show today's appointments only",
		type: 'bool',
		value: true,
		description: "Show today's appointments only"
	}, {
		name: "showStartTime",
		label: "Start time",
		type: 'bool',
		value: true,
		description: "Show or hide start time."
	}, {
		name: "showFromNow",
		label: "From now",
		type: 'bool',
		value: false,
		description: "Show or hide from now."
	}, {
		name: "amount",
		label: "Amount",
		type: 'input',
		value: 5,
		description: "Amount of results to be displayed."
	},
	{
		name: "conditional_show",
		label: "Conditional show based on items",
		type: "bool",
		value: false,
		defaultValue: false,
		description: "Enable this to show the component if there is data to show. Otherwise it will hide the component."
	}]
}

module.exports = CalendarConfig;