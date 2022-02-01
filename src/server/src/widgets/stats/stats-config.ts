import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const StatsConfig: IWidgetConfig = {
	"name": "stats",
	"icon": "fad fa-server",
	"helper": true,
	"speech": "stats",
	"settings": [{
		"name": "interval",
		"label": "Interval",
		"type": 'input',
		"value": 100000,
		"description": "Specify the interval between polling the stats (In <strong>milliseconds</strong>)."
	},{
		"name": "header",
		"label": "Header Title",
		"value": "Stats for nerds",
		"type": 'input',
		"description": "The header title of the widget."
	}, {
		"name": "showNotification",
		"label": "Show Temp. Notification",
		"value": false,
		"type": "bool",
		"description": "Show notification if temperature goes above 60&#8451;."
	}]
}

module.exports = StatsConfig;