
import * as path from 'path';
import { ISonusHotword } from '../types/hotword';

const HOTWORDS:ISonusHotword[] = [
  {
    file: path.join(__dirname, "../resources/smart_mirror.pmdl"),
    hotword: "smart mirror",
    sensitivity: "0.5"
  },
];

export default HOTWORDS;
