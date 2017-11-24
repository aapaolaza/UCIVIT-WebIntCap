

/**
   * By default, no cookie disclaimer will be shown.
   * If necessary, set `window.isDOMrecorded` to true
   */
var showCookieDisclaimer = false;
if (window.cookieDisclaimerRequired) showCookieDisclaimer = true;

const cookieRejection = 'captureRejection';
const sessionIDCookieName = 'ucivitID';

/**
 * List of permission sensitive Web sites.
 * If permission is necessary, this Web sites will require further caution
 */
const sensitiveWebs = [10008, 20002, 20006];

// ////////////////////////////////////////////////////////////////////////
// //////////////////////COOKIE DISCLAIMER/////////////////////////////////
// ////////////////////////////////////////////////////////////////////////

/** I have to include two different cookie policy disclaimers
  * A) the normal cookie approach. Check for regular cookies:
  *  - if they exist, start capturing
  *  - If there are no cookies, then we need to ask for permission to deploy cookie, show the disclaimer and wait for implicit consent
  * 
  * B) The alternative approach giving the alternative to opt-out.
  * We start capturing from the start, but giving them the option to opt-out of the capture.
  */
function cookieApproachSelector() {
  var websiteIsSensitive = false;
  // First we test if the Web application is in the list of information sensitive Web applications
  for (i = 0; i < sensitiveWebs.length; i++) {
    if (websiteID == sensitiveWebs[i]) {
      websiteIsSensitive = true;
    }
  }

  /* If the Website is sensitive, we follow the alternative approach giving the alternative to opt-out.
   * We start capturing from the start, but giving them the option to opt-out of the capture.
   */
  if (websiteIsSensitive) {
    cookieSensitivePermission();
  }

  /* Else, if Website is NOT sensitive, we follow the normal cookie approach. Check for regular cookies:
   *  - if they exist, start capturing
   *  - If there are no cookies, then we need to ask for permission to deploy cookie, show the disclaimer
   * and wait for implicit consent
   */
  else {
    cookieNormalPermission();
  }
}

/**
 * Sensitive Websites cookie approach.
 *  we follow the alternative approach giving the alternative to opt-out.	
 *  We start capturing from the start, but giving them the option to opt-out of the capture.
 */

function cookieSensitivePermission() {
  var eventTS = datestampInMillisec();

  // First we check if the users opted out of the research, if so, stop.
  if (cookieSensitiveCookieCheck() == true) {
    // console.log("User opted out. Capture interrupted");
    return false;
  }

  // If we can get the Session ID from the cookie we don't do anything else
  if (getSessionFromCookie()) {
    init_UsaProxy();
    return true;
  }


  // If we cannot find the cookie, we need to ask the user, although we will start the tool anyway
  // console.log("Tracking cookie NOT found. Asking implicit permission");	
  writeLog_UsaProxy(eventTS, "cookiedisclaimershown");

  // if not, we show the sensitive disclaimer
  var htmlDivContent = document.createElement("div");
  htmlDivContent.id = "proxyCookieDisclaimer";
  htmlDivContent.style.backgroundColor = "silver";
  htmlDivContent.style.border = "1px solid black";
  htmlDivContent.style.textAlign = "center";
  htmlDivContent.style.margin = "0px auto 0px auto";
  htmlDivContent.style.position = "static";

  var headerNode = document.createElement("h2");
  headerNode.style.textAlign = "center";

  var headerText = document.createTextNode("Cookies on this website");
  headerNode.appendChild(headerText);

  htmlDivContent.appendChild(headerNode);

  var textNode = document.createElement("p");
  textNode.style.textAlign = "center";

  var disclaimerText = document.createTextNode("This site uses cookies to help us improve the usability of this site. If you continue to use the site, we will assume you don't mind allowing our cookie. All collected information is anonymous, but you can opt out anytime. Be aware that we will use a cookie as a reminder of your refusal, if you want no cookies at all, you will have to change your browser settings to reject all cookies from this domain.");

  textNode.appendChild(disclaimerText);

  htmlDivContent.appendChild(textNode);

  var htmlButton = document.createElement("button");
  htmlButton.onclick = cookieSensitiveHandleRejection;

  var buttonText = document.createTextNode("I do not want to use cookies from this site.");

  htmlButton.appendChild(buttonText);

  htmlDivContent.appendChild(htmlButton);

  // We push the HTML down before inserting the disclaimer

  pushHTMLDown();

  if (document.body.firstChild) {
    document.body.insertBefore(htmlDivContent, document.body.firstChild);
  } else {
    document.body.appendChild(htmlDivContent);
  }

  // We have shown the disclaimer, we will now set the cookie and start the tool until the user opts out
  setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);
  sessionID = sessionID_Proxy;
  init_UsaProxy();
}

