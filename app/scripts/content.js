'use strict';

var _parser = require('content/parser.js');

var _parser2 = _interopRequireDefault(_parser);

var _formatter = require('content/formatter.js');

var _formatter2 = _interopRequireDefault(_formatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REFRESH_TIME = 2000;

var lastHeight = 0;

/**
 * Check if page changed (expanded => more users were loaded), if so, process them.
 * @return {void}
 */
function processPage() {
  var actualHeight = $('.GridTimeline').height();
  if (lastHeight === actualHeight) {
    return;
  }

  lastHeight = actualHeight;

  processUsers();
}

/**
 * Process users on page.
 * @return {void}
 */
function processUsers() {
  $('.ProfileCard-content').each(function () {
    var _this = this;

    //no user yet -> put loader inside
    _formatter2.default.updateElement(this, null);

    var username = $(this).children('a').attr('href').replace('/', '');

    _parser2.default.parseProfile(username, function (user) {
      _formatter2.default.updateElement(_this, user);
    });
  });
}

//initial processing page
processPage();

//check change every 2 seconds
setInterval(function () {
  processPage();
}, REFRESH_TIME);
