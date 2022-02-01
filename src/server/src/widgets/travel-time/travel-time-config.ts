import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const TravelTimeConfig: IWidgetConfig = {
  name: "travel-time",
  icon: "fad fa-route",
  helper: true,
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "This widget requires a valid Google Directions API Key."
  },
  {
    name: "defaultUrl",
    hide: true,
    type: 'input',
    description: 'default url',
    label: "URL",
    value: "https://maps.googleapis.com/maps/api/directions/json"
  },
  {
    name: "apiKey",
    type: "input",
    label: "API Key",
    value: "",
    defaultValue: "",
    description: "Specify the API key obtained from Google."
  },
  {
    name: "header",
    label: "Widget Title",
    type: "input",
    value: "Commute",
    description: "The header title of the widget."
  },
  {
    name: "routes",
    type: "multivalue",
    label: "Routes",
    value: [],
    buttonLabel: "Add route",
    items: [{
      name: "name",
      placeholder: "Route name",
      label: "Route Name"
    },{
      name: "from",
      placeholder: "From",
      label: "From"
    }, {
      name: "to",
      placeholder: "To",
      label: "To"
    }],
    listLabel: "Current routes",
    description:
      "For this component you can specify multiple routes. Specify the 'from' address and the 'to' address."
  },
  {
    name: "showNotification",
    label: "Display notification",
    type: "bool",
    value: true,
    description: "Display a notification in the notifications widget if the duration of the travel is longer than usual."
  },
  {
    name: "interval",
    type: "input",
    label: "Interval",
    validation: { min: 30000, max: 200000 },
    value: 50000,
    defaultValue: 50000,
    description:
      "Specify the interval between polling for travel time (In <strong>milliseconds</strong>). <em>A low interval could have influence on the API Rate limit.</em>"
  }
  ]
};

module.exports = TravelTimeConfig;