/**
* In the sensitive approach, if users click on the button, that means they don't
* want to take part in the study, we need to put the "rejection" cookie.
*/

function cookieSensitiveHandleRejection() {
  var eventTS = datestampInMillisec();

  // User clicked in the cookie disclaimer button, we record the user rejected to be tracked
  writeLog_UsaProxy(eventTS, "cookiedisclaimerrejected");

  // Set rejection cookie
  setCookie(cookieRejection, true, cookieLife);

  // Delete our tracking cookie
  setCookie(sessionIDCookieName, "", -1);

  // We remove the cookie disclaimer and we show the new message
  var div = document.getElementById("proxyCookieDisclaimer");
  div.parentNode.removeChild(div);

  var htmlDivContent = document.createElement("div");
  htmlDivContent.id = "proxyCookieDisclaimer";
  htmlDivContent.style.backgroundColor = "silver";
  htmlDivContent.style.border = "1px solid black";
  htmlDivContent.style.textAlign = "center";
  htmlDivContent.style.margin = "0px auto 0px auto";
  htmlDivContent.style.position = "static";

  var headerNode = document.createElement("h2");
  headerNode.style.textAlign = "center";

  var headerText = document.createTextNode("Cookies on this website");
  headerNode.appendChild(headerText);

  htmlDivContent.appendChild(headerNode);

  var textNode = document.createElement("p");
  textNode.style.textAlign = "center";

  var disclaimerText = document.createTextNode("No interaction data will be captured, and all your previously captured data will be erased.");

  textNode.appendChild(disclaimerText);

  htmlDivContent.appendChild(textNode);

  if (document.body.firstChild) {
    document.body.insertBefore(htmlDivContent, document.body.firstChild);
  } else {
    document.body.appendChild(htmlDivContent);
  }

}

/**
* This function checks if the rejection cookie was found in the browser.
* It returns:
* True if the cookie was found with the "true" value, indicating the user doesn't want to take part in the study. 
* False, It will return false if the cookie
* 'null' if the cookie was not found. 
*/

function cookieSensitiveCookieCheck() {
  var cookieValueTemp = getCookie(cookieRejection);

  if (cookieValueTemp == "true") {
    // rejection cookie was found and has "true" as value
    return true;
  } else if (cookieValueTemp == "false") {
    // rejection cookie was found and has "false" as value
    return false;
  }
  else if (cookieValueTemp == "null") {
    // The rejection cookie was not found
    return "null";
  }
}

/**
* Normal cookie approach.
* This function will check if the cookie is available, if not it shows a disclaimer with a button
* when that button is pressed, a new session ID is created and stored in a cookie
*/

