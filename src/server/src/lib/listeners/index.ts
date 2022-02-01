
import RequestMirrorConfig from './request-mirror-config';
import RequestAddComponent from './request-add-component';
import RequestAfterUpdate from './request-after-update';
import RequestAvailableComponents from './request-available-components';
import RequestCustomWidgets from './request-custom-widgets';
import RequestDefaultSettings from './request-default-settings';
import RequestMoveComponent from './request-move-component';
import RequestRemoveComponent from './request-remove-component';
import RequestSaveComponent from './request-save-component';
import RequestSaveGlobalSettings from './request-save-global-settings';
import RequestUpdate from './request-update';
import RequestComponentModel from './request-component-model';
import RequestRemoveCustomWidget from './request-remove-custom-widget';
import PushNotification from './push-notification';
import requestModules from './request-modules';
import RequestToggleModule from './request-toggle-module';
import SendLog from './sendlog';
import pushMinimalWidgetData from './push-minimal-widget-data';
import createNewProfile from './request-create-new-profile';
import requestProfiles from './request-profiles';
import requestSetActiveProfile from './request-set-active-profile';
import requestRemoveProfile from './request-remove-profile';
import requestInternetEndpoints from './request-internet-endpoints';
import requestWifiConnect from './request-wifi-connect';
import requestSaveProfile from './request-save-profile';
import requestSaveModuleSettings from './request-save-module-settings';
import requestToggleWidgetVisibility from './request-toggle-widget-visibility';

export interface IListener {
  [key: string]: Function;
}

const listeners:IListener = {
  "REQUEST_MIRROR_CONFIG": RequestMirrorConfig,
  "REQUEST_ADD_COMPONENT": RequestAddComponent,
  "REQUEST_AFTER_UPDATE": RequestAfterUpdate,
  "REQUEST_COMPONENT_MODEL": RequestComponentModel,
  "REQUEST_AVAILABLE_COMPONENTS": RequestAvailableComponents,
  "REQUEST_CUSTOM_WIDGETS": RequestCustomWidgets,
  "REQUEST_DEFAULT_SETTINGS": RequestDefaultSettings,
  "REQUEST_MOVE_COMPONENT": RequestMoveComponent,
  "REQUEST_REMOVE_COMPONENT": RequestRemoveComponent,
  "REQUEST_SAVE_COMPONENT": RequestSaveComponent,
  "REQUEST_SAVE_GLOBAL_SETTINGS": RequestSaveGlobalSettings,
  "REQUEST_UPDATE": RequestUpdate,
  "REQUEST_REMOVE_CUSTOM_WIDGET": RequestRemoveCustomWidget,
  "REQUEST_MODULES": requestModules,
  "PUSH_NOTIFICATION": PushNotification,
  "REQUEST_TOGGLE_MODULE": RequestToggleModule,
  "SEND_LOG": SendLog,
  "PUSH_DATA": pushMinimalWidgetData,
  "REQUEST_CREATE_NEW_PROFILE": createNewProfile,
  "REQUEST_PROFILES": requestProfiles,
  "REQUEST_SET_ACTIVE_PROFILE": requestSetActiveProfile,
  "REQUEST_REMOVE_PROFILE": requestRemoveProfile,
  "REQUEST_WIFI_ENDPOINTS": requestInternetEndpoints,
  "REQUEST_WIFI_CONNECT": requestWifiConnect,
  "REQUEST_SAVE_PROFILE": requestSaveProfile,
  "REQUEST_SAVE_MODULE_SETTINGS": requestSaveModuleSettings,
  "REQUEST_TOGGLE_WIDGET_VISIBILITY": requestToggleWidgetVisibility
}

export default listeners;