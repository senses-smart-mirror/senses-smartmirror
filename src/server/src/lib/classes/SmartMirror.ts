import shelljs from "shelljs";
import express from "express";
import fs from "fs";
import path from "path";
import socketIo, { Socket } from "socket.io";
import * as _ from "lodash";
import request from "request";
import wifi from 'node-wifi';
import network from 'network';
import moment from 'moment-timezone';

// imports
import Logger from "../helpers/logger";
import WidgetsMaker from "./WidgetsMaker";
import Settings from "./Settings";
import SmartMirrorAPI from "./Api";
import { IConfig } from "../types/Config";
import { IColumn } from "../types/Config";
import ModulesMaker from './ModulesMaker';
import WidgetHelper from "./WidgetHelper";
import Store from "./Store";
import ProfileMaker from "./ProfileMaker";

import Widget from "./Widget";
import { IWidgetData } from "../types/WidgetData";
import { ISimplifiedCustomWidget, ISimplifiedWidget } from "../types/SimplifiedWidget";
import { IPosition } from "../types/Position";
import { ISetting } from "../types/Setting";
import { IModule } from "../types/Module";
import { IWidgetMoveData } from "../types/WidgetMoveData";
import { IProfile } from "../types/Profile";
import IConnectData from "../types/Endpoint";

// initiate wifi module
wifi.init({
  iface: null
});

// Set config for monitor off functionality.
shelljs.config.execPath = shelljs.which("node").toString();

// Set global variables to be used throughout app.
global.WidgetHelper = WidgetHelper;
global.Logger = Logger;

// Get Senses - Smart Mirror Application Version.
let VERSION: string;
try {
  VERSION = require("../../../../package.json").version;
} catch (e) {
  VERSION = require("../../../package.json").version;
}

// setup configuration path
global.CONFIG_PATH = path.join(__dirname, '../../../../config');

if (!fs.existsSync(global.CONFIG_PATH)) {
  global.CONFIG_PATH = path.join(__dirname, '../../../config');
}

class SmartMirror {
  io: any;
  sonus: any;
  config!: IConfig;
  private backupInterval!: ReturnType<typeof setInterval>;
  private socketConnections: any = [];
  private checkInternetInterval!: ReturnType<typeof setInterval>;
  private sleepInterval!: ReturnType<typeof setInterval>;
  private smartMirrorStatus: string = 'on';
  private monitorManualStatus: boolean = false;
  private smartMirrorManualStatus: boolean = false;

  /* Constructor */
  constructor(app: express.Application, io: any) {
    this.io = io;

    // Initiate the Smart Mirror Api.
    SmartMirrorAPI.initiate(app, io, VERSION);
    SmartMirrorAPI.updateWidget = this.updateWidget.bind(this);
    SmartMirrorAPI.hideWidget = this.hideWidget.bind(this);
    SmartMirrorAPI.showWidget = this.showWidget.bind(this);
    SmartMirrorAPI.callMethod = this.callMethod.bind(this);
    SmartMirrorAPI.getProfile = this.getActiveProfile.bind(this);
    SmartMirrorAPI.switchProfile = this.switchProfile.bind(this);
    SmartMirrorAPI.saveWidget = this.saveWidgetAndProfile.bind(this);

    Logger.log(`[App] Sarting the Smart Mirror Class.`);

    Settings.loadGlobalSettings();

    // load configuration
    this.loadConfig();

    // Load profiles
    ProfileMaker.loadProfiles(this.config);

    // Load active profile configuration
    this.loadActiveProfileConfiguration();

    // load custom widgets
    this.loadCustomWidgets();

    // initiate modules
    ModulesMaker.initiateModules();

    // Save modules in configuration
    this.saveModules();

    // load saved components into store
    Store.load();

    // start all modules
    this.startAllModules();

    // initiate all default widgets.
    this.startAllWidgets();

    // check if there is a update preformed.
    this.checkIfUpdateHasBeenPreformed();

    if (!this.checkInternetInterval) {
      this.checkInternetInterval = setInterval(() => {
        this.testCurrentInternetConnection();
      }, 20000);
    }

    this.setBackupConfigurationInterval();

    this.setupSleepInterval();
  }

  /**
  * @setupSleepInterval
  * set up sleep interval to turn of Smart Mirror based on settings.
  *
  * @returns void
  */
  setupSleepInterval(): void {
    if (this.sleepInterval) {
      clearInterval(this.sleepInterval);
    }

    const format: string = "hh:mm";

    this.sleepInterval = setInterval(() => {
       // if monitor or mirror is manually turned off, don't do anything here
      if ( this.monitorManualStatus || this.smartMirrorManualStatus ) {
        return;
      }

      const startTime = Settings.getSettingValue(this.config.settings, 'starttime');
      const endTime = Settings.getSettingValue(this.config.settings, 'endtime');
      const timezone = Settings.getSettingValue(this.config.settings, 'timezone');

      if (startTime && endTime) {
        const time = moment().tz(timezone),
          beforeTime = moment(startTime, format),
          afterTime = moment(endTime, format);
        const turnOn = time.isBetween(beforeTime, afterTime) ? true : false;

        if (turnOn) {

          // if smart mirror is in standy don't update the status.
          if (this.smartMirrorStatus === 'standby' || this.smartMirrorStatus === 'on') return;

          this.updatePower('on');
          this.updateMonitorStatus('on');
        } else {

          if ( this.smartMirrorStatus === 'off' ) return;

          this.updatePower('off');
          this.updateMonitorStatus('off');
        }
      }
    }, 5000);
  }


