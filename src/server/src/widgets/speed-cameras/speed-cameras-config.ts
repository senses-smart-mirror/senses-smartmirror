import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const SpeedCamerasConfig: IWidgetConfig = {
  name: "speed-cameras",
  icon: "fad fa-camera",
  speech: "speed cameras, speed, cameras",
  helper: true,
  settings: [
    {
      name: "header",
      label: "Widget Title",
      type: "input",
      value: "Speed cameras",
      description: "The header title of the widget.",
    },
    {
      name: "description",
      label: "Show or Hide ",
      type: "bool",
      value: true,
      description: "Show or hide description.",
    },
    {
      name: "interval",
      label: "Interval",
      type: "input",
      value: 50000,
      description:
        "Specify the interval between polling the events (In <strong>milliseconds</strong>).",
    },
    {
      name: "filter",
      label: "Roads",
      type: "input",
      value: "",
      description:
        "Specify a comma separated list with roads you want to show. <em>Example: (A1, A4, A13)</em>",
    },
    {
      name: "pushNotification",
      label: "Display Notification",
      type: "bool",
      value: true,
      description: "Display a notification if there is speed camera on the roads you have specified."
    },
    {
      name: "conditional_show",
      label: "Conditional show based on items",
      type: "bool",
      value: false,
      defaultValue: false,
      description:
        "Enable this to show the component if there is data to show. Otherwise it will hide the component.",
    },
  ],
};

module.exports = SpeedCamerasConfig;