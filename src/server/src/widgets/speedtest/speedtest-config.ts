import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const SpeedtestConfig: IWidgetConfig = {
  name: 'speedtest',
  icon: 'fad fa-tachometer-alt-fastest',
  helper: true,
  speech: 'speedtest, internet speed',
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "The Speedtest widget will verify the internet speed."
  }, {
    displayOnly: true,
		name: "trigger",
		label: "Trigger New Test",
		type: 'button_post',
		value: "Trigger Test",
		defaultValue: "Trigger Test",
		link: "speedtest/trigger",
		description: "Click this to manually trigger a internet speedtest."
	}, {
    name: "header",
    label: "Widget Title",
    type: "input",
    value: "Speedtest",
    description: "The header title of the widget."
  }, {
    name: 'showLocation',
    label: 'Show Target Location',
    type: 'bool',
    value: true,
    description: 'Show or hide target name & location.'
  }, {
    name: "interval",
    label: "Interval",
    type: 'input',
    value: 60000,
    validation: { min: 60000, max: 1000000000 },
    description: "Specify the interval between polling for internet speed (In <strong>milliseconds</strong>)."
  },]
}

module.exports = SpeedtestConfig;