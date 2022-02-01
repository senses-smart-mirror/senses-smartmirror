import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const SpeechConfig: IWidgetConfig = {
	name: 'speech',
	icon: 'fad fa-microphone-alt',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Speech",
		order: 1,
		type: 'text',
		description: "Shows which commands you can say to control the mirror."
	}, {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "What Can I Say",
		description: "The header title of the widget."
	}, {
		name: "showInBottom",
		label: "Show Widget in Bottom of Mirror",
		type: 'bool',
		value: true,
		description: "Show the widget in a special design only at the bottom of the grid."
	}]
}

module.exports = SpeechConfig;