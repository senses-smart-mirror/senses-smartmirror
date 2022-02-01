import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const RainRadarConfig: IWidgetConfig = {
	"name": "rain-radar",
	"icon": "fad fa-raindrops",
	"helper": true,
	"speech": 'rain, radar',
	"settings": [
		{
			name: "header",
			label: "Widget Title",
			type: 'input',
			value: "Rain Forecast",
			description: "The header title of the widget."
		},
		{
			name: "lat_long",
			label: "Latitude and Longitude",
			type: 'input',
			defaultValue: "52.3545828,4.7638781",
			placeholder: "52.3545828,4.7638781",
			description: "Provide the latitude and longitude for the city your are in. <em>You can seperate the lat and long by a comma.</em>"
		},
		{
      name: "pushNotification",
      label: "Display Notification",
      type: "bool",
      value: true,
      description: "Display a notification when it is raining or rain is expected in the next 30 minutes."
    },
		{
			name: "conditionalShow",
			label: "Conditional show",
			type: "bool",
			value: false,
			defaultValue: false,
			description: "Enable this to only show the Rain forecast widget is there is rain expected or it is currently raining."
		}, 
		{
			name: "interval",
			label: "Interval",
			type: 'input',
			value: 60000,
			description: "Specify the interval between polling the latest news items (In <strong>milliseconds</strong>)."
		},
	]
}

module.exports = RainRadarConfig;