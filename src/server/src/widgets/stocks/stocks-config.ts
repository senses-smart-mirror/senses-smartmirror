import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const StocksConfig: IWidgetConfig = {
	"name": "stocks",
	"icon": "fad fa-chart-line",
	"helper": true,
	"speech": 'stocks',
	"settings": [
		{
			name: "header",
			label: "Widget Title",
			type: 'input',
			value: "Stocks",
			description: "The header title of the widget."
		},
    {
			name: "symbols",
			label: "Symbols",
			type: 'input',
			value: "IBM,AAPL",
			description: "Specify the symbols, you can split symbols with a comma. Example: <strong>IBM,AAPL</strong>"
		},
    {
			name: "api_key",
			label: "Api Key",
			type: 'input',
			description: "Specify the Api Key. You can create an Api Key on the <strong>Finnhub</strong> website. <a target='_blank' href='https://finnhub.io/dashboard'>Finnhub Dashboard</a>"
		},
		{
			name: "interval",
			label: "Interval",
			type: 'input',
			value: 30000,
      validation: { min: 30000, max: 9999999 },
			description: "Specify the interval between polling new data (In <strong>milliseconds</strong>)."
		},
	]
}

module.exports = StocksConfig;