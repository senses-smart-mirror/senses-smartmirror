import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const VersionViewerConfig: IWidgetConfig = {
	name: 'version-viewer',
	icon: 'fad fa-user-cog',
	helper: true,
	speech: 'version, viewer, version viewer',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "This widget will display the current installed version. And will show if there is an update available."
	}, {
		name: "header",
		label: "Header Title",
		value: "Version Viewer",
		type: 'input',
		description: "The header title of the widget."
	}, {
		name: "conditional_show",
		label: "Conditional Show",
		type: "bool",
		value: false,
		defaultValue: false,
		description: "Enable this to show the version viewer only when there is an update available."
	}, {
		name: "push_notification",
		label: "Display notification",
		type: "bool",
		value: true,
		defaultValue: true,
		description: "Enable this setting to display a notification in the notification widget when there is a new version available."
	}]
}

module.exports = VersionViewerConfig;