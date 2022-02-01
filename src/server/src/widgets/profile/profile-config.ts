import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const ProfileConfig: IWidgetConfig = {
  name: "profile",
  icon: "fad fa-user",
  helper: true,
  speech: "profile",
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "This widget has access to profile data. It can show the welcome message or show which profile is active."
  },
  {
    name: "header",
    label: "Widget Title",
    type: "input",
    value: "Profile",
    description: "The header title of the widget."
  },
  {
    name: "show_welcome_only",
    label: "Show Welcome Message Only",
    type: "bool",
    value: true,
    description:
      "Show <strong>only</strong> the welcome message and nothing else.",
  }, {
    name: "show_which_profile",
    label: "Show which Profile",
    type: "bool",
    value: true,
    description: "Show or hide which profile is active.",
  }, 
  {
    name: "animate_welcome_message",
    label: "Animate the Welcome Message",
    type: "bool",
    value: true,
    description:
      "Enable this setting to animate the welcome message. The message will fade out after you switched to the profile.",
  }, 
  ]
};

module.exports = ProfileConfig;