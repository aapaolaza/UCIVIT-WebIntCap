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

  // /Particular to NodeInfo
  NODEID: 'id',
  NODENAME: 'name',
  NODEDOM: 'dom',
  NODEIMG: 'img',
  NODELINK: 'link',
  NODETEXT: 'text',
  NODETYPE: 'nodeType',
  NODETEXTVALUE: 'textvalue',
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
  NUMBEROFCHANGES: 'numberofchanges',

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
  SCROLLX: 'scrollx',
  SCROLLY: 'scrolly',

  // particular to selectContent
  SELECTIONTOOL: 'selectionTool',
  SELECTEDCONTENT: 'selectedContent',

  // particular to DOM events
  DOMCONTENT: 'domContent',

  // Server provided timestamp
  SESSIONSTARTMS: 'sessionStartTime',

  // User's timezone
  USERTIMEZONEOFFSET: 'timezoneoffset',

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
  BLUR: 'blur',
  CHANGE: 'change',
  CONTEXTMENU: 'contextmenu',
  COPY: 'copy',
  CUT: 'cut',
  DBLCLICK: 'dblclick',
  DOMCHANGE: 'domchange',
  FOCUS: 'focus',
  KEYDOWN: 'keydown',
  KEYPRESS: 'keypress',
  KEYUP: 'keyup',
  LOAD: 'load',
  MOUSEDOWN: 'mousedown',
  MOUSEMOVE: 'mousemove',
  MOUSEOUT: 'mouseout',
  MOUSEOVER: 'mouseover',
  MOUSEUP: 'mouseup',
  MOUSEWHEEL: 'mousewheel',
  PASTE: 'paste',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  SELECT_EXTRA: 'select_Extra',
  SELECT: 'select',
  SELECTEXTRA: 'selectextra',
  UNLOAD: 'unload',
  WINDOWFOCUS: 'windowfocus',
  WINDOWBLUR: 'windowblur',
  MOBILETOUCHSTART: 'mobileTouchStart',
  MOBILETOUCHEND: 'mobileTouchEnd',
  MOBILEORIENTATIONCHANGE: 'mobileOrientationChange',
  MOBILEGYROSCOPE: 'mobileGyroscope',
  MOBILEMOTION: 'mobileMotion',
  COOKIEDISCLAIMERSHOWN: 'cookiedisclaimershown',
  COOKIEDISCLAIMERACCEPTED: 'cookiedisclaimeraccepted',
  COOKIEDISCLAIMERREJECTED: 'cookiedisclaimerrejected',
  WINDOWQUERYFOCUS: 'windowqueryfocus',
  WINDOWQUERYBLUR: 'windowqueryblur',
  ANDYBBCTITLE: 'title',
  ANDYBBC: 'andyBBC',
  SURVEYSHOWN: 'surveyShown',
  SURVEYSTATE: 'surveyState',
  SUBMIT: 'submit',
}

module.exports.eventFields = eventFields;
