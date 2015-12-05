"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Cache module to cache already fetched data of users.
 */
function Cache() {

  /**
   * User data objects.
   * @type {Array of Objects}
   */
  var usersStorage = [];

  function _getUser(username) {
    return usersStorage.find(function (user) {
      return user.username === username;
    });
  }

  return {
    /**
     * Add user to cache.
     * @param {User object} user [user object, username is required attribute]
     * @return {boolean} [was actual added]
     */

    addUser: function addUser(user) {
      if (_getUser(user.username)) {
        return false;
      }

      usersStorage.push(user);
      return true;
    },

    /**
     * Retrieve user by username
     * @param  {String} username
     * @return {User}
     */
    getUser: function getUser(username) {
      _getUser(username);
    }
  };
}

exports.default = Cache();

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Module responsible for manipulation with DOM of twitter content page.
 */
function Formatter() {

  /**
   * Insert loader picture to element.
   * @param  {jQuery element} element
   * @return {void}
   */
  function insertLoader(element) {
    if ($(element).find('.WTF-loader').length === 0) {
      var url = chrome.extension.getURL('images/default.gif');
      $(element).find('.ProfileCard-userFields').append('<div class="WTF-loader"><img src="' + url + '"></div>');
    }
  }

  /**
   * Hide inserted loader.
   * @param  {jQuery element} element
   * @return {void}
   */
  function hideLoader(element) {
    if ($(element).remove('.WTF-loader')) ;
  }

  /**
   * Composing one data value item inserted.
   * @param  {String} key   [Text as label (FOLLOWERS | FOLLOWING | TWEETS | SEEN)]
   * @param  {String} value
   * @param  {String} username
   * @param  {String} linkPostfix [Link address /username/linkPostfix]
   * @param  {boolean} showLink
   * @return {String}
   */
  function composeDataItem(key, value, username, linkPostfix, showLink) {
    if (key === undefined || value === undefined) {
      return '';
    }
    var link = '';
    if (showLink) {
      link = '/' + username;
      if (linkPostfix) {
        link += '/' + linkPostfix;
      }
    }

    if (value) {
      return '<li><a href="' + link + '">\n                    <div class="upper-label u-textUserColor">' + key.toUpperCase() + '</div>\n                    <div class="label">' + value + '</div></a>\n              </li>';
    } else {
      return '';
    }
  }

  /**
   * Actual logic. Render all user data into element.
   * @param  {jQuery element} element
   * @param  {Object} user
   * @return {void}
   */
  function insertUserData(element, user) {
    hideLoader(element);
    var username = user.username;
    var final = '\n      <ul class="WTF">\n        ' + composeDataItem('followers', user.followers, username, 'followers', true) + '\n        ' + composeDataItem('following', user.following, username, 'following', true) + '\n        ' + composeDataItem('tweets', user.tweets, username, '', true) + '\n        <br>' + composeDataItem('seen', user.seen, username, '', false) + '\n      </ul>\n    ';

    $(element).find('.ProfileCard-userFields').append(final);
  }

  /**
   * Highlight element if criteria are matched.
   * @param  {jQuery element} element
   * @return {void}
   */
  function highlightElement(element) {
    $(element).parent().addClass('WTF-highlight');
  }

  return {
    /**
     * Update DOM of element based on user data. If no user is provided, element
     * is considered loading and loader is showed.
     * @param  {jQuery element} element [manipulated element]
     * @param  {Object} user    [User object with fetched data]
     * @return {void}
     */

    updateElement: function updateElement(element, user) {
      if (user) {
        insertUserData(element, user);
        if (user.highlight) {
          highlightElement(element);
        }
      } else {
        insertLoader();
      }
    },

    /**
     * Are data already rendered in element?
     * @param  {jQuery element} element
     * @return {boolean}
     */
    isRendered: function isRendered(element) {
      return $(element).find('.WTF').length !== 0;
    }
  };
}

exports.default = Formatter;

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _settings = require('./settings.js');

var _settings2 = _interopRequireDefault(_settings);

var _cache = require('./cache.js');

