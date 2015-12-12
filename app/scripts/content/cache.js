(function() {
    "use strict";
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
}).call(this);