  /**
  * @startAllModules
  * starts all active modules using the modules maker class.
  *
  * @returns void
  */
  startAllModules(): void {
    const modules: IModule[] = this.config.modules || [];
    ModulesMaker.startModules(modules);
  }


  /**
 * @saveModuleSettings
 * saves module settings
 *
 * @param {IModule} moduleData - module data
 * @returns this
 */
  saveModuleSsettings(moduleData: IModule): this {
    const module = <IModule>ModulesMaker.saveSettings(moduleData);

    if (module) {
      const formattedSettings = ModulesMaker.getFormattedSettings(module);

      this.config.modules = this.config.modules.map(mod => {
        if (mod.name === moduleData.name) {
          return {
            name: mod.name,
            enabled: mod.enabled,
            started: mod.started,
            settings: formattedSettings
          }
        } else {
          return mod
        }
      });

      // if restart function, restart the module
      if (module.class && typeof module.class.restart === 'function') {
        try {
          Logger.log('[Modules] restart module:', module.name)
          module.class.restart();
        } catch (e) {
          Logger.error('Couldn\'t restart module:', module.name, e);
        }
      }
    }

    return this;
  }

  /**
 * @saveModules
 * saves all loaded modules
 *
 * @returns void
 */
  saveModules(): void {
    const modules: IModule[] = ModulesMaker.get();

    if (!this.config.modules.length) {
      this.config.modules = modules.map(module => ({
        name: module.name,
        enabled: module.enabled
      }));
    } else {
      modules.forEach(module => {
        const m = this.config.modules.filter(m => m.name === module.name);

        if (!m.length) {
          this.config.modules.push({
            name: module.name,
            enabled: module.enabled
          });
        }
      });
    }

    this.saveConfig().then(() => {
      Logger.log('[Modules] - configuration saved.')
    });
  }

  /**
  * @stopAndRemoveAllWidgets
  * stops and removes all widgets using the widget maker class.
  *
  * @returns void
  */
  stopAndRemoveAllWidgets(): void {
    WidgetsMaker.stopAndRemoveAllWidgets();
  }

  /**
  * @startAllWidgets
  * starts all active widgets, active widgets are widgets that are currently used on the Smart Mirror.
  *
  * @param {boolean} dontReloadWidget (optional) - don't reload widgets if they are already loaded.
  * @returns void
  */
  startAllWidgets(dontReloadWidget: boolean = false): void {
    let activeWidgets: IWidgetData[] = [];

    if (!this.config.columns || !Array.isArray(this.config.columns)) {
      Logger.error('Error loading proper columns configuration. The file might be corrupted, loading default configuration.');
      // TODO: revert back to default configuration
      return;
    }

    this.config.columns.forEach((column: IColumn) => {
      if (column.topComponents) {
        activeWidgets = activeWidgets.concat(column.topComponents);
      }
      if (column.bottomComponents) {
        activeWidgets = activeWidgets.concat(column.bottomComponents);
      }
    });

    if (!dontReloadWidget) {
      WidgetsMaker.loadAllWidgets();
    }

    WidgetsMaker.createNewWidgets(activeWidgets);
  }

  /**
  * @requestSaveProfile
  * request to save profile information. Not allowed to overwrite default profile information.
  *
  * @param {!widgetData} widgetData - profile to be updated.
  * @returns Promise<void>
  */
  async saveWidgetAndProfile(widgetData: IWidgetData): Promise<void> {
    this.updateWidget(widgetData);

    await this.saveProfile();

    this.saveConfig().then(() => {
      Logger.log('[Widget] - All done & successfully saved');
    });
  }

  /**
  * @requestSaveProfile
  * request to save profile information. Not allowed to overwrite default profile information.
  *
  * @param {Iprofile} profile - profile to be updated.
  * @returns void
  */
  requestSaveProfile(profile: IProfile): void {

    // not allowed to change default profile
    if (profile.name === 'default') {
      profile.label = 'Default Profile';
    }

    ProfileMaker.saveProfileData(profile);

    this.saveProfiles();

    this.io.emit("BROADCAST_SAVED_PROFILE", { success: true });
  }

  /**
  * @requestSetActiveProfile
  * Set profile active based on profile name.
  *
  * @param {string} profileName - profile name
  * @returns void
  */
  requestSetActiveProfile(profileName: string): void {
    ProfileMaker.setProfileActive(profileName);

    this.loadActiveProfileConfiguration();

    this.saveProfiles();

    this.broadcastProfiles();

    this.broadcastIsSwitchingProfile();

    // stop all active widgets from the currently active profile.
    this.stopAndRemoveAllWidgets();

    // start all active widgets but don't load widgets
    // since they are already loaded.
    this.startAllWidgets(true);

    // forece reload sockets
    this.forceSocketsReload();

    // when everything is ready, broadcast the new configuration
    setTimeout(() => {
      this.broadcastConfig();
    }, 3000);
  }

