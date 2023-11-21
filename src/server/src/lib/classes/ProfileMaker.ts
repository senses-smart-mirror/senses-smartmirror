import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";

import { IWidgetData } from "../types/WidgetData";
import { IColumn, IConfig } from "../types/Config";
import { IProfile } from "../types/Profile";
import { IProfileConfig } from "../types/Profile-config";
import { IBasicSetting } from "../types/Setting";
import { IWidgetMoveData } from "../types/WidgetMoveData";

const DEFAULT_PROFILE_CONTENT = {
  data: [{
    id: 1,
    topComponents: [],
    bottomComponents: []
  }, {
    id: 2,
    topComponents: [],
    bottomComponents: []
  }, {
    id: 1000,
    rowSettings: { class: "overlay" },
    topComponents: [],
    bottomComponents: []
  }]
};

// setup configuration path
let CONFIG_PATH = path.join(__dirname, '../../../../config');
if (!fs.existsSync(CONFIG_PATH)) {
  CONFIG_PATH = path.join(__dirname, '../../../config');
}

export default class ProfileMaker {
  static profiles: IProfile[] = [];
  static activeProfile: IProfile;

  /*
  * Load profiles from configuration file
  */
  static loadProfiles(config: any): void {
    // @ts-ignore
    Logger.log('[Profiles] - Loading profiles...');

    this.profiles = [...config.profiles];

    if ( ! this.profiles ) {
      // @ts-ignore
      Logger.error('[Profiles] - error: no profiles found.');
      process.exit();
    }

    // @ts-ignore
    Logger.log(`[Profiles] - Found ${this.profiles.length} profile(s)`);

    // set active profile
    const profile: IProfile[] = this.profiles.filter(item => item.active);

    if (profile && profile[0]) {
      this.activeProfile = profile[0];
      // @ts-ignore
      Logger.log('[Profiles] - Active profile:', this.activeProfile.label);
    } else {
      // @ts-ignore
      Logger.error('[Profiles] - No profile found. Active profile not set, something is wrong with the configuration file.');
    }

    this.loadAllProfileConfigurationFiles();
  }

  /*
  *
  */
  static loadAllProfileConfigurationFiles() {
    this.profiles = this.profiles.map((profile: IProfile) => {
      profile.columns = this.loadConfigurationFile(profile);
      return profile;
    });
  }

  /*
  *
  */
  static loadConfigurationFile(profile: IProfile): IColumn[] {
    const fileName = `${profile.name}-profile.json`;
    let profileContents: IProfileConfig;

    if (fs.existsSync(path.join(CONFIG_PATH, fileName))) {
      // @ts-ignore
      Logger.log(`[Profiles] - Loading ${fileName}`);

      profileContents = JSON.parse(
        // @ts-ignore
        fs.readFileSync(path.join(CONFIG_PATH, fileName)),
        "utf-8"
      );

      return profileContents.data;

    } else {
      // @ts-ignore
      Logger.error('[Profiles] - Profile configuration file not found for: ', fileName);
      return [];
    }
  }

  /*
  *
  */
  static loadActiveProfileConfiguration() {
    const activeProfile = this.getActiveProfile();

    activeProfile.columns = this.loadConfigurationFile(activeProfile);
  }


  /*
  * Returns active profile
  */
  static getActiveProfile(): IProfile {
    return this.profiles.filter(item => item.active)[0];
  }


  /*
  * return active profile without the columns data.
  */
  static getActiveProfileWithoutColumns(): IProfile {
    const {columns, ...profile} = this.getActiveProfile();
    return profile;
  }

  /*
  * set a profile to active
  */
  static setProfileActive(profileName: string) {
    const profiles = this.profiles.map(profile => {
      profile.active = profileName === profile.name ? true : false;
      return profile;
    });

    this.profiles = [...profiles];
  }

  /*
  * Returns profiles
  */
  static getProfiles(withColumns: boolean = false) {
    if ( withColumns ) {
      return this.profiles;
    }

    return this.profiles.map(({ columns, ...profile }) => profile);
  }


  /*
  * save profile data
  */
  static saveProfileData(profile: IProfile): void {
    this.updateProfile(profile);
  }

  /*
  *
  */
  static updateProfile(profile: IProfile): void {
    this.profiles = this.profiles.map((prof:IProfile) => {
      if ( profile.name === prof.name ) {
        return { ...prof, ...profile }
      } else {
        return prof;
      }
     });
  }

  /*
  * remove profile from list
  */
 static removeProfileFromList(profileName: string): void {
   this.profiles = this.profiles.filter(item => item.name !== profileName);
 }

  /*
  * get profile by name
  */
   static getProfileByName(profileName: string): IProfile | undefined {
    const profile = this.profiles.filter(item => item.name === profileName);

    if ( profile && profile[0] ) {
      return profile[0];
    } else {
      // TODO Error?
    }
   }

  /*
  * save active profile
  */
 static saveActiveProfile() {
    const profile = this.getActiveProfile();
    return this.saveProfile(profile);
 }


  /*
  * save profile
  */
  static saveProfile(profile: IProfile) {
    // @ts-ignore
    Logger.log('[Profiles] - Saving profile:', profile.name);

    if ( profile.name === 'default' ) {
      // @ts-ignore
      Logger.log('[Profiles] - default profile is active, not saved.')
      return Promise.resolve();
    }

    let contents = `${JSON.stringify({ data: profile.columns }, null, 2)}`;

    return new Promise<any>((resolve, reject) => {
      fs.writeFile(
        path.join(CONFIG_PATH, `${profile.name}-profile.json`),
        contents,
        (err: any) => {
          // @ts-ignore
          Logger.log("[Profiles] - Saved profile configuration");
          resolve(true);

          if (err) {
            // @ts-ignore
            Logger.error('[Profiles] - error: failed to save profile configuration file.')
            reject();
          }
        }
      );
    });
  }

