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
      $(element).find('.ProfileCard-userFields').append(
        `<div class="WTF-loader"><img src="${url}"></div>`
      );
    }
  }

  /**
   * Hide inserted loader.
   * @param  {jQuery element} element
   * @return {void}
   */
  function hideLoader(element) {
    if ($(element).remove('.WTF-loader'));
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
      return ``;
    }
    var link = ``;
    if (showLink) {
      link = `/${username}`;
      if (linkPostfix) {
        link += `/${linkPostfix}`;
      }
    }

    if (value) {
      return `<li><a href="${link}">
                    <div class="upper-label u-textUserColor">${key.toUpperCase()}</div>
                    <div class="label">${value}</div></a>
              </li>`;
    } else {
      return ``;
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
    var final = `
      <ul class="WTF">
        ${composeDataItem('followers', user.followers, username, 'followers', true)}
        ${composeDataItem('following', user.following, username, 'following', true)}
        ${composeDataItem('tweets', user.tweets, username, '', true)}
        <br>${composeDataItem('seen', user.seen, username, '', false)}
      </ul>
    `;

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
    updateElement(element, user) {
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
    isRendered(element) {
      return $(element).find('.WTF').length !== 0;
    }
  }
}

export default Formatter();