  /**
  * @broadcastIsSwitchingProfile
  * Broadcast to Mirror that the app is switching profiles
  *
  * @returns void
  */
  broadcastIsSwitchingProfile(): void {
    this.io.emit("BROADCAST_IS_SWITCHING_PROFILES", ProfileMaker.getActiveProfile());
  }


  /**
  * @saveProfiles
  * save all profiles in the configuration file.
  *
  * @returns void
  */
  saveProfiles(): void {
    this.config.profiles = [...ProfileMaker.getProfiles()];

    this.saveConfig().then(() => {
      Logger.log("[Profiles] - Saved profiles in configuration file.");
    });
  }

  /**
  * @requestRemoveProfile
  * Remove profile from configuration file and totally removes the profile information.
  * Will also switch to default profile is profile is used.
  *
  * @param {string} profileName - profile nam
  * @returns void
  */
  requestRemoveProfile(profileName: string): void {
    const activeProfile = ProfileMaker.getActiveProfile();

    ProfileMaker.removeProfile(profileName);

    this.broadcastProfileIsRemoved();

    // if profile is currenlty active, change to default profile.
    if (activeProfile.name === profileName) {
      this.requestSetActiveProfile('default');
    } else {
      this.saveProfiles();

      this.broadcastProfiles();
    }
  }

  /**
  * @broadcastProfileIsRemoved
  * Broadcast to Mirror App that profile is removed successfully.
  *
  * @returns void
  */
  broadcastProfileIsRemoved(): void {
    this.io.emit("BROADCAST_PROFILE_REMOVE");
  }


  /**
  * @loadActiveProfileConfiguration
  * Loads the configuration from the currently active profile into the configuration that is used for the Smart Mirror.
  * If error while loading it will load the default profile configuration
  *
  * @returns void
  */
  loadActiveProfileConfiguration(): void {
    const profile = ProfileMaker.getActiveProfile();

    if (profile.columns) {
      this.config.columns = profile.columns;
    } else {
      Logger.log('[Profiles] - Fallback load default profile...');
      ProfileMaker.setProfileActive('default');

      const profile = ProfileMaker.getActiveProfile();

      if (profile.columns) {
        this.config.columns = profile.columns;
      } else {
        Logger.log('[Profile] - Major error: profile configuration cannot be load. Aborting...');
        process.exit();
      }

      this.saveProfiles();
    }
  }

  /**
  * @createNewProfile
  * Creates new profile using the Profile Maker class based on give name
  *
  * @param {string} profileName - profile name
  * @returns Promise<void>
  */
  async createNewProfile(profileName: string): Promise<void> {
    const profile = await ProfileMaker.createNewProfile(profileName);

    if (profile) {
      this.broadcastProfiles();
      this.storeNewProfileInConfig(profile);
    } else {
      this.io.emit("BROADCAST_PROFILES", { error: 'already_exists' });
    }
  }

  /*
  * get active profile
  */
  getActiveProfile(): IProfile {
    return ProfileMaker.getActiveProfile();
  }

  /**
  * @broadcastProfiles
  * Broadcast all profiles to Mirror app.
  *
  * @returns void
  */
  broadcastProfiles(): void {
    this.io.emit("BROADCAST_PROFILES", this.getProfiles());
  }

  /**
  * @storeNewProfileInConfig
  * Stores new profile in configuration file
  *
  * @param {IProfile} profile - full profile
  * @returns void
  */
  storeNewProfileInConfig(profile: IProfile): void {
    Logger.log('[Profiles] - Storing new profile in configuration file');

    this.config.profiles = [...this.config.profiles, profile];

    this.saveProfiles();
  }

  /**
  * @requestProfiles
  * Request to broadcast all profiles to Mirror App.
  *
  * @returns void
  */
  requestProfiles(): void {
    this.io.emit("BROADCAST_PROFILES", this.getProfiles());
  }

  /**
  * @getProfiles
  * Returns all profiles.
  *
  * @returns IProfile[]
  */
  getProfiles(): IProfile[] {
    return <IProfile[]>ProfileMaker.getProfiles();
  }

  /**
  * @loadCustomWidgets
  * Loads all custom widgets from the configuration into the Widgets Maker Class.
  *
  * @returns void
  */
  loadCustomWidgets(): void {
    WidgetsMaker.setCustomWidget(this.config.customWidgets);
  }

  /**
  * @saveGlobalSettings
  * Saves global Smart Mirror settings into the Settings Class
  *
  * @param {ISetting[]} settings - settings array
  * @returns this
  */
  saveGlobalSettings(settings: ISetting[]): this {
    this.config.settings = Settings.saveGlobalSettings(settings);
    return this;
  }

