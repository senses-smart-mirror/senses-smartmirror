const express = require('express');

import { IListener } from '../listeners';
import { Socket } from 'socket.io';
import { IWidgetData } from '../types';
import { ISpeechConfig } from '../types/Speech';

class API {
  private static app: any;
  private static socket: any;
  private static listeners: IListener = {};
  private static socketConnections: Socket[] = [];
  private static version: string;
  private static widgets: any[] = [];
  private static speechListeners: ISpeechConfig[] = [];

  static updateWidget(widgetData: IWidgetData): void { };
  static hideWidget(whichOne: string): void { };
  static showWidget(whichOne: string): void { };
  static callMethod(method: string, value: any, result: string): void { };
  static getProfile(): void { };
  static switchProfile(profileName: string): void {};
  static saveWidget(widgetData: IWidgetData): void {};

  /**
   * @addWidget
   * Add widget to widgets list
   *
   * @param {IWidgetData} data - widget data
   * @returns void
   */
  static addWidget(data: IWidgetData): void {
    this.widgets.push(<IWidgetData>{
      name: data.name,
      speech: data.speech
    });
  }

  /**
   * @getWidgets
   * Returns the widgetData for all widgets.
   *
   * @returns IWidgetData[]
   */
  static getWidgets(): IWidgetData[] {
    return this.widgets;
  }

  /**
   * @initiate
   * Initiate this api class to be used by widgets and modules.
   *
   * @param {express.Application} app - express instance
   * @param {any} io - socket io instance
   * @param {string} version - current version
   * @returns void
   */
  static initiate(app: Express.Application, io: any, version: string): void {
    this.app = app;
    this.socket = io;
    this.version = version;
  }

  /**
   * @getVersion
   * Returns the current widget version
   *
   * @returns string
   */
  static getVersion(): string {
    return this.version;
  }


  /**
   * @addSpeechListeners
   * Adds a speech listener configuration (from a widget or module).
   *
   * @param {any} data - speech listener configuration.
   */
  static addSpeechListeners(data: any): void {
    this.speechListeners.push(data);
  }

  /**
   * @callSpeechListener
   * Call a speech listener if there is one matching the result from the speech.
   *
   * @param {string} speechResult - speech result
   * @returns void
   */
  static callSpeechListener(speechResult: string): void {
    const result = this.findWidgetSpeechListeners(speechResult.trim());

    // @ts-ignore
    Logger.log('[Speech] - Performing Listeners.');

    if (result && typeof result.function === 'function') {
      result.function(result.speechValue);
      // @ts-ignore
      Logger.log(`[Speech] - called [${result.functionName}] - with: ${result.text}`)
    } else {
      // @ts-ignore
      Logger.log(`[Speech] - no callback found.`)
      this.emit("BROADCAST_SPEECH_NOFUNCTION");
    }
  }

 /**
   * @findWidgetSpeechListeners
   * Find and returns speech listener configuration based on speech result text
   *
   * @param {string} speechText - speech result text
   * @returns ISpeechConfig | false
   */
  static findWidgetSpeechListeners(speechText: string): ISpeechConfig | false {
    let retVal: ISpeechConfig | boolean = false;

    this.speechListeners.forEach((speech) => {
      const speeches = speech.text.split(',');

      speeches.forEach(_s => {
        const speechString = _s.trim();
        if (speechText.includes(speechString)) {
          const speechValue = speechText.replace(speechString, '')
          retVal = speech;
          retVal.speechValue = speechValue.trim();
        }
      });
    });

    return retVal;
  }

 /**
   * @addGetRoute
   * Adds a express GET route
   *
   * @param {string} path - path
   * @param {any} handler - handler
   * @returns void
   */
  static addGetRoute(path: string, handler: any): void {
    this.app.get(path, handler);
  }

 /**
   * @addPostRoute
   * Adds a express POST route
   *
   * @param {string} path - path
   * @param {any} handler - handler
   * @returns void
   */
  static addPostRoute(path: string, handler: any): void {
    this.app.post(path, handler);
  }

  /**
   * @addSocketListener
   * Adds socket listener
   *
   * @param {string} name - listener name
   * @param {function} fn - listener callback function
   * @returns void
   */
  static addSocketListener(name: string, fn: Function): void {
    this.listeners[name] = fn;
  }

  /**
   * @getListeners
   * Returns all current listeners
   *
   * @returns IListener
   */
  static getListeners(): IListener {
    return this.listeners;
  }

  /**
   * @emit
   * Emits a broadcast
   *
   * @param {string} name - name of the broadcast
   * @param {any} data - data to be send
   * @returns void
   */
  static emit(name: String, data?: any): void {
    this.socket.emit(name, data);
  }

  /**
   * @getSocketConnections
   * Returns all open socket connections
   *
   * @returns Socket[]
   */
  static getSocketConnections(): Socket[] {
    return this.socketConnections;
  }

}

export default API;
