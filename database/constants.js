

const eventCollName = 'events';
const domCollName = 'domchanges';

// eventFields file will contain a mapping of all the fields available for the events

// i.e. instead of using event.timestampms, we will use the mapping to timestampms
// ALWAYS USE CAMELCASE NAMES!
const eventFields = {

  IPADDRESS: 'ip',
  TIMESTAMP: 'timestamp',
  TIMESTAMPMS: 'timestampms',
  EPISODECOUNT: 'episodeCount',
  SD: 'sd',
  SID: 'sid',
  EVENT: 'event',
  PLATFORM: 'platform',
  BROWSER: 'browser',
  URL: 'url',
  URLFULL: 'urlFull',

  // /Particular to NodeInfo
  NODEID: 'id',
  NODENAME: 'name',
  NODEDOM: 'dom',
  NODEIMG: 'img',
  NODELINK: 'link',
  NODETEXT: 'text',
  NODETYPE: 'nodeType',
  NODETEXTVALUE: 'textValue',
  NODETEXTCONTENT: 'textContent',

  // Particular to MouseCoordinates
  MOUSECOORD: 'coord',
  MOUSEOFFSET: 'offset',

  // Particular to the "change" event
  TYPE: 'type',
  CHECKED: 'checked',
  VALUE: 'value',
  SELECTED: 'selected',

  // particular to copy, cut and paste
  CONTENT: 'content',

  // particular to DomChange
  NUMBEROFCHANGES: 'numberOfChanges',

  // particular to Keydown, keypress and keyup
  KEY: 'key',

  // particular to Load and resize
  SIZE: 'size',
  RESOLUTION: 'resolution',
  HTMLSIZE: 'htmlSize',
  USABLESIZE: 'usableSize',

  // particular to mousedown and mouse up
  BUTTON: 'but',

  // particular to mousewheel
  DELTA: 'delta',

  // particular to scroll
  SCROLLX: 'scrollX',
  SCROLLY: 'scrollY',

  // particular to selectContent
  SELECTIONTOOL: 'selectionTool',
  SELECTEDCONTENT: 'selectedContent',

  // particular to DOM events
  DOMCONTENT: 'domContent',

  // Server provided timestamp
  SESSIONSTARTMS: 'sessionStartTime',

  // User's timezone
  USERTIMEZONEOFFSET: 'timezoneOffset',

  // Mobile event constants

  // TouchStart and TouchEnd
  MOBILENUMBEROFTOUCHES: 'numberOfTouches',
  MOBILEISCTRLKEY: 'isCtrlKey',
  MOBILEISSHIFTKEY: 'isShiftKey',
  MOBILEISALTKEY: 'isAltKey',
  MOBILEISMETAKEY: 'isMetaKey',

  // TouchObject
  MOBILETOUCHIDENTIFIER: 'identifier',
  MOBILETOUCHSCREENX: 'screenX',
  MOBILETOUCHSCREENY: 'screenY',
  MOBILETOUCHCLIENTX: 'clientX',
  MOBILETOUCHCLIENTY: 'clientY',
  MOBILETOUCHPAGEX: 'pageX',
  MOBILETOUCHPAGEY: 'pageY',
  MOBILETOUCHRADIUSX: 'radiusX',
  MOBILETOUCHRADIUSY: 'radiusY',
  MOBILETOUCHROTATIONANGLE: 'rotationAngle',
  MOBILETOUCHFORCE: 'force',

  // Gyroscope
  MOBILEGYROSCOPEALPHA: 'alpha',
  MOBILEGYROSCOPEBETA: 'beta',
  MOBILEGYROSCOPEGAMMA: 'gamma',

  // orientation
  MOBILEORIENTATION: 'orientation',
  MOBILEORIENTATIONRAW: 'orientationRaw',

  // motion
  MOBILEMOTIONACCELX: 'accX',
  MOBILEMOTIONACCELY: 'accY',
  MOBILEMOTIONACCELZ: 'accZ',
  MOBILEMOTIONACCELMAX: 'maxAcc',
  MOBILEMOTIONACCELMAXINCLGRAV: 'maxAccWithGrav',

  // Form inputs for the submit event
  FORMINPUTS: 'formInputs',

  // //////////////////////////////////EVENTNAMES/////////////////////////////////////////////////
  EVENTLIST: ['blur', 'change', 'contextmenu', 'copy', 'cut', 'dblclick', 'domchange', 'focus', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'paste', 'resize', 'scroll', 'select_Extra', 'select', 'selectextra', 'unload', 'windowfocus', 'windowblur', 'mobileTouchStart', 'mobileTouchEnd', 'mobileOrientationChange', 'mobileGyroscope', 'mobileMotion', 'cookiedisclaimershown', 'cookiedisclaimeraccepted', 'cookiedisclaimerrejected', 'windowqueryfocus', 'windowqueryblur', 'title', 'andyBBC', 'surveyShown', 'surveyState', 'submit'],

  DOMEVENT: 'domData',
};

const visEventFields = {

  IPADDRESS: 'ip',
  TIMESTAMPMS: 'timestampms',
  EPISODECOUNT: 'episodeCount',
  SD: 'sd',
  SID: 'sid',
  EVENT: 'event',
  PLATFORM: 'platform',
  BROWSER: 'browser',
  URL: 'url',

  // TODO: Add the event information from the visualisations

  // //////////////////////////////////EVENTNAMES/////////////////////////////////////////////////
  // TODO: add to the list the events to be recovered from the visualisations.
  EVENTLIST: ['visEvent'],
};

module.exports.eventCollName = eventCollName;
module.exports.domCollName = domCollName;
module.exports.eventFields = eventFields;
module.exports.visEventFields = visEventFields;
