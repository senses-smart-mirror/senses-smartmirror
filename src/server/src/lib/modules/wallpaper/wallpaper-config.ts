import { IModuleConfig } from "src/lib/types/Module";

const WallpaperConfig: IModuleConfig = {
  name: "wallpaper",
  icon: "fa-image",
  settings: [{
    name: "api_key",
    label: "Unsplash API Key",
    type: 'input',
    value: "",
    description: "Paste the Unsplash API Key. You can create the API key at <a target='blank' href='https://unsplash.com/join'><strong>https://unsplash.com/join</strong></a>"
  }, {
    name: "photo_id",
    label: "Photo ID",
    type: 'input',
    value: "",
    description: "Provide a photo ID from Unsplash. Please note if you provide this ID it will not fetch a photo from a collection. Example: https://unsplash.com/photos/<strong><em>hpTH5b6mo2s</em></strong>"
  }, {
    name: "collections",
    label: "Collections",
    type: 'input',
    value: "",
    description: "Provide comma-separated IDs. Example: <strong>1538150, 162213</strong>"
  }, {
    name: "background",
    label: "Background Filter",
    type: 'bool',
    value: false,
    description: "Enable or disable the background filter. If the background filter is enabled there will be a black overlay."
  }, {
    name: "blur",
    label: "Background Blur",
    type: 'bool',
    value: false,
    description: "Enable or disable a background blur over the image. <em>This setting does not work together with the Background filter setting.</em>"
  }, {
    name: "border_radius",
    label: "Background Border Radius",
    type: 'bool',
    value: false,
    description: "Enable or disable the background border radius."
  }, {
    name: "interval",
    label: "Interval",
    type: 'input',
    value: 300,
    validation: { min: 300, max: 99999 },
    description: "Specify the interval for showing a new image in <strong>seconds</strong>."
  }
  ]
}

module.exports = WallpaperConfig;
