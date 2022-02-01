import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const TextConfig: IWidgetConfig = {
	"name": "text-editor",
	"icon": "fad fa-text",
	"speech": 'text, editor',
	"settings": [
		{
			name: "header",
			label: "Widget Title",
			type: 'input',
			value: "Text",
			description: "Widget title in the header."
		},
    {
			name: "text",
			label: "Widget Content",
			type: 'html_editor',
			value: "This is my default text",
			description: "Content"
		},
	]
}

module.exports = TextConfig;