var Settings = require('./content/settings.js');

$(document).ready(function(){

  function _onkeychangetrue() {
    /*jshint validthis:true */
    var key = $(this).attr('id');
    if ($(this).is(':checked')) {
      Settings.saveSetting(key, true);
    } else {
      Settings.saveSetting(key, false);
    }
  }

  function _onkeychangefalse() {
    /*jshint validthis:true */
    var key = $(this).attr('id');
    var value = $(this).val();
    Settings.saveSetting(key, value);
  }

  for (var key in settings) {

    //if key is boolean -> dealing with checkbox
    if (typeof settings[key] === 'boolean') {
      $('#'+key).prop('checked', settings[key]);

      //set listener for changes and persists them
      $('#'+key).change(_onkeychangetrue);

    } else {
      //key is string -> dealing with text/number input
      $('#'+key).val(settings[key]);

      //set listener for change
      $('#'+key).change(_onkeychangefalse);
    }
  }

});
