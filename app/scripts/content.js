import Parse from './content/parser.js';
import Formatter from './content/formatter.js';

const REFRESH_TIME = 2000;

var lastHeight = 0;

/**
 * Check if page changed (expanded => more users were loaded), if so, process them.
 * @return {void}
 */
function processPage() {
  var actualHeight = $('.GridTimeline').height();
  if (lastHeight === actualHeight) { return; }

  lastHeight = actualHeight;

  processUsers();
}

/**
 * Process users on page.
 * @return {void}
 */
function processUsers() {
  $('.ProfileCard-content').each(function(){

    //no user yet -> put loader inside
    Formatter.updateElement(this, null);

    let username = $(this).children('a').attr('href').replace('/', '');

    Parser.parseProfile(username, (user) => {
      Formatter.updateElement(this, user);
    });
  });
}

//initial processing page
processPage();

//check change every 2 seconds
setInterval(() => {
  processPage();
}, REFRESH_TIME);
