// import * as Sonus from "sonus";
// import * as speech from '@google-cloud/speech';
// import { IHotword, ISonusHotword } from "./types/hotword";
// import { GENEREC_HOTWORDS } from "./contants/generic-hotwords";
// import HOTWORDS from "./contants/hotwords";
// import SmartMirrorAPI from '../../classes/Api';

// const client = new speech.SpeechClient({
//   projectId: '',
//   keyFilename: __dirname + '/keys.json'
// });

// class Speech {
//   private language: string = "en-US";
//   private sonus: any;
//   private genericHotwords: IHotword[] = GENEREC_HOTWORDS;
//   private hotwords: ISonusHotword[] = HOTWORDS;

//   private isStarted = false;

//   constructor() { }

//   /*
//   * init
//   */
//   init() {
//     this.sonus = Sonus.init({
//       hotwords: this.hotwords,
//       language: this.language
//     }, client);

//     this.setupEvents();

//     SmartMirrorAPI.addSocketListener("REQUEST_SPEECH_STATUS", this.requestSpeechStatus.bind(this));
//   }

//   /*
//   *
//   */
//   requestSpeechStatus() {
//     SmartMirrorAPI.emit('BROADCAST_SPEECH_STATUS', { active: this.isStarted });
//   }


//   /*
//   *
//   */
//   start() {
//     Sonus.start(this.sonus);
//     this.isStarted = true;
//     SmartMirrorAPI.emit('BROADCAST_SPEECH_STATUS', { active: true });
//   }

//   /*
//   *
//   */
//   stop() {
//     this.stopListening();
//   }

//   /*
//   *
//   */
//   stopListening() {
//     this.isStarted = true;
//     Sonus.stop(this.sonus);
//     SmartMirrorAPI.emit("BROADCAST_LISTENING_DISABLED");
//   }

//   /*
//   *
//   */
//  switchProfile(speechText: string): void {
//   const whichProfileName = speechText
//     .replace('switch profile', '')
//     .replace('switch to profile', '')
//     .replace('switch to', '')
//     .replace('profile', '')
//     .replace('to', '')
//     .trim();

//   Logger.log('[Speech] - trigger switch profile to:', whichProfileName);

//   SmartMirrorAPI.switchProfile(whichProfileName);
//  }

//   /*
//   *
//   */
//   setupEvents() {
//     // Hotword detection
//     this.sonus.on('hotword', (index: number = 0, keyword: string) => {
//       Logger.log(`[Speech] - Started listening: (${keyword})`);
//       SmartMirrorAPI.emit("BROADCAST_LISTENING_ON");
//     });

//     // Partial result detection + output
//     this.sonus.on('partial-result', (result: string) => {
//       Logger.log('!p', result);
//       SmartMirrorAPI.emit("BROADCAST_LISTENING_RESULT", { text: result });
//     });

//     // On error handler
//     this.sonus.on('error', (error: any) => {
//       Logger.log('Sonus error:', error);
//       SmartMirrorAPI.emit("BROADCAST_LISTENING_RESULT", { text: '' });
//       SmartMirrorAPI.emit("BROADCAST_LISTENING_OFF");
//     });

//     // On final result
//     this.sonus.on('final-result', (result: any) => {
//       Logger.log("[Speech] - Result:", result);

//       if (result.includes('show') || result.includes('hide') || result.includes('remove')) {
//         const widgets = SmartMirrorAPI.getWidgets();

//         if (widgets.length) {
//           widgets.forEach(widget => {

//             if (typeof widget.speech  === 'string') {
//               const trigger = widget.speech ? widget.speech.split(', ') : [];

//               if (result.includes('show')) {
//                 const fResult = result.replace('show ', '').trim();
//                 if (trigger.indexOf(fResult) > -1) {
//                   SmartMirrorAPI.showWidget(widget.name);
//                 }
//               } else {
//                 const fResult = result.replace('hide ', '').replace('remove ', '').trim();
//                 if (trigger.indexOf(fResult) > -1) {
//                   SmartMirrorAPI.hideWidget(widget.name);
//                 }
//               }
//             }
//           });
//         }
//       } else if (result.indexOf('switch profile') >= 0 || result.indexOf('switch to profile') >= 0 || result.indexOf('switch to') >= 0) {
//         this.switchProfile(result);
//       } else if (result.length) {
//         SmartMirrorAPI.callSpeechListener(result);
//       }
//       else {
//         Logger.log('[Speech] - No sound recorded.');
//       }

//       this.genericHotwords.forEach((hotword: IHotword) => {
//         const trigger = hotword.trigger.split(', ');

//         if (trigger.indexOf(result) > -1) {
//           Logger.log('[Speech] - Trigger:', hotword.event, 'Value:', hotword.value);

//           try {
//             if (typeof this[hotword.event] == "function") {
//               this[hotword.event].apply(this, [hotword.value]);
//             } else {
//               SmartMirrorAPI.callMethod(hotword.event, hotword.value, result);
//             }
//           } catch (e) {
//             Logger.error('[Speech] - Error:', e);
//           }
//         }
//       });

//       SmartMirrorAPI.emit("BROADCAST_LISTENING_RESULT", { text: result, reset: true });
//       SmartMirrorAPI.emit("BROADCAST_LISTENING_OFF");
//     });
//   }
// }

// module.exports = Speech;
