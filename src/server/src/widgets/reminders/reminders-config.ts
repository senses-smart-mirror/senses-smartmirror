import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const ReminderConfig: IWidgetConfig = {
  name: "reminders",
  icon: "fad fa-alarm-exclamation",
  speech: "reminders",
  settings: [
    {
      name: "title",
      displayOnly: true,
      label: "Start",
      order: 1,
      type: "text",
      description: "Set multiple reminders based on date and time."
    },
    {
      name: "header",
      label: "Widget Title",
      type: "input",
      value: "Reminders",
      description: "The header title of the widget."
    },
    {
      name: "reminders",
      type: "multivalue",
      label: "Reminders",
      value: [],
      items: [
        {
          name: "reminder",
          placeholder: "reminder",
          label: "Reminder"
        },
        {
          name: "date",
          placeholder: "Date (dd/mm)",
          label: "Date (dd/mm). Day before month!",
          date: "date"
        },
        {
          name: "time",
          placeholder: "Time (hh:mm)",
          label: "Time (hh:mm)",
          date: "time"
        }
      ],
      buttonLabel: "Add reminder",
      listLabel: "Active reminders",
      description: "Add reminders in order to display them."
    },
    {
      name: "pushNotification",
      label: "Display Notification",
      type: "bool",
      value: false,
      description: "Display a notification when the reminders is in 2 hours."
    },
    {
      name: "showIcon",
      label: "Icons",
      type: "bool",
      value: true,
      description: "Show or hide icons."
		},
		{
      name: "showSingle",
      label: "Show only 1 reminder",
      type: "bool",
      value: false,
      description: "Enable this setting to only show 1 reminder."
    }
  ]
};

module.exports = ReminderConfig;