  /**
  * @updatePower
  * Upates the Smart Mirror power by turning it on/off.
  *
  * @param {string} mode - values: off/on
  * @returns void
  */
  updatePower(mode: string, manualTriggered: boolean = false) {
    Logger.log(`Smart Mirror enabled mode: ${mode}`);
    this.io.emit("BROADCAST_MIRROR_POWER", mode);

    this.smartMirrorStatus = mode;
    this.smartMirrorManualStatus =this.smartMirrorManualStatus = ! this.smartMirrorManualStatus ?  manualTriggered : false;

    // TODO: convert off and on to enum.
    if (mode === 'off') {
      WidgetsMaker.stopAllWidgets();
    }

    if (mode === 'on') {
      WidgetsMaker.startAllWidgets();
    }
  }

  /**
  * @updateWidget
  * Updates widget settings
  *
  * @param {IWidgetData} widgetData - object containing the new widget settings
  * @returns this
  */
  updateWidget(widgetData: IWidgetData): this {
    const widget: Widget | undefined = WidgetsMaker.getWidgetById(widgetData.id);

    if (!widget) {
      Logger.error('[Widgets] - Unable to update widget', widgetData.name);
      return this;
    }

    // save new settings;
    widget.saveSettings(widgetData.settings);

    // reload widget helper
    widget.reload();

    // store widget
    Store.addWidget(widget.getSimplified());

    // update widget in profile configuration
    ProfileMaker.updateWidgetInConfig(widgetData, widget.getFormattedSettings());

    return this;
  }

  /**
  * @addListenersToNewSocket
  * Binds all widget listeners to the current socket instance.
  *
  * @param {socketIo.Socket} socket - socket data
  * @returns void
  */
  addListenersToNewSocket(socket: socketIo.Socket): void {
    const listeners = SmartMirrorAPI.getListeners();

    for (let listener in listeners) {
      socket.on(listener, listeners[listener]);
    }
  }

  /**
  * @useBackupConfiguration
  * Resets current configuration with the backup configuration.
  *
  * @returns void
  */
  useBackupConfiguration(): void {
    Logger.log("[Backup] - Using backup configuration");
    if (
      fs.existsSync(path.join(global.CONFIG_PATH, "backup-config.json"))
    ) {
      this.config = JSON.parse(
        fs.readFileSync(path.join(global.CONFIG_PATH, "backup-config.json"))
      );
      this.saveConfig().then(() => {
        Logger.log("[Backup] - Backup configuration saved.");
      });
    }
  }

  /**
  * @reloadConfig
  * Reloads the configuration and broadcasts new configuration to Mirror GUI.
  *
  * @returns void
  */
  reloadConfig(): void {
    Logger.log("Reloading configuration");
    this.loadConfig();
    this.broadcastConfig();
  }

  /**
  * @loadConfig
  * Loads the json configuration into this program. Will use saved configuration or default configuration file.
  * After loading the configuration it will set the version.
  *
  * @returns void
  */
  loadConfig(): void {
    if (fs.existsSync(path.join(global.CONFIG_PATH, "saved-config.json"))) {
      Logger.log("[Config] - Using Saved config file");

      let valid;
      try {
        this.config = JSON.parse(
          fs.readFileSync(
            path.join(global.CONFIG_PATH, "saved-config.json")
          ),
          "utf-8"
        ) as IConfig;

        valid = this.validateConfig();

        if (valid?.error) {
          Logger.error("[Config] - Saved config is invalid.");
          Logger.error(`--> ${valid.error}`);
        } else {
          this.setVersion();
          return;
        }
      } catch (e) {
        Logger.error('[Config] - Saved Configuration is corrupted. With error:', e);
      }
    }

    Logger.log("[Config] - Using Default config");
    this.config = JSON.parse(
      fs.readFileSync(
        path.join(global.CONFIG_PATH, "default-config.json"),
        "utf-8"
      )
    ) as IConfig;

    this.setVersion();
    return;
  }

  /**
  * @validateConfig
  * Will validate if certain items/configuration is available in the json configuration files.
  *
  * @returns boolean | {error: string | boolean}
  */
  validateConfig(): boolean | { error: string | boolean } {
    let valid = true;

    if (!this.config.settings) valid = false;

    if (!valid) {
      return { error: "Missing settings or columns configuration." };
    }

    return { error: false };
  }

  /**
  * @setVersion
  * Set version given or uses global VERSION grabbed from package.json file.
  *
  * @param {string} version (optional) - version
  * @returns void
  */
  setVersion(version?: string): void {
    this.config.version = version || VERSION;
  }

  /**
  * @getConfig
  * Returns current used configuration. Adds profile data to return value first.
  *
  * @returns IConfig
  */
  getConfig(): IConfig {
    const profile = ProfileMaker.getActiveProfile();
    const profileWithoutColumnsData = ProfileMaker.getActiveProfileWithoutColumns();

    this.config.columns = profile.columns;
    this.config.profile = profileWithoutColumnsData;

    return this.config;
  }

  /**
  * @switchProfile
  * Switches profile to gives profile name.
  * (used by speech module)
  *
  * @param {string} profileName - profile name
  * @returns void
  */
  switchProfile(profileName: string): void {
    Logger.log('[Profiles] - switching to profile:', profileName);

    if (!profileName || !profileName.length) return;

    const profile: IProfile[] = this.config.profiles.filter((profile: IProfile) => profile.name === profileName.toLowerCase());

    if (profile && profile[0]) {
      this.requestSetActiveProfile(profile[0].name);
    } else {
      Logger.error('[Profiles] - unabled to switch to profile:', profileName);
    }
  }

