import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const TrainsConfig: IWidgetConfig = {
  "name": "trains",
  "icon": "fad fa-train",
  "helper": true,
  "speech": "train, trains",
  "settings": [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: 'You will need a valid NS Api (Subscription key) in order to use this widget. You can request your key here: <a target="_blank" href="https://apiportal.ns.nl"/>https://apiportal.ns.nl/</a>'
  }, {
    name: "header",
    label: "Header Title",
    value: "Trains",
    type: 'input',
    description: "The header title of the widget."
  }, {
    name: "apiKey",
    type: "input",
    label: "API Key (Subscription key)",
    value: "",
    defaultValue: "",
    description: "Specify the API key obtained from the NS Api."
  }, {
    name: "stationName",
    label: "Station Name",
    type: 'dropdown_search',
    value: '',
    placeholder: 'Search the name of the station',
    options: [],
    optionsProperty: ["namen", "lang"],
    socketInfo: { emitter: "REQUEST_TRAINS_STATIONS", subscribe: "BROADCAST_TRAINS_STATIONS" },
    dependsOn: 'apiKey',
    description: "Search for the name of the station. Please provide a API key first."
  }, {
    name: "showArrivals",
    label: "Show arrivals",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show the station arrivals"
  }, {
    name: "showDepartures",
    label: "Show Departures",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show the station departures"
  }, {
    name: "showDisruptions",
    label: "Show Disruptions",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show any disruptions for the specified station."
  }, {
    name: "arrivalsLimit",
    label: "Arrivals Limit",
    type: "slider",
    min: 1,
    max: 20,
    defaultValue: 5,
    value: 5,
    description: "Specify the amount of arrivals you want to display."
  }, {
    name: "departuresLimit",
    label: "Departures Limit",
    type: "slider",
    min: 1,
    max: 20,
    defaultValue: 5,
    value: 5,
    description: "Specify the amount of departures you want to display."
  }, {
    name: "stationFilter",
    label: "Station filter for departures direction",
    type: "input",
    description: "Specify a station name to filter out departures for this direction."
  }, {
    name: "interval",
    label: "Interval",
    type: 'input',
    value: 100000,
    validation: { min: 30000, max: 200000 },
    description: "Specify the interval between polling the NS Train data (In <strong>milliseconds</strong>)."
  },
  {
    name: "showIcons",
    label: "Show icons",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show icons in the lists"
  }]
}

module.exports = TrainsConfig;