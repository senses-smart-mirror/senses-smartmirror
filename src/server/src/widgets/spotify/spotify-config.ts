import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const SpotifyConfig: IWidgetConfig = {
  name: "spotify",
  icon: "fad fa-music",
  helper: true,
  speech: "spotify, music, Spotify",
  settings: [
    {
      name: "title",
      displayOnly: true,
      label: "Start",
      order: 1,
      type: "text",
      description:
        "This widget requires Spotify Account to be connected. Click on the button below to connect with your Spotify account. The page will ask you to authorize the Smart Mirror to retreive your Spotify current listening data.",
    },
    {
      name: "none",
      displayOnly: "true",
      label: "",
      order: 2,
      type: "button",
      value: "Connect Spotify",
      defaultValue: "Connect Spotify",
      link: "spotify/login",
    },
    {
      name: "clientId",
      label: "Client ID",
      type: "input",
      value: "",
      description:
        "Paste client id. You can create this ID at the Spotify Developer Console.",
    },
    {
      name: "clientSecret",
      label: "Client Secret",
      type: "input",
      value: "",
      description:
        "Paste client secret. You can create this secret at the Spotify Developer Console.",
    },
    {
      name: "accessToken",
      disabled: true,
      scramble: true,
      label: "Access Token",
      type: "input",
      value: "",
      description:
        "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Spotify",
    },
    {
      name: "refreshToken",
      disabled: true,
      scramble: true,
      label: "Refresh Token",
      type: "input",
      value: "",
      description:
        "You <strong>cannot</strong> edit this setting as it is set automatically when you login with Spotify",
    },
    {
      name: "header",
      label: "Widget Title",
      type: "input",
      value: "Music",
      description: "The header title of the widget.",
    },
    {
      name: "show_play_device",
      label: "Show / Hide Device",
      type: "bool",
      value: true,
      description:
        "Show of hide the display of the device which you are playing on.",
		},
		{
      name: "show_image",
      label: "Show / Hide the Image",
      type: "bool",
      value: true,
      description:
        "Show of hide the image.",
		},
		{
      name: "show_album",
      label: "Show / Hide the Album",
      type: "bool",
      value: true,
      description:
        "Show of hide the album name.",
    },
    {
      name: "interval",
      label: "Interval",
      type: "input",
      value: 500000,
      validation: { min: 10000, max: 200000 },
      description:
        "Specify the interval between polling the events (In <strong>milliseconds</strong>).",
    },
  ],
};

module.exports = SpotifyConfig;