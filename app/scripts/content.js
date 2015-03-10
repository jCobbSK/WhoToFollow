/**
 * File running on addressed pages defined in manifest.json
 */
var WhoToFollow = (function(){

  /********* PRIVATE ATTRIBUTES **********/
  /**
   * Cached users is object where usernames are keys and values are objects with username,following and followers
   */
  var cachedUsers = {};

  /********* PRIVATE METHODS *************/

  /**
   * Parsing method of followers/following, ADDITIONALY RESULT ARE CACHED INSIDE cachedUsers
   * @param htmlString
   * @return {Object} - object with following and followers keys and values
   */
  var parseProfilePage = function(username, htmlString) {
    //TODO parse correct data from htmlString and return object as below
    return {
      username: username,
      followers: 1,
      following: 10
    }
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
        callback(user.following, user.followers);
        return;
      }

      $.ajax({
        method: 'GET',
        url: 'https://twitter.com/'+username,
        dataType: 'html',
        success: function(data) {
          console.log('success');
          var result = parseProfilePage(username, data);
          if (result) {
            callback(result.following, result.followers);
          } else {
            callback('unknown', 'unknown');
          }
        },
        error: function(err) {
          console.log(err);
          callback('error', 'error');
        }
      });
    }
  }
})();

$(document).ready(function(){

  var initHeight = 0;

  var updateData = function() {
    $('.ProfileCard-content').each(function(){
      var username = $(this).children('a').attr('href');
      username = username.replace('/','');
      var self = this;

      WhoToFollow.getData(username, function(following, followers){
        //TODO append data only if doesn't exists
        $(self).find('.ProfileNameTruncated-link').append(following+" / "+followers);
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