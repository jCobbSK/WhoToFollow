'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Factory function to load and save settings to chrome storage.
*/
function Loader() {

  /**
   * Key under which setting object is saved in chrome storage.
   * @type {String}
   */
  var STORAGE_KEY = 'WTFSettings';

  /**
   * Default settings which are saved if no object is saved in chrome storage.
   * @type {Object}
   */
  var DEFAULT_SETTINGS = {
    'tweets': true,
    'followers': true,
    'following': true,
    'seen': true,
    'ratio': 1.0,
    'ratioSwitched': true,
    'seenOffset': 10,
    'seenOffsetSwitched': true
  };

  /**
   * Actual setting object persisted in chrome storage.
   * @type {Object}
   */
  var settings = null;

  /**
   * Save actual settings attribute object to chrome storage.
   * @return {void}
   */
  function saveSettings() {
    chrome.storage.sync.set({ STORAGE_KEY: settings }, function () {
      console.log('Settings updated');
    });
  }

  //init local settings object
  chrome.storage.sync.get(STORAGE_KEY, function (_settings) {
    if (Object.keys(_settings).length === 0) {
      settings = DEFAULT_SETTINGS;
      saveSettings();
    } else {
      settings = _settings;
    }
  });

  //Use chrome storage listener for changes so it is synced.
  chrome.storage.onChanged.addListener(function (changes) {
    for (key in changes) {
      if (key === STORAGE_KEY) {
        settings = changes[key].newValue;
      }
    }
  });

  return {
    /**
     * Get actual setting object.
     * @param  {Function} callback [setting object]
     * @return {Object} [settings object]
     */

    getSettings: function getSettings() {
      return settings;
    },

    /**
     * Get specific setting.
     * @param  {string} key
     * @return {boolean | number}
     */
    getSetting: function getSetting(key) {
      return settings[key];
    },

    /**
     * Save specific setting.
     * @param  {string} key
     * @param  {boolean | number} value
     * @return {void}
     */
    setSetting: function setSetting(key, value) {
      settings[key] = value;
      saveSettings();
    }
  };
}

exports.default = Loader();
