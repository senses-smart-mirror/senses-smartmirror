import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const TextClockConfig: IWidgetConfig = {
  name: "text-clock",
  icon: "fad fa-clock",
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
      name: "fontsize",
      label: "Font size",
      type: "input",
      value: "16",
      description: "Specify the size of the font."
    },
    {
      name: "width",
      label: "Width of the clock",
      type: "input",
      value: "300",
      description: "Specify the width of the clock. This works in combination with the font size."
    },
  ]
};

module.exports = TextClockConfig;