  /**
  * @setConfig
  * Set configuration
  *
  * @param {IConfig} config - configuration
  * @returns void
  */
  setConfig(config: IConfig): void {
    this.config = config;
  }

  /**
  * @getSocketConnections
  * Returns all socket connections
  *
  * @returns socketIo.Socket
  */
  getSocketConnections(): socketIo.Socket[] {
    return this.socketConnections;
  }

  /**
  * @storeSocketConnection
  * Stores socket connection.
  *
  * @param {socketIo.Socket} socket - socket instance
  * @returns void
  */
  storeSocketConnection(socket: socketIo.Socket) {
    this.socketConnections.push(socket);
  }

  /**
  * @getInstalledCustomWidgets
  * Returns all custom installed widgets.
  *
  * @returns IWidgetData[]
  */
  getInstalledCustomWidgets(): IWidgetData[] {
    return WidgetsMaker.getRegisteredCustomWidgets();
  }

  /**
  * @getCustomWidgets
  * Returns custom installed widgets in a simplified form for Smart Mirror GUI.
  *
  * @returns ISimplifiedCustomWidget[]
  */
  getCustomWidgets(): ISimplifiedCustomWidget[] {
    const widgets = WidgetsMaker.getCustomWidgets();

    return widgets.map((widget: IWidgetData) => {
      return {
        name: widget.name,
        url: widget.url,
        id: widget.id,
        version: widget.version
      } as ISimplifiedCustomWidget;
    });
  }

  /**
  * @getWidgets
  * Returns all widgets
  *
  * @returns ISimplifiedWidget[]
  */
  getWidgets(): ISimplifiedWidget[] {
    const widgets = WidgetsMaker.getAllWidgets();

    return widgets.map((widget: IWidgetData) => {
      return {
        name: widget.name,
        url: widget.url || '',
        id: widget.id,
        version: widget.version || '',
        custom: widget.custom || false
      } as ISimplifiedWidget;
    });
  }

  /**
  * @addWidgetToGrid
  * Creates a new widget instance and adds it to the grid.
  *
  * @param {IPosition} position - position on the grid
  * @param {IWidgetData} widgetData - widget data
  * @returns void
  */
  addWidgetToGrid(position: IPosition, widgetData: IWidgetData): void {
    // delete property used by app UI
    delete widgetData.isLoading;

    // create new widget
    let widget: Widget | undefined = WidgetsMaker.createNewWidget(widgetData);

    if (!widget) return;

    this._addWidgetToGrid(position, widget.getSimplified());

    this.saveProfile().then(() => {
      this.forceSocketsReload();

      setTimeout(() => {
        this.broadcastConfig();

        // update widget with settings from the store
        const widgetFromStore = Store.getWidget(widgetData.name);
        if (widgetFromStore) {
          widget!.saveSettings(widgetFromStore.settings);
        }

        // remove helper instance from object
        widget = widget!.getWithoutHelper();

        this.io.emit("BROADCAST_ADDED_COMPONENT", widget);
      }, 1000);
    });
  }

  /**
  * @saveProfile
  * Save active profile configuration in json file.
  *
  * @returns Promise<boolean>
  */
  saveProfile(): Promise<boolean> {
    return ProfileMaker.saveActiveProfile();
  }

  /**
  * @showWidget
  * Sends a broadcast to show a widget on the Smart Mirror GUI.
  * (used by speech module)
  *
  * @param {string} whichOne - which widget to show
  * @returns void
  */
  showWidget(whichOne: string) {
    WidgetsMaker.startWidgetByName(whichOne);

    const widget = WidgetsMaker.updateWidgetSetting(whichOne, 'show', true);

    if (widget) {
      this.saveWidgetAndProfile(widget);
    }

    this.io.emit("BROADCAST_SHOW_WIDGET", { whichOne });
  }

  /**
  * @sendLog
  * Outputs a log entry.
  *
  * @param {string} msg - message to be logged
  * @returns void
  */
  sendLog(msg: string): void {
    Logger.log(msg);
  }

  /**
  * @hideWidget
  * Sends a broadcast to hide a widget on the Smart Mirror GUI.
  * (used by speech module)
  *
  * @param {string} whichOne - which widget to hide
  * @returns void
  */
  hideWidget(whichOne: string) {
    WidgetsMaker.stopWidgetByName(whichOne);

    const widget = WidgetsMaker.updateWidgetSetting(whichOne, 'show', false);

    if (widget) {
      this.saveWidgetAndProfile(widget);
    }

    this.io.emit("BROADCAST_SHOW_WIDGET", { whichOne, mode: 'hide' });
  }

  /**
  * @toggleWidgetVisibility
  * Toggles widget Visibility
  *
  * @param {{name: string; type: string}} data - data contains widget name and type, either show or hide.
  * @returns void
  */
  toggleWidgetVisibility(data: { name: string; type: string }) {
    Logger.log(`[Widgets] - Changing visibility for: ${data.name} - ${data.type}`);

    if (data.type === 'hide') {
      return this.hideWidget(data.name);
    }

    if (data.type === 'show') {
      return this.showWidget(data.name);
    }
  }

