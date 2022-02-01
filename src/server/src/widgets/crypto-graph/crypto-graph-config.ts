import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const CryptoListConfig: IWidgetConfig = {
	"name": "crypto-graph",
	"icon": "fad fa-chart-area",
	"helper": true,
	"speech": 'crypto, bitcoin, money',
	"settings": [
		{
			name: "header",
			label: "Widget Title",
			type: 'input',
			value: "Crypto Graph",
			description: "The header title of the widget."
		},
		{
			name: "animateGraph",
			label: "Animate Graph",
			type: 'bool',
			value: false,
			description: "Animates the graph if using the widget in the <strong>animator</strong>."
		},
		{
			name: "currencies",
			label: "Currencies",
			type: 'input',
			value: "BTC,ETH,XRP,DASH,LTC",
			description: "Specify the currencies, you can split currencies with a comma. Example: <strong>BTC, ETH, XRP, DASH, LTC</strong>"
		},
		{
			name: "conversion",
			label: "Conversion",
			type: "dropdown",
			options: [
				{
					name: "EUR",
					value: "EUR"
				},
				{
					name: "USD",
					value: "USD"
				},	{
					name: "GBP",
					value: "GBP"
				},
				{
					name: "JPY",
					value: "JPY"
				},
			],
			value: "EUR",
			description: "Choose conversion."
		},
		{
			name: "dataType",
			label: "Type of data",
			type: 'dropdown',
			options: [
				{
					name: "Daily",
					value: "day"
				},
				{
					name: "Hourly",
					value: "hour"
				},
				{
					name: "Minute",
					value: "minute"
				},
			],
			value: 'day',
			description: "Specify the timespan by select one of the options."
		},
		{
			name: "limit",
			label: "Amount of items to display",
			type: 'slider',
			min: 5, 
			max: 50,
			value: 10,
			description: "Choose the amount of items to be displayed in the chart (represents the x-as)."
		}, {
			name: "interval",
			label: "Interval",
			type: 'input',
			value: 10000,
			description: "Specify the interval between polling new data (In <strong>milliseconds</strong>)."
		},
	]
}

module.exports = CryptoListConfig;