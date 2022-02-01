import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const NotificationConfig: IWidgetConfig = {
	name: 'notifications',
	icon: 'fad fa-bells',
	helper: true,
	speech: 'notifications, notification, clear notifications',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "The notifications widget will show any notification from other widgets."
	},  {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Notifications",
		description: "The header title of the widget."
	}, {
		name: "reset",
		label: "Clear Notifications",
		type: 'button_post',
		value: "Clear Notifications",
		defaultValue: "Clear Notifications",
		link: "notifications/clear",
		description: "Click this to reset the notifications in the widget."
	}, {
		name: "show_one",
		label: "Show one notification",
		value: true,
		type: 'bool',
		description: "Choose between to show only one notification or show more notifications if there are more than one."
	},
	{
		name: "conditional_show",
		label: "Conditional Show",
		type: "bool",
		value: false,
		defaultValue: false,
		description: "Enable this to show the component if there are notifications to show. Otherwise it will hide the component."
	}]
}

module.exports = NotificationConfig;