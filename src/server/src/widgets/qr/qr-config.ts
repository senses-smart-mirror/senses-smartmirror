import { IWidgetConfig } from "src/lib/types/WidgetConfig";

const QRConfig: IWidgetConfig = {
  name: "qr",
  icon: "fad fa-qrcode",
  helper: true,
  speech: "qr, code, app code",
  settings: [{
    name: "title",
    displayOnly: true,
    label: "Start",
    order: 1,
    type: 'text',
    description: "This widget shows a QR code which you can scan with your mobile phone in order to open the Senses - app."
  },
  {
    name: "background_color",
    label: "Inverse Background Color",
    type: 'bool',
    description: "Enable this option if you want to inverse the background color of the QR code."
  },
  {
    name: "header",
    label: "Widget Title",
    type: "input",
    value: "QR App Code",
    description: "The header title of the widget."
  }
  ]
};

module.exports = QRConfig;
