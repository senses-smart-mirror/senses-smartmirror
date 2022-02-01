import { ISetting } from "../types/Setting";

export const AppSettings: ISetting[] = [
  {
    name: "location",
    label: "Location",
    type: "input",
    value: '',
    defaultValue: "Amsterdam",
    description: "Default global location."
  },
  {
    name: "timezone",
    label: "Timezone",
    type: "input",
    value: '',
    defaultValue: "Europe/Amsterdam",
    description: "Default global timezone."
  },
  {
    name: "theme",
    label: "Theme",
    type: "dropdown",
    defaultValue: "light",
    value: "light",
    description: "Switch the global color scheme (theme)",
    options: [
      {
        name: "Light Theme",
        value: "light",
      },
      {
        name: "Dark Theme",
        value: "dark",
      }
    ],
  },
  {
    name: "starttime",
    label: "Start Time",
    type: "input",
    value: '',
    defaultValue: "00:00",
    description:
      "Mirror start time. Works together with endtime. With this setting you can enable/disable the mirror for a specific time. <strong>Format: hh:mm</strong> Based on 24 hours."
  },
  {
    name: "endtime",
    label: "End Time",
    type: "input",
    value: '',
    defaultValue: "23:59",
    description:
      "Mirror end time. See Start Time. <strong>Format: hh:mm</strong>. Based on 24 hours."
  },
  {
    name: "column_1_animation",
    label: "Left Bottom Column Animation",
    value: true,
    type: "bool",
    defaultValue: true,
    description:
      "Enable or disable the animation for the <strong>left bottom</strong> column."
  },
  {
    name: "column_2_animation",
    label: "Right Bottom Column Animation",
    value: true,
    type: "bool",
    defaultValue: true,
    description:
      "Enable or disable the animation for the <strong>right bottom</strong> column."
  },
  {
    name: "column_1_background",
    label: "Left column background",
    value: false,
    type: "bool",
    defaultValue: false,
    description:
      "Enable this setting in order to show a background in the <strong>left column</strong>."
  },
  {
    name: "column_2_background",
    label: "Right column background",
    value: false,
    type: "bool",
    defaultValue: false,
    description:
      "Enable this setting in order to show a background in the <strong>right column</strong>."
  },
  {
    name: "show_clock",
    label: "Show Clock",
    value: false,
    type: "bool",
    defaultValue: false,
    description: "Show a fullsize clock instead of the widgets."
  },
  {
    name: "show_minimal",
    label: "Show Minimal Overlay",
    value: false,
    type: "bool",
    defaultValue: false,
    description: "Show a minimal version of the widgets on the Smart Mirror"
  }, {
    name: "show_minimal_widgets",
    label: "Select widgets",
    value: [],
    items: [{
      value: 'calendar',
      label: 'Calendar'
    }, {
      value: 'traveltime',
      label: 'Commute'
    }, {
      value: 'notifications',
      label: 'Notifications'
    }, {
      value: 'crypto-list',
      label: 'Crypto'
    }, {
      value: 'speed-cameras',
      label: 'Traffic enforcement cameras'
    }, {
      value: 'weather',
      label: 'Current Weather'
    }, {
      value: 'flights',
      label: 'Flight Information'
    }, {
      value: 'hue',
      label: 'Lights'
    }, {
      value: 'nest',
      label: 'Nest Temperature'
    }, {
      value: 'spotify',
      label: 'Spotify Music'
    }, {
      value: 'reminders',
      label: 'Reminders'
    }, {
      value: 'todos',
      label: 'Todos'
    }, {
      value: 'stats',
      label: 'Stats'
    }, {
      value: 'clock',
      label: 'Clock'
    }, {
      value: 'profile',
      label: 'Profile'
    }, {
      value: 'mercedes',
      label: 'Mercedes'
    }],
    type: "multi-checkbox",
    description: "Select which widgets will be shown on the start screen. <strong>Please note</strong> that the widgets selected need to be added to the Smart Mirror as well."
  },
  {
    name: "show_welcome_message",
    label: "Show the profile welcome message",
    value: true,
    type: "bool",
    defaultValue: true,
    description: "Enable this to show the profile welcome message."
  },
  {
    name: "welcome_message_delay",
    label: "Delay to fade out welcome message",
    value: 5000,
    type: "input",
    defaultValue: 5000,
    validation: { min: 2500, max: 60000 },
    description: "Specify the delay before the welcome message will fade out and show the widgets."
  },
  {
    name: "background_image",
    label: "Background image",
    value: '',
    type: "input",
    defaultValue: '',
    description: "Specify the ID of the Image. You can get the ID from any <strong>Unsplash</strong> image. Example: unsplash.com/photos/<em>yup9Qzh_XQA</em>."
  },
  {
    name: "border_width",
    label: "Border Width",
    value: 20,
    type: "input",
    defaultValue: 20,
    description: "Specify the width used as spacing between the widgets and the edge of the monitor / screen <strong>(in pixels)</strong>."
  },
  {
    name: "overlay_width",
    label: "Center Column Width",
    value: 600,
    type: "input",
    defaultValue: 600,
    description: "Specify the width of the center column in <strong>pixels</strong>. Default is 600 pixels."
  },
  {
    name: "font",
    label: "Global Font",
    type: "dropdown",
    options: [
      {
        name: "M PLUS 1p",
        value: "plus"
      },
      {
        name: "Ubuntu",
        value: "ubuntu"
      },
      {
        name: "Roboto",
        value: "roboto"
      },
      {
        name: "Open Sans",
        value: "open_sans"
      },
      {
        name: "Verdana",
        value: "verdana"
      },
      {
        name: "Trebuchet MS",
        value: "trebuchet"
      },
      {
        name: "Rubik",
        value: "rubik"
      }
    ],
    value: "ubuntu",
    defaultValue: "ubuntu",
    description: "Choose a text font."
  }
]
