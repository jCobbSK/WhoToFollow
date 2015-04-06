/**
 * File running on addressed pages defined in manifest.json
 */
var WhoToFollow = (function(){

  //constructor, initialize settings from chrome storage
  (function init(){
    chrome.storage.sync.get('WTFsettings', function(setts){
      if (setts['WTFsettings'])
        settings = setts['WTFsettings'];
      else
        settings = {
          'tweets': true,
          'followers': true,
          'following': true,
          'seen': true,
          'ratio': 1.0,
          'ratioSwitched': true,
          'seenOffset': 10,
          'seenOffsetSwitched': true
        }
    });
  })();

  /********* PRIVATE ATTRIBUTES **********/
  /**
   * Cached users is object where usernames are keys and values are objects with username,following and followers
   */
  var cachedUsers = {};

  /**
  * Settings object set by public method when ready
  */
  var settings = {};

  /********* PRIVATE METHODS *************/

  /**
   * Parsing method of followers/following, ADDITIONALY RESULT ARE CACHED INSIDE cachedUsers
   * @param htmlString
   * @return {Object} - object with following,followers and tweets keys and values
   */
  var parseProfilePage = function(username, htmlString) {

    var elements = $(htmlString);
    var tweets = settings['tweets'] ? $('.ProfileNav-item--tweets .ProfileNav-value', elements).html() : false;
    var following = settings['following'] ? $('.ProfileNav-item--following .ProfileNav-value', elements).html() : false;
    var followers = settings['followers'] ? $('.ProfileNav-item--followers .ProfileNav-value', elements).html() : false;
    if (settings['seen']) {
      var timeElem = $($('.Grid .js-short-timestamp', elements)[0]);
      var lastSeenString = timeElem.html();
      var lastSeenTimestamp = timeElem.data('time');
    } else {
      var lastSeenString = false;
    }

    //default highlighting is true
    var isHighlighting = true;

    //all conditions for highlighting, if any is false the result is false
    var ratio = following / followers;
    if (settings['ratioSwitched'] && settings['ratio'] > ratio) {
      isHighlighting = false;
    }

    if (settings['seenOffsetSwitched'] && lastSeenTimestamp &&
      lastSeenTimestamp > ((Date.now() / 1000) - (settings['seenOffset'] * (24*3600)))) {
        isHighlighting = false;
    }

    var result = {
      username: username,
      followers: followers,
      following: following,
      tweets: tweets,
      lastSeenString: lastSeenString,
      lastSeenTimestamp: lastSeenTimestamp,
      highlight: isHighlighting
    }

    cachedUsers[username] = result;

    return result;
  };

  return {
    /********* PUBLIC ATTRIBUTES **********/


    /********* PUBLIC METHODS *************/
    /**
     * Get Followers/Following of user defined by username. Getting result may be asynchronous (not in cache) or
     * synchronous (in cached) that is why callback has to be provided.
     * @param {string} username
     * @param {function} callback - manipulation with result
     */
    getData: function(username, callback){
      var user = cachedUsers[username];

      if (user) {
        callback(user);
        return;
      }

      $.ajax({
        method: 'GET',
        url: 'https://twitter.com/'+username,
        dataType: 'html',
        success: function(data) {
          var result = parseProfilePage(username, data);
          if (result) {
            callback(result);
          } else {
            callback(null);
          }
        },
        error: function(err) {
          console.log(err);
          callback(null);
        }
      });
    },

    /**
    * Set settings
    * @param {Object} settings - settings from Options object
    */
    setSettings: function(settings) {
      settings = settings;
    },


    /**
     * Get settings value
     *
     * @param  {string} key setting's key of value
     * @return {string}     value of setting's key
     */
    getSetting: function(key) {
      return settings[key];
    }
   }
})();

/**
 * We want loader icon instantly when user's block is loaded, it has to be moved out from document.ready because
 * twitter load's user's blocks asynchronous.
 */
var documentReady = false;
var beforeReadyInterval = setInterval(function(){
  if (documentReady)
    clearInterval(beforeReadyInterval);

  $('.ProfileCard-content').each(function() {

    if ($(this).find('.WTF-loader').length == 0) {
      var url = chrome.extension.getURL('images/default.gif');
      $(this).find('.ProfileCard-userFields').append("<div class='WTF-loader'><img src='" + url + "'></div>");
    }
  });
},500);

$(document).ready(function(){

  var initHeight = 0;
  documentReady = true;

  /**
   * Actual manipulating with twitter's DOM. Fetching all tiles, getting info on users and show it.
   */
  var updateData = function() {
    $('.ProfileCard-content').each(function(){

      if ($(this).find('.WTF-loader').length == 0) {
        var url = chrome.extension.getURL('images/default.gif');
        $(this).find('.ProfileCard-userFields').append("<div class='WTF-loader'><img src='"+url+"'></div>");
      }

      var username = $(this).children('a').attr('href');
      username = username.replace('/','');
      var self = this;

      WhoToFollow.getData(username, function(user){
        if (!user)
          return;
        //dont update if it is already rendered
        if ($(self).find('.WTF').length == 0) {
          $(self).find('.WTF-loader').addClass('WTF-hidden');
          var followers = user.followers ? "<li class='WTF-main-list'><a class='WTF-link' href='/"+user.username+"/followers'><div class='WTF-upper-label u-textUserColor'>FOLLOWERS</div><div class='WTF-main-label'>"+user.followers+"</div></a></li>" : "";
          var following = user.following ? "<li class='WTF-main-list'><a class='WTF-link' href='/"+user.username+"/following'><div class='WTF-upper-label u-textUserColor'>FOLLOWING</div><div class='WTF-main-label'>"+user.following+"</div></a></li>" : "";
          var tweets = user.tweets ? "<li class='WTF-main-list'><a class='WTF-link' href='/"+user.username+"'><div class='WTF-upper-label u-textUserColor'>TWEETS</div><div class='WTF-main-label'>"+user.tweets+"</div></a></li>" : "";
          var lastSeen = user.lastSeenString ? "<br><li class='WTF-main-list WTF-second-row'><div class='WTF-upper-label u-textUserColor'>SEEN</div><div class='WTF-main-label'>"+user.lastSeenString+"</div></li>" : "";
          var final = "<ul class='WTF'>"+tweets+following+followers+lastSeen+"</ul>";
        }
        $(self).find('.ProfileCard-userFields').append(final);

        //set highlighting
        if (user.highlight) {
          $(self).parent().addClass('WTF-highlight');
        }

      });
    });
  };

  //check every 2secs if main container's height didn't changed, if so, refresh data
  setInterval(function(){
    var actualHeight = $('.GridTimeline').height();
    if (initHeight == actualHeight)
      return;

    initHeight = actualHeight;
    updateData();
  }, 2000);



});
