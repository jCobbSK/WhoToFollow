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
   * @return {Object} - object with following,followers and tweets keys and values
   */
  var parseProfilePage = function(username, htmlString) {

    var elements = $(htmlString);
    var tweets = $('.ProfileNav-item--tweets .ProfileNav-value', elements).html();
    var following = $('.ProfileNav-item--following .ProfileNav-value', elements).html();;
    var followers = $('.ProfileNav-item--followers .ProfileNav-value', elements).html();;

    var result = {
      username: username,
      followers: followers,
      following: following,
      tweets: tweets
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

      WhoToFollow.getData(username, function(user){
        if (!user)
          return;
        if ($(self).find('.WTF').length == 0) {
          var following = "<li class='WTF-main-list'><div class='WTF-upper-label u-textUserColor'>FOLLOWING</div><div class='WTF-main-label'>"+user.following+"</div></li>";
          var followers = "<li class='WTF-main-list'><div class='WTF-upper-label u-textUserColor'>FOLLOWERS</div><div class='WTF-main-label'>"+user.followers+"</div></li>";
          var tweets = "<li class='WTF-main-list'><div class='WTF-upper-label u-textUserColor'>TWEETS</div><div class='WTF-main-label'>"+user.tweets+"</div></li>";
          var final = "<ul class='WTF'>"+tweets+following+followers+"</ul>";
        }
          $(self).find('.ProfileCard-userFields').append(final);
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