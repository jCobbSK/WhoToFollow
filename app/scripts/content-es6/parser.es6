var Settings = require('./settings.js');
var Cache = require('./cache.js');

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
      lastSeenString, lastSeenTimestamp;
    for (let i=0, len = tweetsElems.length; i < len; i++) {
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
    var result = (Settings.getSetting('ratioSwitched') || Settings.getSetting('seendOffsetSwitched'));

    if (Settings.getSetting('ratioSwitched') && ratio < Settings.getSetting('ratio')) { result = false; }

    if (Settings.getSetting('seendOffsetSwitched') &&
        lastSeenTimestamp &&
        moment().diff(moment(lastSeenTimestamp), 'days') > Settings.getSetting('seenOffset')) {
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
      url: `https://twitter.com/${username}`,
      dataType: 'html',
      success: function(data) {
        callback(data);
      },
      error: function(err) {
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
    parseProfile(username, callback) {
      var user = Cache.getUser(username);
      if (user) {
        callback(user);
        return;
      }

      fetchUserRawData(username, (rawHtml) => {
        var elements = $(rawHtml);

        var tweets = parseLastSeen(elements);
        var followers = parseFollowers(elements);
        var following = parseFollowing(elements);
        var seen = parseLastSeen(elements);
        var highlight = isHighlighting(followers.fullNumber, following.fullNumber, seen.lastSeenTimestamp);

        callback({
          username: username,
          tweets: (Settings.getSetting('tweets')) ? tweets.text : undefined,
          followers: (Settings.getSetting('followers')) ? followers.text : undefined,
          following: (Settings.getSetting('following')) ? following.text : undefined,
          seen: (Settings.getSetting('seen')) ? seen.text : undefined,
          highlight: highlight
        });
      });
    }
  }
}

module.exports = Parser();
