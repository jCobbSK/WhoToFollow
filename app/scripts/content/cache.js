/**
 * Cache module to cache already fetched data of users.
 */
function Cache() {

  /**
   * User data objects.
   * @type {Array of Objects}
   */
  var usersStorage = [];

  function getUser(username) {
    return usersStorage.find((user) => user.username === username);
  }

  return {
    /**
     * Add user to cache.
     * @param {User object} user [user object, username is required attribute]
     * @return {boolean} [was actual added]
     */
    addUser(user) {
      if (getUser(user.username)) {
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
    getUser(username) {
      getUser(username);
    }
  }
}

export default Cache();
