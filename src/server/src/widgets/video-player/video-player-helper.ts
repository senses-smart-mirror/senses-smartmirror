import { IWidget } from "src/lib/types";

export class VideoPlayer extends WidgetHelper {
  constructor(data: IWidget) {
    super(data);

    this._addSocketListener();
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
    this.settings = data.settings;
  }


  /*
   * _addSocketListener
   */
  private _addSocketListener(): void {
    this.addGlobalListener("VIDEO_PLAYER_PLAY", this.videoPlayerPlay.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_STOP", this.videoPlayerStop.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_PAUSE", this.videoPlayerPause.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_FORWARD", this.videoPlayerForward.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_REVERSE", this.videoPlayerReverse.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_TIMESTAMP", this.videoPlayerUpdateTimestamp.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_UPDATE_VIDEO", this.videoPlayerUpdateVIdeo.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_MUTE", this.videoPlayerMute.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_VOLUME_DOWN", this.videoPlayerVolumeDown.bind(this));
    this.addGlobalListener("VIDEO_PLAYER_VOLUME_UP", this.videoPlayerVolumeUp.bind(this)); 
  }

  private videoPlayerMute(): void {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_MUTE");
  }

  private videoPlayerVolumeDown(): void {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_VOLUME_DOWN");
  }

  private videoPlayerVolumeUp(): void {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_VOLUME_UP");
  }

  private videoPlayerUpdateTimestamp(value: string): void {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_TIMESTAMP", {value});
  }

  private videoPlayerUpdateVIdeo(value: string): void {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_UPDATE_VIDEO", {value});
  }

  private videoPlayerPlay() {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_PLAY", {});
  }

  private videoPlayerPause() {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_PAUSE", {});
  }

  private videoPlayerStop() {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_STOP", {});
  }

  private videoPlayerForward() {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_FORWARD", {});
  }

  private videoPlayerReverse() {
    this.addEmitter("BROADCAST_VIDEO_PLAYER_REVERSE", {});
  }
}

module.exports = VideoPlayer;