  /**
  * @callMethod
  * Function to call certain methods on this class.
  * (used by speech module)
  *
  * @param {string} method - which method
  * @param {any} value - any value can specified
  * @returns void
  */
  callMethod(method: string, value: any): void {
    const validMethods: string[] = ['whatCanISay', 'updatePower', 'stopListening'];
    if (validMethods.indexOf(method) >= 0 && typeof this[method] === "function") {
      this[method].apply(this, [value]);
    } else {
      Logger.error('[App] - Not able to call method on Smart Mirror Class:', method);
    }
  }


  /**
  * @whatCanISay
  * Broadcasts "what can I say" to Smart Mirror GUI.
  * (used by speech module)
  *
  * @param {string} mode - show or hide
  * @returns void
  */
  whatCanISay(mode: string) {
    Logger.log('[Speech] - Show: what can I say:', mode);
    this.io.emit("BROADCAST_LISTENING_WCIS", { data: mode });
  }

  /**
  * @broadcastConfig
  * Broadcast configuration globally.
  *
  * @returns void
  */
  broadcastConfig(): void {
    this.io.emit("BROADCAST_MIRROR_CONFIG", this.getConfig());
  }

  /**
  * @_addWidgetToGrid
  * Set profile active based on profile name.
  *
  * @param {IPosition} position - new position of the widget
  * @param {IWidgetData} widget - widget data
  * @returns void
  */
  private _addWidgetToGrid(position: IPosition, widget: IWidgetData): void {
    const profile = ProfileMaker.getActiveProfile();

    _.forEach(profile.columns, (column: IColumn) => {
      if ("column" + column.id === position.columnName) {
        column[position.areaName].splice(position.itemPosition, 0, widget);
      }
    });
  }

  /**
  * @getGlobalSettings
  * Returns global settings
  *
  * @returns ISetting[]
  */
  getGlobalSettings(): ISetting[] {
    return Settings.getGlobalSettings();
  }

  /**
  * @getWidgetModel
  * Returns widgets settings model or empty array.
  *
  * @param { id: string } data - data contains widget id
  * @returns Widget | []
  */
  getWidgetModel(data: { id: string }): Widget | [] {
    let widget = WidgetsMaker.getWidgetById(data.id);

    if (!widget) return [];

    // remove helper instance
    widget = widget.getWithoutHelper();

    return widget;
  }

  /**
  * @getAvailableWidgets
  * Returns all available widgets
  *
  * @returns IWidgetData[]
  */
  getAvailableWidgets(): IWidgetData[] {
    return <IWidgetData[]>WidgetsMaker.getAvailableWidgets();
  }

  /**
  * @toggleModule
  * Toggles a modules status, either 'on' or 'off'. Uses the Module Maker class.
  *
  * @param {string} moduleName - module name
  * @returns IModule | { "error": string }
  */
  toggleModule(moduleName: string): IModule | { error: string } {
    const result = ModulesMaker.toggleModule(moduleName);

    if (!result.error) {
      this.saveModuleConfig(result as IModule);
    }

    return result;
  }

  /**
  * @saveModuleConfig
  * Saves module configuration in configuration json file.
  *
  * @param {IModule} module - the module to save
  * @returns void
  */
  saveModuleConfig(module: IModule): void {
    Logger.log("[Config] - Saving module:", module.name);

    this.config.modules = this.config.modules.map(_mod => {
      if (_mod.name === module.name) {
        _mod.enabled = module.enabled;
        _mod.started = module.started;
      }

      return _mod;
    });

    this.saveConfig().then(() => {
      Logger.log('[Config] - Modules saved.');
    });
  }

  /**
  * @stopAndRemoveWidget
  * Stops and removes a widget using the Widgets Maker class.
  *
  * @param {IWidgetData} widgetData - widget data
  * @returns void
  */
  stopAndRemoveWidget(widgetData: IWidgetData): void {
    WidgetsMaker.stopAndRemoveWidget(widgetData);
  }

  /**
  * @saveConfig
  * Saves the current configuration to a file.
  *
  * @returns Promise<any>
  */
  saveConfig(): Promise<void> {
    Logger.log("[Config] - Saving config...");

    const { columns, ...config } = this.config;

    // remove columns from profiles as we save them separately in profile files.
    config.profiles = config.profiles.map(({ columns, ...profile }) => profile);

    let contents = `${JSON.stringify(config, null, 2)}`;

    return new Promise<any>((resolve, reject) => {
      if ( !contents || !contents.length ) {
        console.error('No contents to save, skipping save.');
        return reject("NO_CONTENTS");
      }

      fs.writeFile(
        path.join(global.CONFIG_PATH, "saved-config.json"),
        contents,
        (err: any) => {
          Logger.log("[Config] - Saved config");
          this.loadConfig();
          resolve(true);

          if (err) reject();
        }
      );
    });
  }

