import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const RedditConfig:IWidgetConfig  = {
	"name": "reddit",
	"icon": "fab fa-reddit-alien",
	"helper": true,
	"speech": "reddit, reddit feed",
	"settings": [{
		name: "header",
		label: "Header Title",
		value: "Reddit Feed",
		type: 'input',
		description: "The header title of the widget."
	}, {
		name: "url",
		label: "URL",
		value: "",
		defaultValue: "",
		type: 'input',
		description: "Full URL for RSS feed. <em>Example: https://www.reddit.com/r/news/.rss</em>"
	}, {
		name: "interval",
		label: "Interval",
		type: 'input',
		value: 100000,
		description: "Specify the interval between polling the latest news items (In <strong>milliseconds</strong>)."
	}, {
		name: "amount",
		label: "Display amount",
		type: 'input',
		value: 5,
		description: "Specify the amount of items that should be displayed"
	}, {
		name: "removeMegathreads",
		label: "Remove Megathreads",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Enabling this option will remove any Megathreads from the list."
	},  {
		name: "showLastUpdate",
		label: "Show or hide last updated since",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Show or hide the message updated since."
	}, {
		name: "showTitle",
		label: "Show or hide the Reddit Page Title",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Show or hide the Reddit Page Title"
	}]
}

module.exports = RedditConfig;
