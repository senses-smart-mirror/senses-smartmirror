import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const NewsFeedConfig:IWidgetConfig  = {
	"name": "news-feed",
	"icon": "fad fa-newspaper",
	"helper": true,
	"speech": "newsfeed, news feed, feed, news, the news",
	"settings": [{
		name: "header",
		label: "Header Title",
		value: "Headlines",
		type: 'input',
		description: "The header title of the widget."
	}, {
		name: "url",
		label: "URL",
		value: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
		defaultValue: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
		type: 'input',
		description: "URL for RSS feed."
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
		name: "showTitle",
		label: "Show or hide RSS Title.",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Show or hide RSS Title."
	}, {
		name: "showLastUpdate",
		label: "Show or hide last updated since",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Show or hide the message updated since."
	}, {
		name: "onlyOne",
		label: "Display only 1 item",
		type: "bool",
		defaultValue: false,
		value: false,
		description: "Display only 1 item."
	}]
}

module.exports = NewsFeedConfig;
