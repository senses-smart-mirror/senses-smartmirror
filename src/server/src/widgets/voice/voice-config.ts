import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const VoiceConfig: IWidgetConfig = {
	name: 'voice',
	icon: 'fad fa-signal',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Voice Bars",
		order: 1,
		type: 'text',
		description: "This widget doesn't show on default. It will <i>only</i> be shown if you use voice functionality."
	}]
}

module.exports = VoiceConfig;