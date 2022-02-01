import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const ComplimentsConfig: IWidgetConfig = {
	name: 'compliments',
	icon: 'fad fa-comments',
	speech: 'compliments',
	settings: [{
		name: "interval",
		label: 'Interval',
		type: 'input',
		defaultValue: '600000',
		description: 'Interval to show different compliments in miliseconds. Default is set to 10 minutes.'
	}, {
		name: "texts",
		label: "Compliments",
		type: "multiadd",
		placeholder: "Compliment",
		value: [
			"Looking sharp today",
			"Well done!",
			"Have a goodday!",
			"Looks like its working..",
			"You are the most perfect you there is",
			"You've got all the right moves!",
			"You're more helpful than you realize.",
			"Your kindness is a balm to all who encounter it. Please do it!",
			"Today is a lovely day!",
			"Your smile is contagious",
			"You have impeccable manners",
			"You're always learning new things and trying to better yourself. That's awesome",
			"When you make a mistake, you fix it",
			"Everyone gets knocked down sometimes; only people like you get back up again and keep going",
			"You should be proud of yourself",
			"Never stop being you!"
		],
		description: "Add or remove compliments."
	}]
}

module.exports = ComplimentsConfig;