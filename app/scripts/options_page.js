(function() {
    "use strict";
    'use strict';

    var _settings = require('./content/settings.js');

    var _settings2 = _interopRequireDefault(_settings);

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    $(document).ready(function () {

      function _onkeychangetrue() {
        /*jshint validthis:true */
        var key = $(this).attr('id');
        if ($(this).is(':checked')) {
          _settings2.default.saveSetting(key, true);
        } else {
          _settings2.default.saveSetting(key, false);
        }
      }

      function _onkeychangefalse() {
        /*jshint validthis:true */
        var key = $(this).attr('id');
        var value = $(this).val();
        _settings2.default.saveSetting(key, value);
      }

      for (var key in settings) {

        //if key is boolean -> dealing with checkbox
        if (typeof settings[key] === 'boolean') {
          $('#' + key).prop('checked', settings[key]);

          //set listener for changes and persists them
          $('#' + key).change(_onkeychangetrue);
        } else {
          //key is string -> dealing with text/number input
          $('#' + key).val(settings[key]);

          //set listener for change
          $('#' + key).change(_onkeychangefalse);
        }
      }
    });
}).call(this);