var _cache2 = _interopRequireDefault(_cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Module for actual parsing relevant data from raw profile page.
 */
function Parser() {

  /**
   * Parse number of item from data field in twitter page.
   * e.q. value="88,455 Following" returns 88455
   * @param  {String} value
   * @return {number}
   */
  function parseValue(value) {
    return parseInt(value.replace(',', ''));
  }

  /**
   * Get number of tweets of user.
   * @param  {jQuery DOM elements} elements
   * @return {number}
   */
  function parseTweets(elements) {
    return {
      fullNumber: parseValue($('.ProfileNav-item--tweets a', elements).data('original-title')),
      text: $('.ProfileNav-item--tweets .ProfileNav-value', elements).html()
    };
  }

  /**
   * Get following number of user.
   * @param  {jQuery DOM elements} elements
   * @return {{text: [string], fullNumber: [number]}}
   */
  function parseFollowing(elements) {
    return {
      text: $('.ProfileNav-item--following .ProfileNav-value', elements).html(),
      fullNumber: parseValue($('.ProfileNav-item--following a', elements).data('original-title'))
    };
  }

  /**
   * Get number of followers.
   * @param  {jQuery DOM elements} elements
   * @return {{text: [string], fullNumber: [number]}}
   */
  function parseFollowers(elements) {
    return {
      text: $('.ProfileNav-item--followers .ProfileNav-value', elements).html(),
      fullNumber: parseValue($('.ProfileNav-item--followers a', elements).data('original-title'))
    };
  }

  /**
   * Get last seen date of user.
   * @param  {jQuery DOM elements} elements
   * @return {{text: [string], timestamp: [number]}}
   */
  function parseLastSeen(elements) {
    var tweetsElems = $('.ProfileTweet', elements),
        lastSeenString,
        lastSeenTimestamp;
    for (var i = 0, len = tweetsElems.length; i < len; i++) {
      //if tweet is not retweet or pinned tweet
      if (!$(tweetsElems[i]).data('retweetId') && !$(tweetsElems[i]).hasClass('is-pinned')) {
        timeElem = $($('.js-short-timestamp', tweetsElems[i])[0]);
        lastSeenString = timeElem.html();
        lastSeenTimestamp = timeElem.data('time');
        break;
      }
    }

    return {
      text: lastSeenString,
      timestamp: lastSeenTimestamp
    };
  }

  /**
   * Return if user is highlighted based on followers, following, lastSeen and setting ratio.
   * @param  {number}  followers
   * @param  {number}  following
   * @param  {number} lastSeenTimestamp
   * @return {Boolean}
   */
  function isHighlighting(followers, following, lastSeenTimestamp) {
    var ratio = following / followers;
    var result = _settings2.default.getSetting('ratioSwitched') || _settings2.default.getSetting('seendOffsetSwitched');

    if (_settings2.default.getSetting('ratioSwitched') && ratio < _settings2.default.getSetting('ratio')) {
      result = false;
    }

    if (_settings2.default.getSetting('seendOffsetSwitched') && lastSeenTimestamp && moment().diff(moment(lastSeenTimestamp), 'days') > _settings2.default.getSetting('seenOffset')) {
      result = false;
    }

    return result;
  }

  /**
   * Ajax call for raw user profile page. It is async so result is returned in callback;
   * @param  {String}   username
   * @param  {Function} callback
   * @return {void}
   */
  function fetchUserRawData(username, callback) {
    $.ajax({
      method: 'GET',
      url: 'https://twitter.com/' + username,
      dataType: 'html',
      success: function success(data) {
        callback(data);
      },
      error: function error(err) {
        callback(null);
      }
    });
  }

  return {
    /**
     * Parse data of user based on username. It is async operation so user object
     * is returned in callback.
     * @param  {String} username
     * @param  {Function} callback
     * @return {void}
     */

    parseProfile: function parseProfile(username, callback) {
      var user = _cache2.default.getUser(username);
      if (user) {
        callback(user);
        return;
      }

      fetchUserRawData(username, function (rawHtml) {
        var elements = $(rawHtml);

        var tweets = parseLastSeen(elements);
        var followers = parseFollowers(elements);
        var following = parseFollowing(elements);
        var seen = parseLastSeen(elements);
        var highlight = isHighlighting(followers.fullNumber, following.fullNumber, seen.lastSeenTimestamp);

        callback({
          username: username,
          tweets: _settings2.default.getSetting('tweets') ? tweets.text : undefined,
          followers: _settings2.default.getSetting('followers') ? followers.text : undefined,
          following: _settings2.default.getSetting('following') ? following.text : undefined,
          seen: _settings2.default.getSetting('seen') ? seen.text : undefined,
          highlight: highlight
        });
      });
    }
  };
}

exports.default = Parser();

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
