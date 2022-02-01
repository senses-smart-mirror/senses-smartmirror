import fs from 'fs';
import path from 'path';

import { IModule } from "../types/Module";

import MODULES from '../constants/modules';
import { IBasicSetting, ISetting } from '../types/Setting';

class ModulesMaker {
  private static modules: IModule[] = [];
  private static activeModules: IModule[] = [];

  /*
  * initate all modules
  */
  static initiateModules() {
    const modules: string[] = MODULES;

    Logger.log('[Modules] - Loading all installed modules:')

    modules.forEach((module: string) => {
      let mod: IModule = {
        name: module,
        enabled: false
      }

      mod = this.load(mod);

      Logger.log(`[Modules] ---> Module: [${mod.name}] initiated.`)

      this.modules.push(mod);
    });
  }

  /*
  *
  * saveSettings
  *
  */
  static saveSettings(moduleData: IModule): IModule | boolean {
    let mod: IModule[] | IModule;

    if ( ! moduleData.started ) {
      mod = this.modules.filter((mod => mod.name === moduleData.name));
    } else {
      mod = this.activeModules.filter((mod => mod.name === moduleData.name));
    }

    if (mod && mod[0]) {
      mod = mod[0];

      mod.settings = this.mergeSettings(mod.settings, moduleData.settings);

      if ( mod.class && typeof mod.class.saveSettings === 'function') {
        mod.class.saveSettings(moduleData.settings);
      }

      return mod;
    }

    return false;
  }

  static setSettings() {

  }

  static getFormattedSettings(module: IModule): IBasicSetting[] {
    return this.formatSettings(module.settings);
  }

  /*
  * returns settings formatted to only name and value
  */
  static formatSettings(settings: ISetting[]): IBasicSetting[] {
    let retVal: IBasicSetting[] = [];
    settings.forEach((s: ISetting) => {
      if (!s.displayOnly) {
        retVal.push({
          name: s.name,
          value: s.value
        });
      }
    });
    return retVal;
  }

  /*
  * merge settings
  */
  static mergeSettings(settingsModel: ISetting[], newSettings: ISetting[]): ISetting[] {
    const settings = [...settingsModel];

    settings.forEach((setting: ISetting) => {
      newSettings.forEach((newSetting: ISetting) => {
        if (setting.name == newSetting.name) {
          setting.value = newSetting.value;
        }
      });
    });

    return settings;
  }

  /*
  * starts all modules
  */
  static startModules(modules: IModule[]) {
    modules.forEach((module: IModule) => {
      if (module.enabled) {
        const filter: IModule[] = this.modules.filter((mod => mod.name === module.name));
        let _mod: IModule;

        if (filter.length) {
          _mod = filter[0];
        } else {
          Logger.error(`[Modules] - Module: ${module.name} not found.`)
          return;
        }

        this.startModule(_mod, module.settings);
      }
    });
  }

  /*
  * start a module
  */
  static startModule(module: IModule, moduleSettings: IBasicSetting[] = []): void {
    const moduleClass = new module.fn();

    if (typeof moduleClass.init === 'function' && typeof moduleClass.start === 'function') {

      try {
        moduleClass.init();
      } catch(e) {
        Logger.error(`[Modules] ---> Module: [${module.name}] cannot initiated.`, e);
      }

      if ( moduleClass.saveSettings ) {
        moduleClass.saveSettings(moduleSettings);
      }

      try {
        moduleClass.start();
      } catch(e) {
        Logger.error(`[Modules] ---> Module: [${module.name}] cannot be started properly.`, e);
      }

      Logger.log(`[Modules] ---> Module: [${module.name}] started.`);

      // save module
      module.started = true;
      module.enabled = true;
      module.class = moduleClass;
      this.activeModules.push(module);
    } else {
      Logger.error('[Modules] - Module: doesn\'t have a "init" or "start" function.', module.name);
    }
  }

  /*
  *
  */
  static load(module: IModule): IModule {
    let modulePath = path.join(__dirname, `../modules/${module.name}/${module.name}.js`);
    let moduleConfigPath = path.join(__dirname, `../modules/${module.name}/${module.name}-config.js`);
    let moduleFn: any;
    let moduleConfig: any;

    if (fs.existsSync(modulePath)) {
      moduleFn = require(modulePath);
    } else {
      modulePath = modulePath.replace('.js', '.ts');
      fs.existsSync(modulePath)
      moduleFn = require(modulePath);
    }

    if (fs.existsSync(moduleConfigPath)) {
      moduleConfig = require(moduleConfigPath);
    } else {
      moduleConfigPath = moduleConfigPath.replace('.js', '.ts');
      fs.existsSync(moduleConfigPath)
      moduleConfig = require(moduleConfigPath);
    }

    module.fn = moduleFn;
    module.icon = moduleConfig.icon;
    module.settings = moduleConfig.settings || [];

    return module;
  }

  /*
  * toggle module on or off
  */
  static toggleModule(moduleName: string): IModule | { error: string } {
    const filter: IModule[] = this.modules.filter((mod => mod.name === moduleName));

    if (filter.length) {
      let module = filter[0];

      module.enabled = !module.enabled;
      module.started = !module.started;

      // check if module is already active and loaded,
      // otherwise load the module and active + start it.
      const isModuleActive = this.activeModules.filter((mod => mod.name === moduleName));
      if (!isModuleActive.length) {
        this.startModule(module);
        return module;
      }

      this.activeModules.forEach(_module => {
        if (_module.name === moduleName) {

          if (!module.enabled) {
            if (typeof _module.class.stop === 'function') {
              _module.class.stop();
              Logger.log(`[Modules] - Module: [${moduleName}] stopped`);
            }
          }

          if (module.enabled) {
            try {
              _module.class = new module.fn();
              _module.class.init();
              _module.class.start();
              Logger.log(`[Modules] - Module: [${moduleName}] started`);
            } catch(e) {
              Logger.error('[Modules] - cannot start:', moduleName);
              Logger.error(e);
            }
          }
        }
      });

      return module;
    } else {
      Logger.error('[Modules] - Module not found: ', moduleName);
      return { "error": 'module_not_found' }
    }
  }

  /*
  *
  */
  static get(): IModule[] {

   let modules = this.modules.map(mod => {
      const activeMod = this.activeModules.find(_mod => _mod.name === mod.name);

      if ( activeMod ) {
        return {
          ...mod,
          settings: this.mergeSettings(activeMod.settings, activeMod.class.settings)
        }
      } else {
        return mod;
      }
   });

    modules = modules.map((module: IModule) => {
      delete module.class;
      return module;
    });

    return modules;
  }
}

export default ModulesMaker;
