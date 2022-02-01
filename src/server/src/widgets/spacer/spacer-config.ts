import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const SpacerConfig: IWidgetConfig = {
	name: 'spacer',
	icon: 'fad fa-grip-lines',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "The spacer widget is a widget to give you the flexibility the put some blank space around widgets."
	}, {
		name: "spacing",
		label: 'Spacing',
		type: 'slider',
		min: 1,
		max: 1000,
		defaultValue: '20',
		description: 'Specify the amount of spacing in <strong>pixels</strong>'
	}]
}

module.exports = SpacerConfig;