function cookieNormalPermission() {
  var eventTS = datestampInMillisec();

  // If we can get the Session ID from the cookie, we start the tool and finish
  if (getSessionFromCookie()) {
    init_UsaProxy();
    return true;
  }

  // We showed the disclaimer so we store an event

  writeLog_UsaProxy(eventTS, "cookiedisclaimershown");

  // if not, we show the disclaimer
  // alert("showing cookie disclaimer");

  var htmlDivContent = document.createElement("div");
  htmlDivContent.id = "proxyCookieDisclaimer";
  htmlDivContent.style.backgroundColor = "silver";
  htmlDivContent.style.border = "1px solid black";
  htmlDivContent.style.textAlign = "center";
  htmlDivContent.style.margin = "0px auto 0px auto";
  htmlDivContent.style.position = "static";

  var headerNode = document.createElement("h2");
  headerNode.style.textAlign = "center";

  var headerText = document.createTextNode("Cookies on this website");
  headerNode.appendChild(headerText);

  htmlDivContent.appendChild(headerNode);

  var textNode = document.createElement("p");
  textNode.style.textAlign = "center";

  var disclaimerText = document.createTextNode("This site uses cookies to help us improve the usability of this site. If you continue to use the site, we will assume you don't mind allowing our cookie. All collected information is anonymous, but if you want no cookies at all, you will have to change your browser settings to reject all cookies from this domain.");

  textNode.appendChild(disclaimerText);

  htmlDivContent.appendChild(textNode);

  /*
  * The cookies will get activated as soon as the user clicks somewhere.
  * The listener will remain registered, but the function will not do anything
  * if the disclaimer has been hidden already.
  */
  if (isNotOldIE)
    document.addEventListener('mousedown', cookieNormalHandleImplicitPermission, false);
  else
    document.attachEvent('onmousedown', cookieNormalHandleImplicitPermission);

  // We look for all 'fixed' elements and pushed them down by a certain height.
  pushHTMLDown();

  if (document.body.firstChild) {
    document.body.insertBefore(htmlDivContent, document.body.firstChild);
  } else {
    document.body.appendChild(htmlDivContent);
  }
}

/**
* In the normal approach, if the user gives implicit permission,
* then we generate the ID, set the cookie and store the ID
*/

function cookieNormalHandleImplicitPermission() {
  var eventTS = datestampInMillisec();

  // Implicit acceptance event was triggered, we test if the disclaimer was visible, if so, register the cookie.
  var div = document.getElementById("proxyCookieDisclaimer");

  if (div != null) {
    // disclaimer is visible
    writeLog_UsaProxy(eventTS, "cookiedisclaimeraccepted");

    setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);
    sessionID = sessionID_Proxy;
    div.parentNode.removeChild(div);
    init_UsaProxy();
  }
  else {
    // disclaimer is not visible, we assume everything is working fine, and this was some residual listener
  }
}


/**
* This function will push the contents of the Web page down
* Solution obtained from http://stackoverflow.com/questions/11436904/how-to-wrap-all-the-body-contents-in-a-div-with-jquery
* and http://stackoverflow.com/questions/7135281/how-to-move-all-content-relative-absolute-down
*/
function pushHTMLDown() {
  jQuery('body').wrapInner('<div class="pushedDown" />');
  // jQuery('.pushedDown').css('margin-top', '50px');

  jQuery('.pushedDown').css('position', 'relative');

  /*jQuery('*').filter(function() {
    return jQuery(this).css("position") === 'absolute';
  }).css('margin-top', '50px'); */
}


/**
* This function will push the contents of the Web page up. It will probably be never used.
*/
function pushHTMLUp() {
  jQuery('*').filter(function () {
    return jQuery(this).css("position") === 'absolute';
  }).css('margin-top', '50px');
}



/** The rational for this function is that if there are more cookies
* then we should be able to put our cookie.
* From javascript we can only access domain cookies, so if there is any
* then the web page took the necessary measure to make the user accept the cookie
* 
* IMPORTANT: For now, and because there are always cookies, it will always return false, requiring us to ask for permission for the cookie
*/

function getSessionFromCookie() {

  // We check if there are cookies in the Web page
  if (document.cookie.length > 0) {
    sessionID = getCookie(sessionIDCookieName);
    if (sessionID == "null") {
      // We don't have our cookie deployed, but there were other cookies, so we should be able to create one
      setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);
      sessionID = sessionID_Proxy;
      // document.getElementById("proxyCookieDiscalimer").style.visibility = "hidden";
    }
    return true;
  }
  else
    sessionID = null;
  return false;
}
