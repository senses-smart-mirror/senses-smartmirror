import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const GithubStarsConfig: IWidgetConfig = {
	"name": "github-stars",
	"icon": "fab fa-github",
	"helper": true,
	"speech": 'github, stars, github stars',
	"settings": [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "Please note that the Github API has a pretty strict rate limit (max. <strong>60 calls per hour</strong>). If you set the interval to low you will exceed this limit quite fast."
	}, {
		name: "header",
		label: "Widget Title",
		type: 'input',
		value: "Github Stars",
		description: "The header title of the widget."
	},{
    name: "repos",
    type: "multivalue",
    label: "Repositories",
    value: [],
    items: [
      {
        name: "username",
        placeholder: "username",
        label: "Username"
      },
      {
        name: "repository",
        placeholder: "repository",
        label: "Repository",
      }
    ],
    buttonLabel: "Add repository",
    listLabel: "Current repositories",
    description: "Add a repository by providing the username and repository."
  }, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 600000,
		description: "Specify the interval between polling the events (In <strong>milliseconds</strong>)."
  }]
}

module.exports = GithubStarsConfig;