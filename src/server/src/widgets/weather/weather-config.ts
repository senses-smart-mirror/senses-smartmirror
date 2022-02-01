import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const WeatherConfig: IWidgetConfig = {
	name: 'weather',
	icon: 'fad fa-sun-cloud',
	speech: 'weather, weather widget',
	settings: [{
		name: "header",
		label: "Title",
		type: "input",
		defaultValue: "",
		description: "Widget title, by default this one is empty."
	}, {
		name: "defaultUrl",
		label: 'Default Url',
		type: 'input',
		defaultValue: 'http://api.openweathermap.org/data/2.5/weather',
		description: "API url. Including http://"
	}, {
		name: "cityId",
		label: 'City ID',
		type: 'input',
		defaultValue: 'Amsterdam',
		description: "Id of the city."
	}, {
		name: "apiKey",
		label: 'Api Key',
		type: 'input',
		defaultValue: '',
		description: "API key"
	}, {
		name: "units",
		label: 'Units',
		type: 'dropdown',
		defaultValue: 'metric',
		options: [{
			name: "Metric",
			value: "metric"
		}, {
			name: "Imperial",
			value: "imperial"
		}],
		description: "Choose units. You can choose between metric or imperial."
	}, {
		name: "lang",
		label: 'Language',
		type: 'input',
		defaultValue: 'en',
		description: "Choose your language. View possibilities here: https://openweathermap.org/current#multi"
	}, {
		name: "showDescription",
		label: 'Show Description',
		type: 'bool',
		defaultValue: true,
		description: "Enable or disable weather description."
	}, {
		name: "showLocation",
		label: 'Show Location',
		type: 'bool',
		defaultValue: true,
		description: "Enable or disable location."
	}, {
		name: "showWindInformation",
		label: 'Show Wind information',
		type: 'bool',
		defaultValue: true,
		description: "Enable or disable wind information."
	}, {
		name: "interval",
		label: 'Interval',
		type: 'input',
		defaultValue: '600000',
		description: 'Interval to poll weather data in miliseconds. Default is set to 10 minutes.'
	}]
}

module.exports = WeatherConfig;