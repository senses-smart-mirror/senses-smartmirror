import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const InternetConnectionConfig: IWidgetConfig = {
  name: "internet-connection",
  icon: "fad fa-router",
  helper: true,
  speech: "internet connection, internet, connection",
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "This widget will display the current internet connection."
  },
  {
    name: "header",
    label: "Widget Title",
    type: "input",
    value: "Internet Connection",
    description: "The header title of the widget."
  },
  {
    name: "showQr",
    label: "Show QR Code",
    type: "bool",
    value: true,
    description: "Enable this if you want to display the QR code."
  },
  {
    name: "ssid",
    label: "Network SSID",
    type: "input",
    value: "",
    description: "Specify the network SSID. <em>Please note; if you don't specify this SSID the QR code will be made from the current connection (automatically)</em>"
  },
  {
    name: "password",
    label: "Password",
    type: "input",
    value: "",
    description: "Specify the password for the internet access point"
  },
  {
    name: "background",
    label: "Inverse background",
    type: "bool",
    value: false,
    description: "By defaul the QR code will have a dark background. Enable this option to not display the dark background."
  }
  ]
};

module.exports = InternetConnectionConfig;
