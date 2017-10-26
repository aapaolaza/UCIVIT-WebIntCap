// To implement the corresponding capture JS
// Wrapped the script to prevent propagation


/**
 * Before injecting this JS, the Web page site should
 * make sure they have the appropriate permissions from the client
 *
 * All global variables start with 'ucivit' and should be set before loading this script
 *
 */
(() => {
  // ///// URLS ////
  const eventLogURL = `${ucivitOptions.protocol + ucivitOptions.serverIP}/log/event`;
  const domLogURL = `${ucivitOptions.protocol + ucivitOptions.serverIP}/log/dom`;
  const timeQueryURL = `${ucivitOptions.protocol + ucivitOptions.serverIP}/ucivitTime`;
  const jQueryURL = 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js';

  /** Will determine the lifespan of the cookie, in days */
  const cookieLife = 10000;

  /** Cookie variables */
  const userIdCookie = 'ucivitUserId';
  const episodeCountCookie = 'ucivitEpisodeCount';
  const lastLogTSCookie = 'ucivitLastLogTS';

  const episodeTimeout = 40 * 60 * 1000;

  /**
   * Log save frequency.
   * Specifies the frequency of log save requests to the server
   */
  const logSaveFrequency = 3000;

  /**
   * Date: Initialised by query to the UCIVIT server.
   * Load completion timestamp is calculated relative to this timestamp.
   */
  let ucivitServerTS;

  // ////////////////////////////////////////////////////////////////////////
  // //////////////////////COOKIE HANDLER////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////


  function getCookie(cookieName) {
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i += 1) {
      let x = cookieArray[i].substr(0, cookieArray[i].indexOf('='));
      const y = cookieArray[i].substr(cookieArray[i].indexOf('=') + 1);
      x = x.replace(/^\s+|\s+$/g, '');
      if (x === cookieName) {
        // console.log("Cookie value at getCookie()" + y);
        return y;
      }
    }

    // we didn't find the cookie, so we return null
    return null;
  }

  /**
  * Stores the given value in the cookie whose name is given
  * @param cookieName label of the cookie
  * @param value value to store
  */
  function setCookie(cookieName, value) {
    const exdate = new Date();
    exdate.setDate(exdate.getDate() + cookieLife);
    let cookieValue = value + ((cookieLife == null) ? '' : `; expires = ${exdate.toUTCString()} `);

    // remove the www from the start so the cookie is available to all pages in the domain
    let { domain } = document;
    if (domain.substring(0, 3) === 'www') {
      domain = domain.substring(3, domain.length);
    }

    cookieValue += `; path = /; domain=${domain}`;

    document.cookie = `${cookieName}=${cookieValue}`;
  }

  // /// Random userId generator

  /**
   * User ID Support function: translates an integer into a string
   * @param {*} dec
   */
  // dec2hex :: Integer -> String
  function dec2hex(dec) {
    return (`0${dec.toString(16)}`).substr(-2);
  }

  /**
   * User ID Support function: creates a unique ID of the given length
   * @param {*} len
   */
  // generateId :: Integer -> String
  function generateId(len) {
    const arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('');
  }


  // ///// CONSTANTS AND RETRIEVING VALUES FROM GLOBAL VARIABLES //////////
  // Retrieve any variables set by the host
  const { websiteID } = ucivitOptions;

  let {
    userId, episodeCount, lastLogTS, isDOMrecorded,
    movingRequest, encodeLogData, protectedIds,
  } = ucivitOptions;

  // retrieve missing variables using cookies or generating them
  if (typeof userId === 'undefined') {
    if (getCookie(userIdCookie)) {
      // If no sid has been provided, check the cookie
      userId = getCookie(userIdCookie);
    } else {
      // if the cookie is empty, then generate a new userID
      userId = generateId(16);
    }
  }
  setCookie(userIdCookie, userId);

  // If episode count or user has not been preset, get it from the cookie
  if (typeof episodeCount === 'undefined') {
    if (getCookie(episodeCountCookie)) {
      episodeCount = parseInt(getCookie(episodeCountCookie), 10);
    } else {
      // set it to 1 if it's the first time
      episodeCount = 1;
    }
  }
  setCookie(episodeCountCookie, episodeCount);

  if (typeof lastLogTS === 'undefined') {
    if (getCookie(lastLogTSCookie)) {
      lastLogTS = parseInt(getCookie(lastLogTSCookie), 10);
    } else {
      // set it to 1 if it's the first time
      lastLogTS = new Date().getTime();
    }
  }
  setCookie(lastLogTSCookie, lastLogTS);

  /**
   * By default, the DOM won't be captured, to capture it,the deployment script needs to
   * set `ucivitOptions.isDOMrecorded` to true
   */
  if (typeof isDOMrecorded === 'undefined') {
    isDOMrecorded = false;
  }

  /**
   * Variable given as parameter indicating if the log data for this Web site should be encoded
   */
  if (typeof encodeLogData === 'undefined') {
    encodeLogData = false;
  }

  /**
   * Do we have to use a custom request for the episode tracking?
   */
  if (typeof movingRequest === 'undefined') {
    movingRequest = false;
  }

  /**
   * List of node IDs containing sensitive information (such as password entry fields).
   * No interaction will be captured from them.
   */
  if (typeof protectedIds === 'undefined') {
    protectedIds = [];
  }


  let logEntry = []; // Array: Initialised when page loads. Contains current event json log entries
  let logValLocked = false; // Boolean: if flag set, writing log entry to logEntry not possible

  /**
   * Date: Initialised on load. All further timestamps are calculated
   * by adding the ms passed since page load completion to this
   * relative timestamp.
   */
  let ucivitLoadTime = new Date();

  /**
   * Mousemove variables
   */
  let mousemoveLastTS;
  let mousemoveLastPosX; // Integer: last x position of the mouse pointer
  let mousemoveLastPosY; // Integer: last y position of the mouse pointer

  /**
   * Mouse move query time threshold in ms. If the time between mousemove recordings
   * is bigger than this,the event will be recorded.
   */
  const mousemoveThreshold = 1;

  /**
   * scroll periodic query
   */
  // Integer: last position of vertical scrollbar resp. top offset of document
  let lastScrollPosY;
  // Integer: last position of vhorozontal scrollbar resp. left offset of document
  let lastScrollPosX;
  const scrollQueryFrequency = 200;

  // String: last selected text
  let lastSelection;

  /**
   * Mousewheel variables
   * These variables are needed globally to record the amount of "delta"
   * scrolled with the mouse wheel
   */

  /**
   * wheelGranularity will determine how close the wheel events should be
   * to be considered part of the same event
   * The smaller this value, the finer the recording will be.
   * eg. instead of recording one wheel movement of 14, it may record 2 of 7
   */
  const wheelGranularity = 100;

  /**
   * wheelQueryFrequency will determine how often we query the wheel function
   * to see if it's time to log it
   * It will basically determine how precise we will be from the moment the granularity time ends
   */
  const wheelQueryFrequency = 50;

  /**
   * Timestamp storing the last wheel interaction
   */
  let wheelLastEventTimestampGlobal = new Date();
  let wheelNodeGlobal = null;
  let wheelDeltaGlobal = 0;
  let wheelTimeOutFunction = null;

  /**
   * Window focus state query variables
   */
  const windowFocusQueryFrequency = 500;
  let isWindowFocusedQuery = null;

  let windowIsFocused = false;

  /**
   * Window resize tracking variables
   */
  let lastResizeWidth = 0;
  let lastResizeHeigth = 0;
  let lastResizeDate = 0;

  /**
   * This variable will be used to discern if the browser is IE or not
   */
  let isNotOldIE;

  if (document.attachEvent) {
    isNotOldIE = false;
  } else {
    isNotOldIE = true;
  }


  // ////////////CODE FOR GETTING BROWSER INFORMATION/////////////

  // code obtained from https://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser

  /**
   * We infer browser's version only at the start, we want it to be the first thing it does
   */
  function inferClientBrowserInfo() {
    const ua = navigator.userAgent;
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem != null) M.splice(1, 1, tem[1]);
    return { appName: M[0], version: M[1] };
  }

  /**
   * Infer OS information
   * https://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript
   */
  function inferClientOSInfo() {
    let os = '';
    if (window.navigator.userAgent.indexOf('Windows NT 10.0') !== -1) os = 'Windows 10';
    else if (window.navigator.userAgent.indexOf('Windows NT 6.2') !== -1) os = 'Windows 8';
    else if (window.navigator.userAgent.indexOf('Windows NT 6.1') !== -1) os = 'Windows 7';
    else if (window.navigator.userAgent.indexOf('Windows NT 6.0') !== -1) os = 'Windows Vista';
    else if (window.navigator.userAgent.indexOf('Windows NT 5.1') !== -1) os = 'Windows XP';
    else if (window.navigator.userAgent.indexOf('Windows NT 5.0') !== -1) os = 'Windows 2000';
    else if (window.navigator.userAgent.indexOf('Mac') !== -1) os = 'Mac/iOS';
    else if (window.navigator.userAgent.indexOf('X11') !== -1) os = 'UNIX';
    else if (window.navigator.userAgent.indexOf('Linux') !== -1) os = 'Linux';

    return {
      platform: navigator.platform,
      os,
    };
  }

  let clientInfo = Object.assign(inferClientBrowserInfo(), inferClientOSInfo());

  /**
  * Adding the Client's context information to the event string,
  * such as browser's name and operating system
  */
  function getClientContextInformation() {
    if (!clientInfo) {
      clientInfo = Object.assign(inferClientBrowserInfo(), inferClientOSInfo());
    }
    return { clientInfo };
  }


  // ////////////////// PRIVACY FUNCTIONS /////////////////

  /**
  * This function will take an event as input, and it will compare its target's parents' id
  * against the ones contained in the "protectedIds" variable. It returns a boolean
  * indicating if the given target is protected or not
  * BEWARE!!! The ids comparison is case sensitive!
  */

  function privacyCheck(ev) {
    if (protectedIds.length === 0) {
      return false;
    }

    const jqueryTarget = $(ev.target);

    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const targetId = target.id;

    for (let i = 0; i < protectedIds.length; i += 1) {
      if (targetId === protectedIds[i]) {
        return true;
      }
      // The '#' is required for jQuery to know it's an id
      // Check if the target being captured should be avoided
      if (jqueryTarget.parents(`#${protectedIds[i]}`).length) {
        // console.log("Target is child of banned ID!! " + protectedIds[i]);
        return true;
      }
    }
    return false;
  }


  /**
  * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
  * Digest Algorithm, as defined in RFC 1321.
  * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
  * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
  * Distributed under the BSD License
  * See http://pajhome.org.uk/crypt/md5 for more info.
  */
  // eslint-disable-next-line
  let hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5('abc').toLowerCase() == '900150983cd24fb0d6963f7d28e17f72' } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { let e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } let a = Array(16), d = Array(16); for (let b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } let g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } let f = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'; let b = ''; let a; for (let d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { let b = ''; let d = -1; let a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { let a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { let a = ''; for (let c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; let o = 1732584193; let n = -271733879; let m = -1732584194; let l = 271733878; for (let g = 0; g < p.length; g += 16) { let j = o; let h = n; let f = m; let e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { let c = (a & 65535) + (d & 65535); let b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };

  /**
  * This function will check if certain inputs should be encoded or not,
  * depending on what Web application we are capturing information from.
  * If the Web application is in the list inputEncodeWebs, then we'll
  * encode the input text from keypresses and the IP address.
  * This function will just take the content to be encoded as input,
  * test if current Web application is in inputEncodeWebs, and return
  * the encoded text if true. return original input if false.
  */

  function encodeInput(inputString) {
    if (encodeLogData) {
      return hex_md5(inputString);
    }
    return inputString;
  }

  // ////////////////////////////////////////////////////////////////////////

  /**
  * Returns the string representation of the corresponding key code.
  * I got this code from the web page, although is slightly modified: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
  */

  function returnKeyValue(keyCode) {
    switch (keyCode) {
      case 8: return 'backspace'; //  backspace
      case 9: return 'tab'; //  tab
      case 13: return 'enter'; //  enter
      case 16: return 'shift'; //  shift
      case 17: return 'ctrl'; //  ctrl
      case 18: return 'alt'; //  alt
      case 19: return 'pause/break'; //  pause/break
      case 20: return 'caps lock'; //  caps lock
      case 27: return 'escape'; //  escape
      case 33: return 'page up'; // page up, to avoid displaying alternate character and confusing people
      case 34: return 'page down'; // page down
      case 35: return 'end'; // end
      case 36: return 'home'; // home
      case 37: return 'left arrow'; // left arrow
      case 38: return 'up arrow'; // up arrow
      case 39: return 'right arrow'; // right arrow
      case 40: return 'down arrow'; // down arrow
      case 45: return 'insert'; // insert
      case 46: return 'delete'; // delete
      case 91: return 'left window'; // left window
      case 92: return 'right window'; // right window
      case 93: return 'select key'; // select key
      case 96: return 'numpad 0'; // numpad 0
      case 97: return 'numpad 1'; // numpad 1
      case 98: return 'numpad 2'; // numpad 2
      case 99: return 'numpad 3'; // numpad 3
      case 100: return 'numpad 4'; // numpad 4
      case 101: return 'numpad 5'; // numpad 5
      case 102: return 'numpad 6'; // numpad 6
      case 103: return 'numpad 7'; // numpad 7
      case 104: return 'numpad 8'; // numpad 8
      case 105: return 'numpad 9'; // numpad 9
      case 106: return 'multiply'; // multiply
      case 107: return 'add'; // add
      case 109: return 'subtract'; // subtract
      case 110: return 'decimal point'; // decimal point
      case 111: return 'divide'; // divide
      case 112: return 'F1'; // F1
      case 113: return 'F2'; // F2
      case 114: return 'F3'; // F3
      case 115: return 'F4'; // F4
      case 116: return 'F5'; // F5
      case 117: return 'F6'; // F6
      case 118: return 'F7'; // F7
      case 119: return 'F8'; // F8
      case 120: return 'F9'; // F9
      case 121: return 'F10'; // F10
      case 122: return 'F11'; // F11
      case 123: return 'F12'; // F12
      case 144: return 'num lock'; // num lock
      case 145: return 'scroll lock'; // scroll lock
      case 186: return ';'; // semi-colon
      case 187: return '='; // equal-sign
      case 188: return ','; // comma
      case 189: return '-'; // dash
      case 190: return '.'; // period
      case 191: return '/'; // forward slash
      case 192: return '`'; // grave accent
      case 219: return '['; // open bracket
      case 220: return '\\'; // back slash
      case 221: return ']'; // close bracket
      case 222: return "'"; // single quote
      default: return String.fromCharCode(keyCode);
    }
  }


  // /////////////// EPISODE FUNCTIONS ////////////////////////

  /**
   * Updates the client cookie with the corresponding episode information value
   */
  function updateEpisodeInformationCookie() {
    setCookie(episodeCountCookie, episodeCount);
    setCookie(lastLogTSCookie, lastLogTS);
  }

  /**
   * Updates the episode count information.
   * In this version, it contacts the MOVING framework interface.
   * If it's not available, it resorts to the information stored in the cookie.
   * It's called at every episode count change, and every request to store the captured data.
   */
  function updateEpisodeInformation() {
    if (movingRequest) {
      $.ajax({
        url: `/capture/trackingUpdate/${episodeCount}/${lastLogTS}`,
        error: (XMLHttpRequest, textStatus, errorThrown) => {
          console.log(errorThrown);
          // TODO: why are we setting moving request true again?
          movingRequest = true;
          updateEpisodeInformationCookie();
        },
      });
    } else {
      updateEpisodeInformationCookie();
    }
  }


  /**
   * If the time since last recorded event is greater than the episode timeout
   * increase the episode count and trigger an update in the server.
   * Always update the last recorded event TS
   */
  function calculateEpisode() {
    // The first time, just record current TS
    if ((lastLogTS !== -1) &&
      ((new Date().getTime() - lastLogTS) > episodeTimeout)) {
      episodeCount += 1;
      updateEpisodeInformation();
    }

    lastLogTS = new Date().getTime();
  }

  /**
   * Given a text to store to the database, expand it with the episodeInformation
   */
  function getEpisodeInfo() {
    calculateEpisode();
    return { episodeCount };
  }

  /**
  * Returns the computed datestamp in milliseconds
  */

  function datestampInMillisec() {
    if (ucivitLoadTime == null) ucivitLoadTime = new Date();

    const currentDate = new Date();
    // get milliseconds from load time
    const diffSecs = Math.abs(currentDate.getTime() - ucivitLoadTime.getTime());
    // return the value in ms of a new Date object according to UsaProxy start time + diffMSecs
    return (ucivitServerTS + diffSecs);
  }


  // ///////////////////////// Log storing and data communication /////////////////

  /**
   * Appends an event log entry together with the httptrafficindex referencing this page,
   * the client's session ID,
   * and the current timestamp to logEntry
   */
  function writeLog(eventTS, eventObj) {
    if (logValLocked) {
      window.setTimeout(() => {
        writeLog(eventTS, eventObj);
      }, 50);
      return false;
    }

    const logObj = eventObj;

    // console.log("Recording: " + text);
    // We add the browser version
    Object.assign(logObj, getClientContextInformation());
    // if function is already being executed, defer writeLog for 50ms
    // Add current episode information
    Object.assign(logObj, getEpisodeInfo());

    // Adds additional parameters
    let url = window.location.href;
    url = url.replace('#', '');

    // we will also store users' timezone
    const timezoneOffset = new Date().getTimezoneOffset();

    logObj.timestampms = eventTS;
    logObj.sessionstartms = ucivitServerTS;
    logObj.timezoneOffset = timezoneOffset;
    logObj.sd = websiteID;
    logObj.sid = userId;
    logObj.url = url;
    if (encodeLogData) logObj.needsEncoding = encodeLogData;

    // set synchronization flag (block function)
    logValLocked = true;
    logEntry.push(logObj); // Add logLine to interaction log
    // reset synchronization flag (release function)
    logValLocked = false;

    return true;
  }

  /**
   * Ajax request to store data
   */

  function sendJsonData(jsonLogData) {
    $.ajax({
      type: 'POST',
      url: eventLogURL,
      data: { jsonLogString: JSON.stringify(jsonLogData) },
      dataType: 'jsonp',
    }).done((response) => {
      console.log(response);
    });
  }

  /** Called periodically to send tracked usage data (if any) to the server */
  function saveLog() {
    if (logEntry.length > 0) {
      // Add the sid to the get request
      sendJsonData(logEntry);
      // we record current time as the last log recorded
      setCookie(lastLogTSCookie, datestampInMillisec());
      logEntry = []; // reset log data
      updateEpisodeInformation();// updates the stored episode count information}
    }
  }

  /**
   * DOM RECORDING FUNCTIONS
   * When called, records the entire DOM as an event
   */
  function recordCurrentDOM() {
    // console.log('logging DOM');
    const eventTS = datestampInMillisec();

    const logObj = { event: 'domData', domContent: document.getElementsByTagName('body')[0].innerHTML };

    // console.log("Recording: " + text);
    // We add the browser version
    Object.assign(logObj, getClientContextInformation());
    // if function is already being executed, defer writeLog for 50ms
    // Add current episode information
    Object.assign(logObj, getEpisodeInfo());

    // Adds additional parameters
    let url = window.location.href;
    url = url.replace('#', '');

    // we will also store users' timezone
    const timezoneOffset = new Date().getTimezoneOffset();

    logObj.timestampms = eventTS;
    logObj.sessionstartms = ucivitServerTS;
    logObj.timezoneOffset = timezoneOffset;
    logObj.sd = websiteID;
    logObj.sid = userId;
    logObj.url = url;
    if (encodeLogData) logObj.needsEncoding = encodeLogData;

    $.ajax({
      type: 'POST',
      url: domLogURL,
      data: { jsonDomData: JSON.stringify(logObj) },
      dataType: 'jsonp',
    }).done((response) => {
      console.log(response);
    });
  }

  // ///////////////////////////////// Element location functions ////////////////
  /**
   * Computes the element's offset from the left edge
   * of the browser window
   */
  function absLeft(element) {
    if (element.pageX) return element.pageX;
    return (element.offsetParent) ?
      element.offsetLeft + absLeft(element.offsetParent) : element.offsetLeft;
  }

  /**
   * Computes the element's offset from the top edge
   * of the browser window
   */
  function absTop(element) {
    if (element.pageY) return element.pageY;
    return (element.offsetParent) ?
      element.offsetTop + absTop(element.offsetParent) : element.offsetTop;
  }

  /**
   * Returns the XPATH of a given element
   */
  function getPathTo(element) {
    if (element.id !== '') {
      return `id("${element.id}")`;
    }
    if (element === document.body) {
      return element.tagName;
    }
    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i += 1) {
      const sibling = siblings[i];
      if (sibling === element) {
        return `${getPathTo(element.parentNode)}/${element.tagName}[${ix + 1}]`;
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) { ix += 1; }
    }
    return '';
  }

  /**
   *  Returns the DOM XPATH of the specified DOM node beginning with the first
   * corresponding child node of the document node (i.e. HTML)
   * @param DOM node element
   */
  function getDOMPath(node) {
    return getPathTo(node);
  }


  /** Returns file name of a URL/path
   *
   * @param [String] path
   */
  function getFileName(path) {
    if (path.lastIndexOf('/') > -1) {
      return path.substring(path.lastIndexOf('/') + 1);
    }
    return path;
  }

  /**
   * Returns all available node information such as the DOM path, an image name, href, etc.
   * @param DOM node element
   */

  function getNodeInfo(node) {
    const nodeInfo = {};
    nodeInfo.dom = getDOMPath(node); // append DOM path

    // if target has an id property
    if (node.id) {
      nodeInfo.id = node.id;
    }
    /* This code would look for the id of the closest element
    might cause issues if ONLY the ID element is used for queries,
    as there might be various items with the same ID
    */
    /* else if (node.closest('[id]')){
      eventString = eventString + "&id=" + node.closest('[id]').id;
    } */

    // if target has a name property
    if (node.name) {
      nodeInfo.name = node.name;
    }

    // if target has a href property
    if (node.href) {
      /* image detection IE: IE doesn't register any src property
      * instead href contains the file path */
      if (node.nodeName === 'img' || node.nodeName === 'IMG') {
        nodeInfo.img = getFileName(node.href);
        // if linked image (parent node is an <a>-element)
        if (node.parentNode.href) {
          nodeInfo.link = node.parentNode.href;
        }
        // NS+IE: link detection
      } else if (node.nodeName === 'a' || node.nodeName === 'A') { // if anchor tag
        nodeInfo.link = node.href;

        // IE: innertext property contains link text
        if (node.innerText) {
          // TODO: check if the encoding is necessary anymore
          nodeInfo.text = node.innerText;
          // NS: text property contains link text
        } else {
          nodeInfo.text = node.text;
        }
      }
    } else if (node.src) {
      // image detection NS
      nodeInfo.img = getFileName(node.src);
      if (node.parentNode.href) {
        nodeInfo.link = node.parentNode.href;
      }
    }

    // Get textContent of the variable
    let textContent = 'null';
    try {
      if (node.firstChild.nodeValue != null) {
        textContent = node.firstChild.nodeValue.substring(0, 100);
      }
    } catch (err) {
      // Do nothing, as we just want to avoid looking into null elements
    }

    nodeInfo.nodeType = node.tagName;
    nodeInfo.textContent = textContent;
    nodeInfo.textValue = node.value;

    return { nodeInfo };
  }

  /**
  * Returns currently selected (highlighted) text in the web page
  */
  function getSelectionHtml() {
    let html = '';
    if (typeof window.getSelection !== 'undefined') {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const container = document.createElement('div');
        for (let i = 0, len = sel.rangeCount; i < len; i += 1) {
          container.appendChild(sel.getRangeAt(i).cloneContents());
        }

        html = container.innerHTML;
      }
    } else if (typeof document.selection !== 'undefined') {
      if (document.selection.type === 'Text') {
        html = document.selection.createRange().htmlText;
      }
    }
    return (html);
  }

  /**
  * Returns true if it detects that something has been selected in the web page.
  * If it's true, then it records the content of the selection as a selection event
  * The usual functions that will call this function are mouse up and keyup
  */

  function processIfHtmlIsSelected(selectionTool, target) {
    const eventTS = datestampInMillisec();

    const selectedContent = getSelectionHtml();
    if (selectedContent !== '') {
      const eventObj = {
        event: 'selectextra',
        selectionTool,
        selectedContent,
      };
      Object.assign(eventObj, getNodeInfo(target));
      writeLog(eventTS, eventObj);
    }
  }

  /** Processes the selection of text within the web page's content.
  * Function is invoked on mousedown */

  function processMousedownSelection(target) {
    const eventTS = datestampInMillisec();

    let currentSelection;
    // NS
    if (window.getSelection) currentSelection = window.getSelection();
    // safari, konqueror
    else if (document.getSelection) currentSelection = document.getSelection();
    // IE
    else if (document.selection) currentSelection = document.selection.createRange().text;

    // if selection is not empty and new text was selected, log select event
    if (currentSelection !== '' && lastSelection !== currentSelection) {
      const eventObj = {
        event: 'select',
        selectedContent: currentSelection,
      };
      Object.assign(eventObj, getNodeInfo(target));

      writeLog(eventTS, eventObj);

      // set last selected text
      lastSelection = currentSelection;
      saveLog();
    }
  }

  // ////////////////////////////// EVENT HANDLERS /////////////////////////////////

  /** Event logging functionality */
  /** Processes load event (logs load event together with the page size) */
  function processLoad() {
    const eventTS = datestampInMillisec();
    /* get size
    * NS: first case (window.innerWidth/innerHeight available); IE: second case */
    // innerWidth=NS
    const loadWidth = (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;
    // innerHeight=NS
    const loadHeight = (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;

    const eventObj = {
      event: 'load',
      size: `${loadWidth}x${loadHeight}`,
      // TODO: Why is this triggering a global variable error?
      // eslint-disable-next-line
      resolution: `${screen.width}x${screen.height}`,
      htmlSize: `${$(document).width()}x${$(document).height()}`,
      usableSize: `${$(window).width()} x${$(window).height()}`,
    };
    writeLog(eventTS, eventObj);

    if (isDOMrecorded) recordCurrentDOM();
  }

  /** Processes window resize event (logs resize event together with the page size) */
  function processResize() {
    const eventTS = datestampInMillisec();

    /* get size
    * NS: first case (window.innerWidth/innerHeight available); IE: second case */
    // innerWidth=NS
    const newWidth = (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;
    // innerHeight=NS
    const newHeight = (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;

    // We check if we have recorded this size at this time already
    if (lastResizeWidth !== newWidth || lastResizeHeigth !== newHeight
      || lastResizeDate !== new Date().getTime()) {
      lastResizeWidth = newWidth;
      lastResizeHeigth = newHeight;
      lastResizeDate = new Date().getTime();

      const eventObj = {
        event: 'resize',
        size: `${newWidth}x${newHeight}`,
        // TODO: Why is this triggering a global variable error?
        // eslint-disable-next-line
        resolution: `${screen.width}x${screen.height}`,
        htmlSize: `${$(document).width()}x${$(document).height()}`,
        usableSize: `${$(window).width()} x${$(window).height()}`,
      };
      writeLog(eventTS, eventObj);
    }
  }

  /** Processes mousemove event if
   * the time between events is bigger than threshold, and coordinates are different
   */
  function processMousemove(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();
    // if the time since last mousemove event is greater than threshold, save event.
    // otherwise, ignore
    if ((eventTS - mousemoveLastTS) <= mousemoveThreshold) return;


    // update this as "last stored" mousevent before moving on
    mousemoveLastTS = eventTS;

    /* get event target, x, and y value of mouse position
    * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    // if target event is private, do nothing
    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    /** if log mousemove flag is false, set it true and
     * log a mousemove event if mouse pointer actually moved
     */
    if (x === mousemoveLastPosX && y === mousemoveLastPosY) {
      mousemoveLastPosX = x;
      mousemoveLastPosY = y;

      const eventObj = {
        event: 'mousemove',
        coord: `${x},${y}`,
        offset: `${xOffset},${yOffset}`,
      };
      Object.assign(eventObj, getNodeInfo(target));
      writeLog(eventTS, eventObj);
    }
  }

  /** Processes mouseover event.
  * logs mouseover events on all elements which have either an
  * id, name, href, or src property (logging more would cause a log overload).
  * In addition it applies the appropriate direct event listeners to form elements
  */
  let mouseoverLastTS = 0;
  let mouseoverLastContent = '';
  function processMouseover(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    let eventTS = datestampInMillisec();

    /* get event target
    * NS: first case (window.Event available); IE: second case
    * */
    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    // if target event is private, do nothing
    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    // log mouseover coordinates and all available target attributes

    const eventObj = {
      event: 'mouseover',
      coord: `${x},${y}`,
      offset: `${xOffset},${yOffset}`,
    };
    Object.assign(eventObj, getNodeInfo(target));

    // Work around to handle multiple mouseover events queuing one after anohter,
    // getting the same timestamp assigned.
    // Check if the mouse event is different to a previous one, but contains the same timestamp
    if ((mouseoverLastTS === eventTS) && (mouseoverLastContent !== JSON.stringify(eventObj))) {
      eventTS += 1;
    }
    mouseoverLastTS = eventTS;
    mouseoverLastContent = JSON.stringify(eventObj);

    writeLog(eventTS, eventObj);
  }

  /**
  * Processes mouseout event
  */
  let mouseoutLastTS = 0;
  let mouseoutLastContent = '';
  function processMouseout(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    let eventTS = datestampInMillisec();

    /* get event target
      * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    const eventObj = {
      event: 'mouseout',
      coord: `${x},${y}`,
      offset: `${xOffset},${yOffset}`,
    };
    Object.assign(eventObj, getNodeInfo(target));

    // Work around to handle multiple mouseover events queuing one after another,
    // getting the same timestamp assigned.
    // Check if the mouse event is different to a previous one, but contains the same timestamp
    if ((mouseoutLastTS === eventTS) && (mouseoutLastContent !== JSON.stringify(eventObj))) {
      eventTS += 1;
    }
    mouseoutLastTS = eventTS;
    mouseoutLastContent = JSON.stringify(eventObj);

    writeLog(eventTS, eventObj);
  }

  function processMouseup(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target, x, and y value of mouse position
      * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    /** mouse button detection: was middle or right mouse button clicked ? */
    let mbutton;

    if (ev.which) { // NS
      switch (ev.which) {
        case 2: mbutton = 'm'; break; // middle button
        case 3: mbutton = 'r'; break; // right button
        default: mbutton = 'l'; break; // left button as default
      }
    } else if (ev.button) { // IE
      switch (ev.button) {
        case 4: mbutton = 'm'; break;
        case 2: mbutton = 'r'; break;
        default: mbutton = 'l'; break;
      }
    }

    const eventObj = {
      event: 'mouseup',
      coord: `${x},${y}`,
      offset: `${xOffset},${yOffset}`,
      but: mbutton,
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);

    // Was this mouse event employed to select something?
    processIfHtmlIsSelected('mouse', target);
  }

  /** Processes mouse click event.
    Logs mousedown event together with the mouse button type (if middle or
    right button), and the available event target properties.
    Since click might have occured also outside of form fields, images, or, hyperlinks,
    the mouse pointer position is recorded relative to the hovered-over area/element. */

  function processMousedown(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target, x, and y value of mouse position
    * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    /* check if text was selected, if true, discontinue,
      since this is handled by processMousedownSelection */

    if (processMousedownSelection(target)) return;

    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    /** mouse button detection: was middle or right mouse button clicked ? */
    let mbutton;

    if (ev.which) { // NS
      switch (ev.which) {
        case 2: mbutton = 'm'; break; // middle button
        case 3: mbutton = 'r'; break; // right button
        default: mbutton = 'l'; break; // left button as default
      }
    } else if (ev.button) { // IE
      switch (ev.button) {
        case 4: mbutton = 'm'; break;
        case 2: mbutton = 'r'; break;
        default: mbutton = 'l'; break;
      }
    }

    const eventObj = {
      event: 'mousedown',
      coord: `${x},${y}`,
      offset: `${xOffset},${yOffset}`,
      but: mbutton,
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }

  /**
   *  Processes change event in select lists, input fields, textareas.
   *  Logs change event together with the corresponding field type, and
   * a couple of field content properties such as the new field value.
   * TODO: Review if there is a better way to hndle these change events
   */

  function processChange(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target
    * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    // if target event is private, do nothing
    if (privacyCheck(ev)) return;

    // basic 'change' event
    const eventObj = {
      event: 'change',
      type: target.type,
    };
    Object.assign(eventObj, getNodeInfo(target));

    // depending on the target, we'll add more information
    let value = '';

    switch (target.type) {
      case 'select-multiple':
        // check which entries were selected
        for (let i = 0; i < target.options.length; i += 1) {
          if (target.options[i].selected) {
            value += target.options[i].value;
          }
        }
        eventObj.value = value;
        break;

      case 'select-one':
        eventObj.value = target.options[target.selectedIndex].value;
        eventObj.selected = target.selectedIndex;
        break;

      case 'checkbox':
        // check boxes in checkbox group
        if (target.length > 1) {
          for (let i = 0; i < target.length; i += 1) {
            if (target[i].checked === true) {
              value = `${value}.${target[i].value} `;
            }
          }
          if (value === '') value = 'none';
        } else { value = target.checked; }

        eventObj.value = target.options[target.selectedIndex].value;
        eventObj.checked = target.checked;
        break;

      case 'text':
      case 'textarea':
      case 'file':
        eventObj.value = target.value;

        break;

      case 'password':
      case 'radio':
        // Leave the default event
        break;

      default:
        break;
    }

    writeLog(eventTS, eventObj);
  }

  /** Processes scrolling of the page.
   * Function is invoked periodically since no explicit scroll event is triggered.
   * The page offset is logged in the form of a percentage value relative
   * to the total HTML document height/width
   */

  function processScroll() {
    const eventTS = datestampInMillisec();

    /** since total HTML height/width may be modified through font size settings
        it must be computed each time a scrolling is performed */

    let scrollHeight;
    let scrollWidth;

    if (document.documentElement && document.documentElement.scrollHeight) {
      // Explorer 6 Strict
      ({ scrollHeight, scrollWidth } = document.documentElement);
    } else if (document.body) {
      // all other Explorers
      ({ scrollHeight, scrollWidth } = document.document.body);
    }


    let currentScrollPosX;
    let currentScrollPosY;

    // TODO: "self" is a global, but is still giving eslint errors
    /* get current offset */
    if (self.pageYOffset) {
      // all except Explorer
      currentScrollPosX = self.pageXOffset;
      currentScrollPosY = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {
      // Explorer 6 Strict
      currentScrollPosX = document.documentElement.scrollLeft;
      currentScrollPosY = document.documentElement.scrollTop;
    } else if (document.body) {
      // all other Explorers
      currentScrollPosX = document.body.scrollLeft;
      currentScrollPosY = document.body.scrollTop;
    }

    // basic 'scroll' event
    const eventObj = {
      event: 'scroll',
    };

    // if vertical scrollbar was moved new scrollbar position is logged
    if (lastScrollPosY !== currentScrollPosY) {
      /** e.g. 100, 80, 6, 0 */
      let percentOfHeight = `${Math.round((currentScrollPosY / scrollHeight) * 100)} `;
      /** shift */
      if (percentOfHeight.length === 0) percentOfHeight = '000';
      if (percentOfHeight.length === 1) percentOfHeight = `00${percentOfHeight} `;
      if (percentOfHeight.length === 2) percentOfHeight = `0${percentOfHeight} `;
      percentOfHeight = `${percentOfHeight.substring(0, 1)}.${percentOfHeight.substring(1)} `;

      eventObj.scrolly = percentOfHeight;

      // set last scrollbar position
      lastScrollPosY = currentScrollPosY;
    }

    // if horizontal scrollbar was moved new scrollbar position is logged
    if (lastScrollPosX !== currentScrollPosX) {
      let percentOfWidth = `${Math.round((currentScrollPosX / scrollWidth) * 100)} `;
      /** shift */
      if (percentOfWidth.length === 0) percentOfWidth = '000';
      if (percentOfWidth.length === 1) percentOfWidth = `00${percentOfWidth} `;
      if (percentOfWidth.length === 2) percentOfWidth = `0${percentOfWidth} `;
      percentOfWidth = `${percentOfWidth.substring(0, 1)}.${percentOfWidth.substring(1)} `;

      eventObj.scrollx = percentOfWidth;

      // set last scrollbar position
      lastScrollPosX = currentScrollPosX;
    }

    // only store the event if any change in scroll was detected.
    if (Object.keys(eventObj).length > 1) writeLog(eventTS, eventObj);
  }

  /** Processes blur event */

  function processBlur(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    // console.log("blur event");
    /* get event target
    * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    if (privacyCheck(ev)) return;

    writeLog(eventTS, Object.assign({ event: 'blur' }, getNodeInfo(target)));
  }

  /** Processes focus event */
  function processFocus(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target
    * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    if (privacyCheck(ev)) return;

    writeLog(eventTS, Object.assign({ event: 'focus' }, getNodeInfo(target)));
  }


  /** Function that registers the focus state of the current window,
   * if different than the last registered state
    * Function is invoked periodically */

  function processWindowFocusQuery() {
    const eventTS = datestampInMillisec();

    if (document.hasFocus() !== isWindowFocusedQuery) {
      // If different, we record the event
      if (document.hasFocus()) writeLog(eventTS, { event: 'windowqueryfocus' });
      else writeLog(eventTS, { event: 'windowqueryblur' });
      isWindowFocusedQuery = document.hasFocus();
    }
  }

  /**
   * Processes the particular event of "open a contextmenu" event
   */
  function processContextMenu(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target, x, and y value of mouse position
      * NS: first case (window.Event available); IE: second case */

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    const eventObj = { event: 'contextmenu', coord: `${x},${y}`, offset: `${xOffset},${yOffset}` };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }

  /**
   * Processes the particular event of a "cut" event
   */
  function processCut(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    if (privacyCheck(ev)) return;

    // if selection is not empty, log select event with the selected text
    if (target.selectionStart !== target.selectionEnd) {
      const eventObj = { event: 'cut', content: target.value.substring(target.selectionStart, target.selectionEnd) };
      Object.assign(eventObj, getNodeInfo(target));

      writeLog(eventTS, eventObj);
    }
  }

  /**
   * Processes the particular event of a "copy" event
   */
  function processCopy(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    if (privacyCheck(ev)) return;

    // if selection is not empty, log select event with the selected text
    if (target.selectionStart !== target.selectionEnd) {
      const eventObj = { event: 'copy', content: target.value.substring(target.selectionStart, target.selectionEnd) };
      Object.assign(eventObj, getNodeInfo(target));
      writeLog(eventTS, eventObj);
    }
  }

  /**
   * Processes the particular event of a "paste" event
   */
  function processPaste(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;

    if (privacyCheck(ev)) return;

    // if selection is not empty, log select event with the selected text
    if (target.selectionStart !== target.selectionEnd) {
      const eventObj = { event: 'paste', content: target.value.substring(target.selectionStart, target.selectionEnd) };
      Object.assign(eventObj, getNodeInfo(target));
      writeLog(eventTS, eventObj);
    }
  }

  /**
   * Processes the particular event of a "doubleclick" event
   */
  function processDblClick(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get event target, x, and y value of mouse position
    * NS: first case (window.Event available); IE: second case */
    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const x = (isNotOldIE) ? ev.pageX : ev.clientX;
    const y = (isNotOldIE) ? ev.pageY : ev.clientY;

    if (privacyCheck(ev)) return;

    const xOffset = x - absLeft(target); // compute x offset relative to the hovered-over element
    const yOffset = y - absTop(target); // compute y offset relative to the hovered-over element

    /** mouse button detection: was middle or right mouse button clicked ? */
    let mbutton;
    if (ev.which) { // NS
      switch (ev.which) {
        case 2: mbutton = 'm'; break; // middle button
        case 3: mbutton = 'r'; break; // right button
        default: mbutton = 'l'; break; // left button as default
      }
    } else if (ev.button) { // IE
      switch (ev.button) {
        case 4: mbutton = 'm'; break;
        case 2: mbutton = 'r'; break;
        default: mbutton = 'l'; break;
      }
    }

    const eventObj = {
      event: 'dblclick',
      coord: `${x},${y}`,
      offset: `${xOffset},${yOffset}`,
      but: mbutton,
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }

  /**
   * Processes the particular event of an "error" event
   */
  function processError() {
    const eventTS = datestampInMillisec();
    writeLog(eventTS, { event: 'javascripterror' });
  }

  /**
   * Processes the particular event of an "error" event
   */
  function processhashChange() {
    const eventTS = datestampInMillisec();
    writeLog(eventTS, { event: 'hashChange' });
  }

  /**
   * Logs key presses. The key value represents the key pressed in the keyboard,
   * rather than the resulting value.
   * E.g. capital letters are not recorded, but rather the lowercase letter
   * indicating the location in the keyboard
   */
  function processKeydown(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get keycode
    * IE: first case (window.event available); NS: second case */
    const ev = window.event ? window.event : e;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const KeyID = ev.which ? ev.which : ev.keyCode;

    if (privacyCheck(ev)) return;

    const eventObj = {
      event: 'keydown',
      key: encodeInput(returnKeyValue(KeyID)),
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }

  /**
   * Logs all regular single key presses.
   */
  function processKeypress(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get keycode
    * IE: first case (window.event available); NS: second case */
    const ev = window.event ? window.event : e;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const KeyID = ev.which ? ev.which : ev.keyCode;

    if (privacyCheck(ev)) return;

    const eventObj = {
      event: 'keypress',
      key: encodeInput(String.fromCharCode(KeyID)),
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }

  /*
   * Keyup event, we don't take into account any combination of keys detector flag.
   */
  function processKeyUp(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    /* get keycode
    * IE: first case (window.event available); NS: second case */
    const ev = window.event ? window.event : e;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    const KeyID = ev.which ? ev.which : ev.keyCode;

    if (privacyCheck(ev)) return;

    const eventObj = {
      event: 'keyup',
      key: encodeInput(returnKeyValue(KeyID)),
    };
    Object.assign(eventObj, getNodeInfo(target));

    writeLog(eventTS, eventObj);
  }


  /**
  * This function will accummulate the mouse wheel movement in order to record it periodically
  */
  function handleWheelEvents(delta, node) {
    const eventTS = datestampInMillisec();

    const currentTime = new Date();

    // if node is null, we have to store this event as a new one.
    // Store the delta value and start the timer
    if (wheelNodeGlobal == null) {
      wheelDeltaGlobal += delta; // wheelDeltaGlobal should be 'zero' here anyway
      wheelNodeGlobal = node;
      wheelLastEventTimestampGlobal = new Date();

      // START TIMEOUT! But first I need to cancel the previous timeout,
      // otherwise this function will be called more than once
      // This timeout should be cancelled already anyway
      if (wheelTimeOutFunction != null) window.clearTimeout(wheelTimeOutFunction);

      wheelTimeOutFunction = setTimeout(() => {
        handleWheelEvents(0, wheelNodeGlobal);
      }, wheelQueryFrequency);
    } else if (node.isEqualNode(wheelNodeGlobal)) {
      // If same node, check time to either record it or to program next timeout function

      // If it´s time just record the event, and record next wheel as different event
      if (currentTime.getTime() - wheelLastEventTimestampGlobal.getTime() > wheelGranularity) {
        wheelDeltaGlobal += delta;

        const eventObj = {
          event: 'mousewheel',
          delta: wheelDeltaGlobal,
        };
        Object.assign(eventObj, getNodeInfo(node));

        writeLog(eventTS, eventObj);

        // reset the variables ready for next event
        wheelDeltaGlobal = 0;
        wheelNodeGlobal = null;

        // we also have to remove the timeouts
        if (wheelTimeOutFunction != null) window.clearTimeout(wheelTimeOutFunction);
      } else if (delta === 0) {
        // if it's not time, but delta is 0, that means it's just the timeout function.
        // Recall the function without altering the "wheelLastEventTimestampGlobal"
        if (wheelTimeOutFunction != null) window.clearTimeout(wheelTimeOutFunction);

        wheelTimeOutFunction = setTimeout(() => {
          handleWheelEvents(0, wheelNodeGlobal);
        }, wheelQueryFrequency);
      } else {
        // if it's not time, but we have delta values
        wheelDeltaGlobal += delta;
        wheelLastEventTimestampGlobal = currentTime;

        // START TIMEOUT! first cancel the previous timeout
        if (wheelTimeOutFunction != null) window.clearTimeout(wheelTimeOutFunction);
        wheelTimeOutFunction = setTimeout(() => {
          handleWheelEvents(0, wheelNodeGlobal);
        }, wheelQueryFrequency);
      }
    } else {
      // if globalNode is neither the same nor null, then it corresponds to a different target
      // record the previous one and start recording this one
      const eventObj = {
        event: 'mousewheel',
        delta: wheelDeltaGlobal,
      };
      Object.assign(eventObj, getNodeInfo(wheelNodeGlobal));

      writeLog(eventTS, eventObj);

      // We "restart" the counters with the new event we received
      wheelDeltaGlobal = delta;
      wheelNodeGlobal = node;
      wheelLastEventTimestampGlobal = currentTime;

      // START TIMEOUT! first cancel the previous timeout
      if (wheelTimeOutFunction != null) window.clearTimeout(wheelTimeOutFunction);
      wheelTimeOutFunction = setTimeout(() => {
        handleWheelEvents(0, wheelNodeGlobal);
      }, wheelQueryFrequency);
    }
  }

  /**
   * Processes mousewheel events
   * Piece of code adapted from http://www.adomas.org/javascript-mouse-wheel/
   */

  function processMousewheel(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    let event = (isNotOldIE) ? e : window.event;
    if (!event) ({ event } = window); // For IE.

    const target = (isNotOldIE) ? event.target : event.srcElement;
    let delta = 0;

    if (event.wheelDelta) delta = event.wheelDelta / 120; // IE/Opera.
    else if (event.detail) delta = -event.detail / 3; // Mozilla case. */
    /** In Mozilla, sign of delta is different than in IE.
    * Also, delta is multiple of 3.
    */

    handleWheelEvents(delta, target);
  }

  /**
   * Processes the particular event of a "select" event
   */
  function processSelectText(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const ev = (isNotOldIE) ? e : window.event;
    const target = (isNotOldIE) ? ev.target : ev.srcElement;
    if (privacyCheck(ev)) return;
    // if selection is not empty, log select event with the selected text
    if (target.selectionStart !== target.selectionEnd) {
      const eventObj = {
        event: 'select_Extra',
        selectedContent: target.value
          .substring(target.selectionStart, target.selectionEnd),
      };
      Object.assign(eventObj, getNodeInfo(target));
      writeLog(eventTS, eventObj);
    }
  }

  /**
  * This function is rarely called, as we don't have time to process it before the window closes.
  * The end of the interaction (last interaction event recorded) will be considered
  * the end of the session instead
  */
  function processUnload() {
    const eventTS = datestampInMillisec();

    writeLog(eventTS, { event: 'unload' });
    // Try to save it as soon as the event takes place, rather than waiting for the periodic save
    saveLog();
  }

  /**
  * This event will register the event of the window gaining focus.
  * It will occur when the focus comes back to the window after going to another tab,
  * or minimizing the window
  */
  /**
  * TODO: check if we would still need this auxiliary variable
  *  We need an auxiliary variable, as certain versions of chrome trigger
  * the same event twice
  */

  function processWindowFocusEvent() {
    if (!windowIsFocused) {
      windowIsFocused = true;
      const eventTS = datestampInMillisec();
      writeLog(eventTS, { event: 'windowfocus' });
    }
  }

  /**
  * This event will register the event of the window losing focus.
  * It will occur when the focus on the window is lost
  * after going to another tab, or minimizing the window
  */
  function processWindowBlurEvent() {
    if (windowIsFocused) {
      windowIsFocused = false;

      const eventTS = datestampInMillisec();
      writeLog(eventTS, { event: 'windowblur' });
    }
  }


  /**
    * Extracts and encodes form inputs in the page. Content from text areas are also extracted
    */
  function getFormInputs() {
    let formInputs = '';
    // $('input').css('background-color','blue')
    // $('input').css('background-color','')

    $('input,select,textarea').each((index, element) => {
      formInputs += `${$(element).attr('id')}:${$(element).val()};`;
    });
    return (formInputs);
  }

  /**
   * Event to be triggered when a query is triggered. It will respond to a submit event
   */

  function processSubmitEvent(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();
    const { target } = e;
    const eventObj = {
      event: 'submit',
      formInputs: getFormInputs(),
    };
    Object.assign(eventObj, getNodeInfo(target));
    writeLog(eventTS, eventObj);
    saveLog();
  }

  // ////////////////MOBILE EVENTS////////////////

  // See https://developer.mozilla.org/en-US/docs/Web/API/Touch?redirectlocale=en-US&redirectslug=DOM%2FTouch
  function processMobileTouchStart(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const eventObj = { event: 'mobileTouchStart' };

    eventObj.numberOfTouches = e.touches.length;
    eventObj.isCtrlKey = e.ctrlKey;
    eventObj.isShiftKey = e.shiftKey;
    eventObj.isAltKey = e.altKey;
    eventObj.isMetaKey = e.metaKey;

    // Retrieve the list of all touch points
    eventObj.touchList = e.touches;

    Object.assign(eventObj, getNodeInfo(e.target));
    writeLog(eventTS, eventObj);
  }

  function processMobileTouchEnd(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    const eventObj = { event: 'mobileTouchEnd' };

    eventObj.numberOfTouches = e.touches.length;
    eventObj.isCtrlKey = e.ctrlKey;
    eventObj.isShiftKey = e.shiftKey;
    eventObj.isAltKey = e.altKey;
    eventObj.isMetaKey = e.metaKey;

    // Retrieve the list of all touch points
    eventObj.touchList = e.touches;

    Object.assign(eventObj, getNodeInfo(e.target));
    writeLog(eventTS, eventObj);

    // Was this touch event employed to select something?
    processIfHtmlIsSelected('touch', e.target);
  }

  /**
   * Gyroscope values to compare if values change
   */
  let gyroAlpha = 0;
  let gyroBeta = 0;
  let gyroGamma = 0;

  let gyroAlphaOld = 0;
  let gyroBetaOld = 0;
  let gyroGammaOld = 0;

  /**
   * This threshold will determine what is the minimum value for the
   * motion to be meaningful enough to be recorded
   */
  const gyroscopeThreshold = 10;

  // Update the event handler to do nothing more than store the values from the event

  function processMobileGyroscope(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    const eventTS = datestampInMillisec();

    // alpha: rotation around z-axis
    gyroAlpha = e.alpha;
    // beta: front back motion
    gyroBeta = e.beta;
    // gamma: left to right
    gyroGamma = e.gamma;

    // If any of the rotation axes changed significantly, save the event and store the new value
    if ((Math.abs(gyroAlphaOld - gyroAlpha) > gyroscopeThreshold)
      || (Math.abs(gyroBetaOld - gyroBeta) > gyroscopeThreshold)
      || (Math.abs(gyroGammaOld - gyroGamma) > gyroscopeThreshold)) {
      const eventObj = { event: 'mobileGyroscope' };

      gyroAlphaOld = gyroAlpha;
      gyroBetaOld = gyroBeta;
      gyroGammaOld = gyroGamma;

      eventObj.alpha = gyroAlpha;
      eventObj.beta = gyroBeta;
      eventObj.gamma = gyroGamma;

      writeLog(eventTS, eventObj);
    }
  }

  /**
   * Stores the orientation of the device
   */
  function processMobileOrientationChange() {
    const eventTS = datestampInMillisec();

    // The device is in portrait orientation if the device is held at 0 or 180 degrees
    // The device is in landscape orientation if the device is at 90 or -90 degrees

    const isPortrait = window.orientation % 180 === 0;
    // Set the class of the <body> tag according to the orientation of the device

    const orientation = isPortrait ? 'portrait' : 'landscape';

    const eventObj = { event: 'mobileOrientationChange' };

    eventObj.orientation = orientation;
    eventObj.orientationRaw = window.orientation;

    writeLog(eventTS, eventObj);
  }

  /**
   * Accelerometer values to compare if values change
   */
  let accX = 0;
  let accY = 0;
  let accZ = 0;

  let maxAcc = 0;
  let maxAccGrav = 0;
  const motionThreshold = 2;

  /**
  * Query the sensors and store them if bigger than temp values
  */

  function processMobileMotionEvent(e) {
    // ensures the function is only called on the target of the interaction, preventing bubble up
    if (e.target !== e.currentTarget) return;

    // Get the current acceleration values in 3 axes and find the greatest of these
    const accTemp = e.acceleration;

    const maxAccTemp = Math.max(Math.abs(accTemp.x), Math.abs(accTemp.y), Math.abs(accTemp.z));

    if (maxAccTemp > maxAcc) maxAcc = maxAccTemp;

    // Get the acceleration values including gravity and find the greatest of these
    const accGravity = e.accelerationIncludingGravity;
    const maxAccGravTemp = Math.max(accGravity.x, accGravity.y, accGravity.z);
    if (maxAccGravTemp > maxAccGrav) maxAccGrav = maxAccGravTemp;

    if (accTemp.x > accX) accX = accTemp.x;

    if (accTemp.y > accY) accY = accTemp.y;

    if (accTemp.z > accZ) accZ = accTemp.z;
  }

  /**
  * It periodically queries the value of the sensors and store them if bigger than the threshold
  */

  function processMobileMotionEventAndSave() {
    if (maxAcc > motionThreshold) {
      const eventTS = datestampInMillisec();

      // Output to the user the greatest current acceleration value in any axis, as
      // well as the greatest value in any axis including the effect of gravity
      // console.log("Current acceleration: " + maxAcc +  "m/s^2");
      // console.log("Value incl. gravity: " + maxAccGravity + "m/s^2");

      const eventObj = { event: 'mobileMotion' };

      eventObj.accX = accX;
      eventObj.accY = accY;
      eventObj.accZ = accZ;
      eventObj.maxAcc = maxAcc;
      eventObj.maxAccWithGrav = maxAccGrav;

      writeLog(eventTS, eventObj);

      // We reset the values so they can be refreshed in the next query
      accX = 0;
      accY = 0;
      accZ = 0;

      maxAcc = 0;
      maxAccGrav = 0;
    }
  }

  // ////////////////// End of event processing ///////////////////////////


  /**
   * Initializes all variables, event handlers, and interval functions and
   * invokes the logging of the load event
   */

  function initUcivit() {
    console.log('UCIVIT starts');

    updateEpisodeInformation();

    console.log(`userId: ${userId}`);
    console.log(`lastLogTS: ${lastLogTS}`);
    console.log(`episodeCount: ${episodeCount}`);

    logValLocked = false;

    mousemoveLastPosX = 0;
    mousemoveLastPosY = 0;

    /* initialize lastScrollPos_UsaProxy with current top/left offset */
    lastScrollPosY = (isNotOldIE) ? window.pageYOffset : document.body.scrollTop;
    lastScrollPosX = (isNotOldIE) ? window.pageXOffset : document.body.scrollLeft;

    lastSelection = '';

    /* log load event */
    processLoad();

    /**
     * registration of event handlers
     * most event handlers are attached to the document/window element
     * mouse events "bubble" from the target element (such as a button)
     * to the document element and can be captured there.
     * Other events such as focus, blur, change need to be directly
     * captured at the target element
     */

    // jQuery listeners
    // the use of a selector ensures all listeners register for elements added dynamically
    // TODO: Although convenient, I need to test the performance of using '*' as a selector

    // We will keep a list of all registered events
    const listenersArray = [];

    // entire document as target
    listenersArray.push({ target: document, event: 'mousedown', function: processMousedown });
    listenersArray.push({ target: document, event: 'mousemove', function: processMousemove });
    listenersArray.push({ target: document, event: 'mouseover', function: processMouseover });
    listenersArray.push({ target: document, event: 'mouseout', function: processMouseout });
    listenersArray.push({ target: document, event: 'mouseup', function: processMouseup });

    listenersArray.push({ target: document, event: 'contextmenu', function: processContextMenu });
    listenersArray.push({ target: document, event: 'cut', function: processCut });
    listenersArray.push({ target: document, event: 'copy', function: processCopy });
    listenersArray.push({ target: document, event: 'paste', function: processPaste });
    listenersArray.push({ target: document, event: 'dblclick', function: processDblClick });
    listenersArray.push({ target: document, event: 'error', function: processError });
    listenersArray.push({ target: document, event: 'hashchange', function: processhashChange });
    listenersArray.push({ target: document, event: 'mousewheel', function: processMousewheel });
    listenersArray.push({ target: document, event: 'select', function: processSelectText });

    listenersArray.push({ target: document, event: 'keydown', function: processKeydown });
    listenersArray.push({ target: document, event: 'keyup', function: processKeyUp });
    listenersArray.push({ target: document, event: 'keypress', function: processKeypress });

    listenersArray.push({ target: document, event: 'focusin', function: processFocus });
    listenersArray.push({ target: document, event: 'focusout', function: processBlur });

    /**
     * Replace the previous approach that looked for all form elements to attach an event.
     * Instead, all interface elements will register it.
     *
     * change, focus, and blur handler for each relevant element
     * dropdowns, lists, text fields/areas, file fields, password fields, and checkboxes
     * in addition change, focus, blur, and select listener will be applied to
     * each relevant element onmouseover (see function processMouseover)
     */

    listenersArray.push({ target: document, event: 'change', function: processChange });

    // Window target
    listenersArray.push({ target: window, event: 'resize', function: processResize });
    listenersArray.push({ target: window, event: 'unload', function: processUnload });
    listenersArray.push({ target: window, event: 'focus', function: processWindowFocusEvent });
    listenersArray.push({ target: window, event: 'blur', function: processWindowBlurEvent });

    // Specific targets
    listenersArray.push({ target: 'form,form-control', event: 'submit', function: processSubmitEvent });

    // Mobile events
    listenersArray.push({ target: document, event: 'touchstart', function: processMobileTouchStart });
    listenersArray.push({ target: document, event: 'touchend', function: processMobileTouchEnd });
    listenersArray.push({ target: document, event: 'orientationchange', function: processMobileOrientationChange });

    // Optionally, the following mobile events can also be captured
    /*
    window.addEventListener('deviceorientation', processMobileGyroscope, false);
    window.addEventListener('devicemotion', processMobileMotionEvent, false);
    window.setInterval(processMobileMotionEventAndSave,200);
    */

    listenersArray.forEach((listenerObj) => {
      $(listenerObj.target).off(listenerObj.event, '*', listenerObj.function);
      $(listenerObj.target).on(listenerObj.event, '*', listenerObj.function);
    });

    /* We also register a function to check the window focus periodically */
    setInterval(processWindowFocusQuery, windowFocusQueryFrequency);

    /* instantiate scroll check and save function being invoked periodically */
    setInterval(processScroll, scrollQueryFrequency);
    setInterval(saveLog, logSaveFrequency);
  }

  /**
    * Adds a reference to jQuery
    */
  function includeJquery() {
    // we add the script dinamically
    const jQueryScriptNode = document.createElement('script');
    jQueryScriptNode.id = 'proxyScript_jQuery';
    jQueryScriptNode.type = 'text/javascript';
    jQueryScriptNode.src = jQueryURL;
    document.getElementsByTagName('head')[0].appendChild(jQueryScriptNode);
  }

  /**
   * Before starting the logging, it ensures all requirements are met:
   * Jquery is loaded
   * timestamp from the server is available
   */
  function checkJquery(timePassed) {
    if (window.jQuery) {
      console.log(`requesting timestamp from ${timeQueryURL}`);
      // Once jQuery is available, request timestamp and start logging
      $.ajax({
        type: 'POST',
        url: timeQueryURL,
        dataType: 'jsonp',
      }).done((response) => {
        ucivitServerTS = parseInt(response.serverTime, 10);
        console.log(ucivitServerTS);
        initUcivit();
      }).fail((jqXHR, textStatus) => {
        console.log(`request failed ${textStatus}`);
      });
    } else if (timePassed > 1000) {
      includeJquery();
      checkJquery(0);
    } else {
      window.setTimeout(() => { checkJquery(timePassed + 100); }, 100);
    }
  }

  /**
   * Waits for up to 2 seconds for Jquery, if not, the script will load it
   */
  checkJquery(0);

  // end of the file JS wrap
})();
