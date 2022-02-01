import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const VideoConfig: IWidgetConfig = {
	name: 'video-player',
	icon: 'fad fa-video',
	helper: true,
	speech: 'video, player',
	settings: [{
		name: "title",
		displayOnly: true,
		label: "Start",
		order: 1,
		type: 'text',
		description: "The video player widget is able to play MP4 video's as well as Youtube and Vimeo videos. For all the video types you can paste the full URL. Example: <strong>https://www.youtube.com/watch?v=foo</strong> where 'foo' is the id of the video. Or: <em>http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4</em>"
	},
	{
		name: "video_url",
		label: "Video Url",
		type: 'input_push',
		description: "Paste the full video url and click update to send the video url to the Smart Mirror."
	},
	{
		name: 'play_bar',
		label: 'Playbar',
		type: 'playbar',
		placeholder: 'Specify a timestamp',
		description: 'Use the controls to play/pause or stop a video.'
	},
	{
    name: "video_format",
    label: "Video Width by Height ",
    type: "dropdown",
    options: [
      {
        name: "490px by 280px",
        value: "small"
      },
      {
        name: "600px by 340px",
        value: "large"
      }
    ],
    value: "small",
    defaultValue: "small",
    description: "Choose a size for the video. <strong>Width x Height</strong>"
  },
	{
		name: 'header',
		label: 'Header Title',
		value: 'Video Player',
		type: 'input',
		description: 'The header title of the widget.'
	},
	{
		name: "show_timing",
		label: "Show or hide Progress Bar",
		type: "bool",
		defaultValue: true,
		value: true,
		description: "Show or hide the progress bar below the video."
	},
	]
}

module.exports = VideoConfig;
