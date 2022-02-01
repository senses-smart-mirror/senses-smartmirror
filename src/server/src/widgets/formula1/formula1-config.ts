import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const Formula1Config: IWidgetConfig = {
	"name": "formula1",
	"icon": "fad fa-flag-checkered",
	"helper": true,
	"speech": 'racing, formula, formula 1, formula one, formule',
	"settings": [{
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Formula 1",
		description: "The header title of the widget."
	}, {
    name: "showDriverStandings",
    label: "Show Driver Standings",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the drivers standings."
  },{
    name: "driverStandingsLimit",
    label: "Amount of items to display",
    type: "slider",
    defaultValue: 10,
    value: 10,
    max: 20,
    min: 1,
    description: "Amount of items to be displayed in the list."
  }, 
  {
    name: "showConstructorStandings",
    label: "Show Constructor Standings",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the constructors standings."
  }, 
  {
    name: "constructorsStandingsLimit",
    label: "Amount of items to display",
    type: "slider",
    defaultValue: 10,
    value: 10,
    max: 10,
    min: 1,
    description: "Amount of items to be displayed in the list."
  }, 
  {
    name: "showLastRaceResult",
    label: "Show Race Results",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the result from the last race."
  }, 
  {
    name: "showLastRaceResultLimit",
    label: "Amount of items to display",
    type: "slider",
    defaultValue: 10,
    value: 10,
    max: 20,
    min: 1,
    description: "Amount of items to be displayed in the list."
  }, 
  {
    name: "showRaceSchedule",
    label: "Show Race Schedule",
    type: "bool",
    defaultValue: true,
    value: true,
    description: "Show or hide the upcoming race schedule."
  }, {
    name: "raceScheduleLimit",
    label: "Amount of items to display",
    type: "slider",
    defaultValue: 5,
    value: 5,
    max: 30,
    min: 1,
    description: "Amount of items to be displayed in the list."
  }, {
    name: "onlyShowInRaceWeekeing",
    label: "Show only in race weekend",
    type: "bool",
    defaultValue: false,
    value: false,
    description: "Toggle this setting in order to show the widget only in a race weekend. The race weekend starts on a Thursday."
  }, {
    name: "year",
    label: "Specific year",
    type: "input",
    defaultValue: new Date().getFullYear(),
    value: new Date().getFullYear(),
    description: "Specify a year to display data for that year."
  }, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 3600000,
		description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
  }]
}

module.exports = Formula1Config;