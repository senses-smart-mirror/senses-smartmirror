import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const ClockConfig: IWidgetConfig = {
  name: "clock",
  icon: "fad fa-clock",
  speech: "clock, clock widget",
  settings: [
    {
      name: "header",
      label: "Title",
      type: "input",
      defaultValue: "",
      description: "Widget title, by default this one is empty."
    },
    {
      name: "location",
      label: "City name",
      type: "input",
      value: "Amsterdam",
      description: "Specify the city."
    },
    {
      name: "timezone",
      label: "Timezone",
      type: "input",
      value: "Europe/Amsterdam",
      description: "Specify the timezone. Example: Europe/Amsterdam"
    },
    {
      name: "showAMPM",
      label: "AM/PM",
      type: "bool",
      value: false,
			description: "Show or hide AM/PM."
    },
    {
      name: "showLocation",
      label: "Location",
      type: "bool",
      value: true,
      defaultValue: true,
			description: "Show or hide the location."
    },
    {
      name: "showDate",
      label: "Date",
      type: "bool",
      value: true,
      defaultValue: true,
			description: "Show or hide the day and date."
		}
  ]
};

module.exports = ClockConfig;
