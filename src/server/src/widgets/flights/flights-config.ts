import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const FlightsConfig: IWidgetConfig = {
  "name": "flights",
  "icon": "fad fa-plane",
  "helper": true,
  "speech": "flight, flights",
  "settings": [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: 'This widget will show departure / arrival data from Schiphol Amsterdam Airport in The Netherlands. <br /></br >You will need to create an account at <strong>Schiphol Developer Center</strong> and provide the API Key here in the settings. <a href="https://developer.schiphol.nl/" target="_blank">Schiphol Developer Center</a>'
  }, {
    name: "header",
    label: "Header Title",
    value: "Flights",
    type: 'input',
    description: "The header title of the widget."
  }, {
    name: "appId",
    type: "input",
    label: "App Id (Application ID)",
    value: "",
    defaultValue: "",
    description: "Specify the application ID from the Schiphol API."
  }, {
    name: "apiKey",
    type: "input",
    label: "API Key (Subscription key)",
    value: "",
    defaultValue: "",
    description: "Specify the API key obtained from the Schiphol API."
  }, {
    name: "filter_flight",
    type: "input",
    label: "Show specific flight",
    value: "",
    defaultValue: "",
    description: "Show only 1 specific flight based on flight number."
  }, {
    name: "showArrivals",
    label: "Show arrivals",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show the airport arrivals"
  }, {
    name: "showDepartures",
    label: "Show Departures",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show the airport departures"
  }, {
    name: "show_location",
    label: "Show Destination or Source",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the destination for outgoing flights or the source from incoming flights."
  }, {
    name: "show_codeshare",
    label: "Show Flights Codeshares",
    type: "bool",
    defaultValue: false,
    value: true,
    description: "Show or hide the codeshare for flights that share codes with other flights."
  }, {
    name: "show_airline",
    label: "Show Flights Airline",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the airline."
  }, {
    name: "interval",
    label: "Interval",
    type: 'input',
    value: 100000,
    validation: { min: 30000, max: 200000 },
    description: "Specify the interval between polling the Schiphol Flight data (In <strong>milliseconds</strong>)."
  }, {
    name: "limit",
    label: "Limit",
    type: 'input',
    value: 10,
    validation: { min: 1, max: 30 },
    description: "Specify the amount of items to be displayed. <em>Please note that the limit could be influenced by flights that share the same flight code (Codeshare).</em>"
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

module.exports = FlightsConfig;