  /**
  * @createBackup
  * Create a backup file from the current configuration.
  *
  * @returns Promise<void>
  */
  createBackup(): Promise<void> {
    Logger.log("[Backup] - Creating configuration backup..");

    let contents = `${JSON.stringify(this.config, null, 2)}`;

    return new Promise<any>((resolve, reject) => {
      fs.writeFile(
        path.join(global.CONFIG_PATH, "backup-config.json"),
        contents,
        (err) => {
          Logger.log("[Backup] - Backup configuration saved!");
          resolve(true);
          if (err) {
            Logger.log("[Backup] - Error", err);
            reject();
          }
        }
      );
    });
  }

  /**
  * @updateMonitorStatus
  * Turn off or on the monitor power.
  * modes: off / on
  *
  * @param {string} mode - 'on' or 'off'
  * @returns <void>
  */
  updateMonitorStatus(mode: string, manualTriggered: boolean = false): void {
    Logger.log("[App] - Turning off/on the monitor. Mode:", mode);
    const power: number = mode === "on" ? 1 : 0;

    this.monitorManualStatus = ! this.monitorManualStatus ?  manualTriggered : false;

    shelljs.exec(`vcgencmd display_power ${power}`);
  }


  /**
  * @checkIfUpdateHasBeenPreformed
  * Check if an update has been preformed. Is triggered after a start (or restart after the update)
  *
  * @returns <void>
  */
  checkIfUpdateHasBeenPreformed(): void {
    const updating = this.config.settings.filter((item: any) => item.name === 'updating');

    if (updating.length) {
      this.config.lastUpdate = this.config.version;

      this.config.settings.push({"name": "updateFinished", "value": "true"});

      this.saveConfig().then(() => {
        Logger.log('[Mirror] - Updating setting saved.');
      });

      this.io.emit("BROADCAST_MIRROR_CONFIG", this.getConfig());
    }
  }

  /**
  * @requestAfterUpdate
  * Save in configuration file that update is succesfull.
  *
  * @returns <void>
  */
  requestAfterUpdate(): void {
    const removeSettings = ['updating', 'updateFinished'];
    this.config.settings = this.config.settings.filter((item: any) => !removeSettings.includes(item.name));

    this.config.version = this.config.lastUpdate as string;
    this.config.lastUpdate = null;
    this.saveConfig().then(() => {
      Logger.log("[Update] - Saved configuration after update.");
      this.io.emit("BROADCAST_MIRROR_CONFIG", this.getConfig());
    });
  }

  /**
  * @preformUpdate
  * Execute update.
  *
  * @returns <void>
  */
  preformUpdate(): void {
    Logger.log("[Update] - Starting Upgrade..");

    this.config.settings.push({ name: "updating", value: true });

    Logger.log('[Update] - Stopping all widgets');
    WidgetsMaker.stopAllWidgets();

    this.saveConfig().then(() => {
      this.io.emit("BROADCAST_UPDATING");

      shelljs.exec("bash server/scripts/upgrade.sh", () => {
        Logger.log("[Update] - Done upgrading. Restarting the Smart Mirror.");
        setTimeout(() => {
          process.on("exit", () => {
            require("child_process").spawn(process.argv.shift(), process.argv, {
              cwd: process.cwd(),
              detached: true,
              stdio: "inherit",
            });
          });
          process.exit();
        }, 2500);
      });
    });
  }

  /**
   * @RemoveWidgetById
   * Remove a widget from the current configuration file (profile configuration file).
   *
   * @param {string} id - id of the widget
   * @returns IWidgetData | boolean
   */
  removeWidgetById(id: string): IWidgetData | boolean {
    return this.removeWidgetFromConfig({ id: id });
  }

  /**
   * @removeWidgetByName
   * Remove a widget from the current configuration file (profile configuration file).
   *
   * @param {string} name - name of the widget
   * @returns void
   */
  removeWidgetByName(name: string): void {
    ProfileMaker.removeWidgetFromAllProfiles({ name: name });
  }

  /**
   * @moveWidget
   * Move widget in configuration file (profile configuration file).
   *
   * @param {IWidgetData} data - widget data
   * @returns void
   */
  moveWidget(data: IWidgetMoveData): void {
    ProfileMaker.moveWidgetInConfig(data);
  }

  /**
   * @removeWidgetFromConfig
   * Remove widget from configuration file (profile configuration file).
   *
   * @param {any} needle - widget name or widget id
   * @returns IWidgetData | boolean
   */
  private removeWidgetFromConfig(needle: any): IWidgetData | boolean {
    const widget: IWidgetData | false = ProfileMaker.removeWidgetFromConfig(needle);
    return widget! ? widget : false;
  }

  /**
   * @removeCustomWidget
   * Remove a custom widget from configuration file (profile configuration file).
   *
   * @param {widgetData} widgetData - widget data
   * @returns void
   */
  removeCustomWidget(widgetData: IWidgetData): void {
    this.removeWidgetByName(widgetData.name);

    WidgetsMaker.removeCustomWidget(widgetData);

    this.saveCustomWidgets();

    this.io.emit("BROADCAST_WIDGET_REMOVED", { name: widgetData.name });
  }

