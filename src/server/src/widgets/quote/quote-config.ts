import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const QuoteConfig: IWidgetConfig = {
	"name": "quote",
	"icon": "fad fa-quote-right",
	"speech": "quote",
	"settings": [{
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Quote of the day!",
		description: "The header title of the widget."
	}, {
		name: "single",
		label: "Single Quote",
		type: 'bool',
		value: false,
		description: "Show one quote only without header. Will still use animation."
	},
	{
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 20000,
		description: "Specify the interval to animate to the next quote (In <strong>milliseconds</strong>)."
	}]	
}

module.exports = QuoteConfig;