  /*
  * update widget
  */
  static updateWidgetInConfig(widgetData: IWidgetData, settings: IBasicSetting[]) {
    const profile = this.getActiveProfile();
    let result: IWidgetData;

    profile.columns.forEach((col: IColumn) => {
      // TODO: remove lodash.
      let c = _.find(col.topComponents, { id: widgetData.id });

      if (c) {
        result = c;
      } else {
        c = _.find(col.bottomComponents, { id: widgetData.id });
        if (c) {
          result = c;
        }
      }
    });

    if (!result) {
      // @ts-ignore
      Logger.error('[Profiles] - Cannot update widget configuration in profile file: ', widgetData.name, profile.name)
      return;
    } else {
      // get formatted settings
      result.settings = settings;
    }
  }

  /*
  *
  */
  static removeWidgetFromConfig(needle: object): IWidgetData | boolean {
    const profile = this.getActiveProfile();

    const removedWidget = this.removeWidgetFromConfigArray(profile, needle);

    return removedWidget;
  }

  /*
  * remove widgets from all profile configuration files
  */
  static removeWidgetFromAllProfiles(needle: object): void {

    const profiles = this.getProfiles(true);

    profiles.forEach((profile: IProfile) => {
      this.removeWidgetFromConfigArray(profile, needle);

      this.saveProfile(profile);
    });
  }


  /*
  * remove widget from config array
  */
  static removeWidgetFromConfigArray(profile: IProfile, needle: object): IWidgetData | boolean {
    let widgetData: IWidgetData[];

    if ( ! profile.columns ) return false;

    profile.columns!.forEach((col) => {
      let i = _.findIndex(col.topComponents, needle);

      if (i >= 0) {
        widgetData = col.topComponents.splice(i, 1);
      } else {
        i = _.findIndex(col.bottomComponents, needle);
        if (i >= 0) {
          widgetData = col.bottomComponents.splice(i, 1);
        }
      }
    });

    return widgetData! && widgetData[0] ? widgetData[0] : false

  }

  /*
  *
  */
  static moveWidgetInConfig(data: IWidgetMoveData): void {
    const profile = this.getActiveProfile();
    const widget = this.removeWidgetFromConfig({ id: data.widgetId });

    const column = _.find(profile.columns, {
      id: data.toColumnId,
    });

    if (column && widget) {
      column[data.toAlignKey].splice(data.toPositionId, 0, widget);
    }
  }

  /*
  * create new profile
  */
  static async createNewProfile(profileName: string): Promise<IProfile | false> {
    // @ts-ignore
    Logger.log('[Profiles] - Creating new Profile:', profileName);

    const alreadyExist = this.profiles.filter(item => item.name === profileName.toLowerCase().replace(' ', '-'));

    if (alreadyExist && alreadyExist[0]) {
      // @ts-ignore
      Logger.error('[Profiles] - Profile with this name already exists:', profileName);
      return false;
    }

    const fileName = `${profileName.toLowerCase().replace(' ', '-')}-profile.json`;
    const contents = this.generateProfileContent();

    const result = await this.saveNewProfile(fileName, contents);

    if (result) {
      const newProfileObject = this.createNewProfileObject(profileName, contents);
      this.setNewProfile(newProfileObject);
      return newProfileObject;
    }

    return false;
  }

  /*
  * create new profile object
  */
  static createNewProfileObject(profileName: string, columns: any): IProfile {
    return { name: profileName.toLowerCase().replace(' ', '-'), label: profileName, active: false, columns: columns.data }
  }

  /*
  * store new profile in profiles list
  */
  static setNewProfile(profile: IProfile) {
    this.profiles.push(profile);
  }

  /*
  * remove profile based on profile name
  */
  static removeProfile(profileName: string) {
    this.profiles = this.profiles.filter((item: IProfile) => item.name !== profileName);

    this.removeProfileConfigurationFile(profileName);
  }

  /*
  * remove profile configuration file
  */
  static removeProfileConfigurationFile(fileName: string): void {
    const filePath:string = path.join(CONFIG_PATH, `${fileName}-profile.json`);

    try {
      fs.unlinkSync(filePath)
      // @ts-ignore
      Logger.log('[Profiles] - Profile configuration file removed:', fileName);
    } catch(err) {
      // @ts-ignore
      Logger.error('[Profiles] - Profile configuration file not removed', err);
    }
  }

  /*
  * save new profile json file
  */
  static saveNewProfile(fileName: string, contents: object): Promise<any> {
    const stringifiedContent = JSON.stringify(contents);

    return new Promise<any>((resolve, reject) => {
      fs.writeFile(
        path.join(CONFIG_PATH, fileName),
        stringifiedContent,
        (err: any) => {
          // @ts-ignore
          Logger.log("[Profiles] - Saved new profile json file:", fileName);
          resolve(contents);

          if (err) {
            // @ts-ignore
            Logger.error('[Profiles] - Error saving profile json file:', fileName);
            reject();
          }
        }
      );
    });
  }

  /*
  *
  */
  static generateProfileContent(): object {
    return DEFAULT_PROFILE_CONTENT;
  }
}