  /**
   * @saveCustomWidget
   * Save a custom widget after importing.
   *
   * @param {any} zipFile - zip file containing a custom widget
   * @returns void
   */
  saveCustomWidget(zipFile: any): void {
    const widgetName: string = WidgetsMaker.saveCustomWidget(zipFile);

    // iniate new widget
    WidgetsMaker.initiateCustomWidget(widgetName);

    this.forceSocketsReload();

    this.saveCustomWidgets().then(() => {
      setTimeout(() => {
        this.reloadConfig();
      }, 1000);
    });
  }

  /**
   * @getModules
   * Return modules
   *
   * @returns IModule[]
   */
  getModules(): IModule[] {
    return ModulesMaker.get();
  }

  /**
   * @forceSocketsReload
   * Force sockets reload, this is triggered when a new widget is added.
   *
   * @returns void
   */
  forceSocketsReload(): void {
    this.io.emit("BROADCAST_MIRROR_RELOAD");

    const sockets: Socket[] = this.getSocketConnections();

    if (sockets.length) {
      sockets.forEach((socket: socketIo.Socket) => {
        socket.disconnect();
      });
    }
  }

  /**
 * @setBackupConfigurationInterval
 * sets up interval to backup the configuration file.
 *
 * @returns void
 */
  private setBackupConfigurationInterval(): void {
    Logger.log('[App] - trigger configuration backup function.');

    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    const backupInterval = 600000; // 10 minutes
    this.backupInterval = setInterval(this.createBackup.bind(this), backupInterval);
  }

  /**
   * @removeSocketConnection
   * Removes socket connection
   *
   * @param {string} socketId - socket id
   * @returns void
   */
  removeSocketConnection(socketId: string): void {
    this.socketConnections = this.socketConnections.filter((socket: SocketIO.Socket) => socket.id !== socketId);
  }

  /**
   * @saveCustomWidgets
   * Save custom widget
   *
   * @returns Promise<any>
   */
  saveCustomWidgets(): Promise<any> {
    this.config.customWidgets = WidgetsMaker.getCustomWidgetsSimplified();

    return this.saveConfig().then(() => {
      Logger.log("[Config] - Saved custom widgets.");
    });
  }

  /**
   * @requestUpdate
   * Request latest version for update process.
   *
   * @returns void
   */
  requestUpdate(): void {
    this.fetchLastVersion().then((data) => {
      const version = {
        current: this.config.version,
        latest: data.version,
      };

      this.io.emit("BROADCAST_UPDATE_VERSIONS", version);
    }).catch(() => {
      this.io.emit("BROADCAST_UPDATE_VERSIONS", { error: true, msg: "Unable to reach." });
    });
  }

  /**
   * @fetchLastVersion
   * Fetch latest version
   *
   * @returns Promise<any>
   */
  private fetchLastVersion(): Promise<any> {
    return new Promise((resolve, reject) => {
      request("https://senses-smartmirror.com/version/version.txt", { json: true, strictSSL: false }, (err, res, body) => {
        if (body && body.version) {
          resolve(body);
        } else {
          Logger.error(body);
          reject({ error: 'version_not_known' });
        }
      });
    });
  }

  /**
   * @getInternetEndpoints
   * Return internet endpoints
   *
   * @returns Promise<any>
   */
  async getInternetEndpoints(): Promise<any> {
    const endpoints = await wifi.scan();
    const currentConnection = await wifi.getCurrentConnections();

    if (!endpoints) {
      Logger.error('[App] - Failed to scan for wifi endpoints');
    }

    if (!currentConnection || !currentConnection.length) {
      Logger.error('[App] - Failed to get current WIFI / Network connection')
    }

    this.io.emit("BROADCAST_INTERNET_DATA", { endpoints, currentConnection });
  }

  /**
   * @testCurrentInternetConnection (async)
   * Test current internet connection
   *
   * @returns Promise<any>
   */
  async testCurrentInternetConnection(): Promise<any> {
    let currentConnection = await wifi.getCurrentConnections();

    if (!currentConnection.length) {
      network.get_active_interface((err: any, obj: any) => {
        currentConnection = obj;
      });
    }

    if (!currentConnection.length) {
      const data = {
        title: "The <strong>Smart Mirror</strong> is not connected to the internet."
      }
      this.io.emit('PUSH_NOTIFICATION', data);
      Logger.error('[App] - No active internet connection!');
    }

  }

  /**
   * @requestWifiConnect (async)
   * Request wifi connect
   *
   * @param {IconnectData} data - new connection data
   * @returns Promise<any>
   */
  async requestWifiConnect(data: IConnectData): Promise<any> {
    const { ssid, password } = data;

    const result = await wifi.connect({ ssid, password });

    if (result && (result.includes('Error') || result.includes('3900'))) {
      Logger.log('[App] - Incorrect password for wifi connection');
      this.io.emit("BROADCAST_NEW_CONNECTION_STATUS", { error: 'incorrect' });
    } else {
      Logger.log('[App] - Switched WIFI endpoint / connection');
      this.io.emit("BROADCAST_NEW_CONNECTION_STATUS", { success: true });
    }
  }
}

export default SmartMirror;
