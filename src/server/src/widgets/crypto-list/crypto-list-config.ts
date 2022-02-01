import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const CryptoListConfig: IWidgetConfig = {
	"name": "crypto-list",
	"icon": "fad fa-dollar-sign",
	"helper": true,
	"speech": 'crypto, bitcoin, money',
	"settings": [
		{
			name: "header",
			label: "Widget Title",
			type: 'input',
			value: "Crypto List",
			description: "The header title of the widget."
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
				}, {
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
			name: "show_precentage",
			label: "Show Precentage",
			type: 'bool',
			value: true,
			description: "Show or hide the 24 hour precentage change."
		}, 
		{
			name: "interval",
			label: "Interval",
			type: 'input',
			value: 10000,
			description: "Specify the interval between polling new data (In <strong>milliseconds</strong>)."
		},
	]
}

module.exports = CryptoListConfig;