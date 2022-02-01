import { IHotword } from "../types/hotword";

export const GENEREC_HOTWORDS: IHotword[] = [
  {
    trigger: 'turn on, turnon',
    event: "updatePower",
    value: 'on'
  }, {
    trigger: 'turn off, turnoff',
    event: "updatePower",
    value: 'off'
  },
  {
    trigger: 'standby, stand by',
    event: "updatePower",
    value: 'standby'
  }, {
    trigger: 'stop listening, stop',
    event: "stopListening",
  }, {
    trigger: 'what can I say, help',
    event: "whatCanISay"
  }, {
    trigger: 'go home, gohome, home',
    event: "whatCanISay",
    value: 'hide'
  }
];