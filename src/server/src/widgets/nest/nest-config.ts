import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const NestConfig: IWidgetConfig = {
  name: "nest",
  icon: "fad fa-thermometer-half",
  helper: true,
  speech: "nest, events",
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "This widget requires Google Account to be connected. You need to create a project on <a class='link' target='_blank' href='https://console.nest.google.com/'>Google Nest Console</a> first. After that you fill in the Client ID and the Client Secret. When those are setup you can authenticate with the button below."
  }, {
    name: "none",
    displayOnly: true,
    label: "",
    order: 2,
    type: 'button',
    value: "Connect Google",
    defaultValue: "Connect Google",
    link: "nest/login",
    description: ""
  }, {
    name: "clientId",
    label: "Client ID",
    type: 'input',
    value: "",
    description: "Paste client id. You can create this ID at the Google Developer Console."
  }, {
    name: "clientSecret",
    label: "Client Secret",
    type: 'input',
    value: "",
    description: "Paste client secret. You can create this secret at the Google Developer Console."
  }, {
    name: "projectId",
    label: "Project ID",
    type: 'input',
    value: "",
    description: "Paste your project id. You can create this ID at the Google Developer Console."
  }, {
    name: "accessToken",
    disabled: true,
    scramble: true,
    label: "Access Token",
    type: 'input',
    value: "",
    description: "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Google"
  }, {
    name: "refreshToken",
    disabled: true,
    scramble: true,
    label: "Refresh Token",
    type: 'input',
    value: "",
    description: "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Google"
  }, {
    name: "header",
    label: "Widget Title",
    type: 'input',
    value: "Nest",
    description: "The header title of the widget."
  }, {
    name: "interval",
    label: "Interval",
    type: 'input',
    value: 500000,
    description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
  }]
}

module.exports = NestConfig;
