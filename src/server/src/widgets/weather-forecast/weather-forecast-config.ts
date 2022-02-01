import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const WeatherForecastConfig: IWidgetConfig = {
  name: "weather-forecast",
  icon: "fad fa-sun",
  speech: "weather forecast, forecast",
  settings: [
    {
      name: "header",
      label: "Title",
      type: "input",
      value: "Weather Forecast",
      description: "Widget title."
    },
    {
      name: "defaultUrl",
      label: "Default Url",
      type: "input",
      defaultValue: "http://api.openweathermap.org/data/2.5/forecast",
      description: "API url. Including http://"
    },
    {
      name: "cityId",
      label: "City ID",
      type: "input",
      defaultValue: "Amsterdam",
      description: "Id of the city."
    },
    {
      name: "apiKey",
      label: "Api Key",
      type: "input",
      defaultValue: "",
      description: "API key"
    },
    {
      name: "units",
      label: "Units",
      type: "dropdown",
      defaultValue: "metric",
      options: [
        {
          name: "Metric",
          value: "metric"
        },
        {
          name: "Imperial",
          value: "imperial"
        }
      ],
      description: "Choose units. You can choose between metric or imperial."
    },
    {
      name: "showGraph",
      label: "Show Graph",
      type: "bool",
      value: true,
      defaultValue: true,
      description: "Enable or disable graph"
    },
    {
      name: "showAnimation",
      label: "Show Animation",
      type: "bool",
      defaultValue: true,
      description: "Enable or disable animation. This option must be enabled if you use this widget in the animator!"
    },
    {
      name: "lang",
      label: "Language",
      type: "input",
      defaultValue: "en",
      description:
        "Choose your language. View possibilities here: <a href=\"https://openweathermap.org/current#multi\">https://openweathermap.org/current#multi</a>"
    },
    {
      name: "interval",
      label: "Interval",
      type: "input",
      defaultValue: "600000",
      description:
        "Interval to poll weather data in miliseconds. Default is set to 10 minutes."
    }
  ]
};

module.exports = WeatherForecastConfig;