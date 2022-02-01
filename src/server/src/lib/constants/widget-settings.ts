import { ISetting } from "../types/Setting";

export const DEFAULT_SETTINGS:ISetting[] = [
  {
    name: "show",
    label: "Show Widget",
    type: "bool",
    value: true,
    defaultValue: true,
    description:
      "Switching off this setting will hide the widget on the grid.",
  },
  {
    name: "show_icon_in_header",
    label: "Show Icon in Header Title",
    type: "bool",
    value: false,
    defaultValue: false,
    description:
      "Enable or disable to display the icon in the header title.",
  },
  {
    name: "time_show",
    label: "Show Widget Based on Time",
    type: "input",
    value: '',
    defaultValue: '',
    description:
      "Specify the time in which the widget should show. Format: <strong>07:10-15:50</strong>",
  },
  {
    name: "widget_width",
    label: "Widget Width",
    type: "slider",
    defaultValue: 300,
    value: 300,
    max: 500,
    min: 50,
    description:
      "Specify the width <strong>in pixels</strong> of the widget.",
  },
  {
    name: "widget_design",
    label: "Widget Design",
    type: "dropdown",
    defaultValue: "default",
    value: "default",
    description: "Switch the design of the widget.",
    options: [
      {
        name: "Default Design",
        value: "default",
      },
      {
        name: "Box Design",
        value: "box-design",
      },
      {
        name: "Blob Design",
        value: "blob-design",
      },
      {
        name: "Minimal Design",
        value: "minimal-design",
      },
      {
        name: "Clean Title Design",
        value: "clean-design",
      },
      {
        name: "Clean Box with Border",
        value: "clean-border-box",
      },
      {
        name: "Clean Box with Dashed Border",
        value: "clean-border-box-dashed",
      },
      {
        name: "White Background Box",
        value: "background-box",
      }
    ],
  },
];
