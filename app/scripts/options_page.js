var Options = (function(){

  var settings = null;

  /**
   * Constructor function, initialize settings in chrome storage if it isn't already and initialize DOM.
   */
  var init = (function(){
    chrome.storage.sync.get('WTFsettings', function(setts){
      if ($.isEmptyObject(setts)) {
        settings = {
          'tweets': true,
          'followers': true,
          'following': true,
          'seen': true,
          'ratio': 1,
          'ratioOffset': 0.1,
          'ratioSwitched': true,
          'seenOffset': 10,
          'seenOffsetSwitched': true
        }

        saveSettings();
      } else {
        settings = setts['WTFsettings'];
      }
      initDOM();
    });
  })();


  /**
   * Saves actual settings object.
   */
  var saveSettings = function() {
    chrome.storage.sync.set({'WTFsettings': settings}, function(){
      console.log('Settings updated');
    });
  }

  /**
   * Deals with init of DOM of page. Sets listeners for inputs and updates settings.
   */
  var initDOM = function() {
    $(document).ready(function(){
      for (var key in settings) {

        //if key is boolean -> dealing with checkbox
        if (typeof settings[key] === "boolean") {
          $('#'+key).prop('checked', settings[key]);

          //set listener for changes and persists them
          $('#'+key).change(function(){
            var key = $(this).attr('id');
            if ($(this).is(':checked')) {
              Options.saveSetting(key, true);
            } else {
              Options.saveSetting(key, false);
            }
          });

        } else {
          //key is string -> dealing with text/number input
          $('#'+key).val(settings[key]);

          //set listener for change
          $('#'+key).change(function(){
            var key = $(this).attr('id');
            var value = $(this).val();
            Options.saveSetting(key, value);
          })
        }
      }
    });
  }

  return {

    /**
     * Sets one param in settings and automaticaly sync in chrome storage.
     * @param {string} key - id of input and key of settings object
     * @param {boolean/string} value
     */
    saveSetting: function(key, value) {
      settings[key] = value;
      saveSettings();
    },

    getSettings: function() {
      return settings;
    }
  }
})();


