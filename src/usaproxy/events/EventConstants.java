package usaproxy.events;

/**
 * This class contains all (or the majority) of constants used throughout the document.
 * This includes the taxonomy employed by the JavaScript to name different attributes,
 * like "event" for the type of event recorded, or "time" for the timestamp.
 * 
 */
public class EventConstants {
	/**
	public static enum EventsEnum{
	    blur, change, contextmenu, copy,
	    cut, dblclick, domchange, focus,
	    keydown, keypress, keyup,
	    load, mousedown, mousemove,
	    mouseout, mouseover, mouseup,
	    mousewheel, paste, resize,
	    scroll, 
	    select_Extra, select, selectextra,
	    //This different select events occur due to a strange behaviour when detecting selection, which results in different events
	    unload
	}
	*/
	//Generic attribute names
	
	public final static String IPADDRESS = "ip";
	
	public final static String TIMESTAMP = "time";
	public final static String EPISODECOUNT = "episodeCount";
	
	public final static String SD = "sd";
	
	public final static String SID = "sid";
	
	public final static String EVENTNAME = "event";
	
	public final static String PLATFORM = "platform";

	public final static String BROWSER = "browser";
	
	public final static String URL = "url";
	
	///Particular to NodeInfo
	
	public final static String NODEID = "id";
	
	public final static String NODENAME = "name";
	
	public final static String NODEDOM = "dom";
	
	public final static String NODEIMG = "img";
	
	public final static String NODELINK = "link";

	public final static String NODETEXT = "text";
	
	public final static String NODETYPE = "nodeType";
	
	public final static String NODETEXTVALUE = "textValue";
	
	public final static String NODETEXTCONTENT = "textContent";

	//Particular to MouseCoordinates
	
	public final static String MOUSECOORD = "coord";
	
	public final static String MOUSEOFFSET = "offset";
	 
	//Particular to the "change" event
	public final static String TYPE = "type";
	
	public final static String CHECKED = "checked";
	
	public final static String VALUE = "value";
	
	public final static String SELECTED = "selected";
	
	//particular to copy, cut and paste
	public final static String CONTENT = "content";	
	
	//particular to DomChange
	public final static String NUMBEROFCHANGES = "numberofchanges";
	
	//particular to Keydown, keypress and keyup
	public final static String KEY = "key";
	
	//particular to Load and resize
	public final static String SIZE = "size";
	
	public final static String RESOLUTION = "resolution";
	
	public final static String HTMLSIZE = "htmlSize";
	
	public final static String USABLESIZE = "usableSize";

	//particular to mousedown and mouse up
	public final static String BUTTON = "but";

	//particular to mousewheel
	public final static String DELTA = "delta";
	
	//particular to scroll
	public final static String SCROLLX = "scrollx";

	public final static String SCROLLY = "scrolly";
	
	//particular to selectContent
	public final static String SELECTIONTOOL= "selectionTool";
	public final static String SELECTEDCONTENT= "selectedContent";

	//particular to DOM events
	public static final String DOMCONTENT = "domContent";

	//Server provided timestamp
	public static final String SESSIONSTARTMS = "sessionStartTime";
	
	//User's timezone
	public static final String USERTIMEZONEOFFSET = "timezoneoffset";
	
	//Mobile event constants
	//TouchStart and TouchEnd
	public static final String MOBILENUMBEROFTOUCHES = "numberOfTouches";
	public static final String MOBILEISCTRLKEY = "isCtrlKey";
	public static final String MOBILEISSHIFTKEY = "isShiftKey";
	public static final String MOBILEISALTKEY = "isAltKey";
	public static final String MOBILEISMETAKEY = "isMetaKey";
	
	//TouchObject
	public static final String MOBILETOUCHIDENTIFIER = "identifier";
	public static final String MOBILETOUCHSCREENX = "screenX";
	public static final String MOBILETOUCHSCREENY = "screenY";
	public static final String MOBILETOUCHCLIENTX = "clientX";
	public static final String MOBILETOUCHCLIENTY = "clientY";
	public static final String MOBILETOUCHPAGEX = "pageX";
	public static final String MOBILETOUCHPAGEY = "pageY";
	public static final String MOBILETOUCHRADIUSX = "radiusX";
	public static final String MOBILETOUCHRADIUSY = "radiusY";
	public static final String MOBILETOUCHROTATIONANGLE = "rotationAngle";
	public static final String MOBILETOUCHFORCE = "force";
	
	//Gyroscope
	public static final String MOBILEGYROSCOPEALPHA = "alpha";
	public static final String MOBILEGYROSCOPEBETA = "beta";
	public static final String MOBILEGYROSCOPEGAMMA = "gamma";
	
	//orientation
	public static final String MOBILEORIENTATION = "orientation";
	public static final String MOBILEORIENTATIONRAW = "orientationRaw";
	
	//motion
	
	public static final String MOBILEMOTIONACCELX = "accX";
	public static final String MOBILEMOTIONACCELY = "accY";
	public static final String MOBILEMOTIONACCELZ = "accZ";
	public static final String MOBILEMOTIONACCELMAX = "maxAcc";
	public static final String MOBILEMOTIONACCELMAXINCLGRAV = "maxAccWithGrav";

	
	//Form inputs for the submit event
	public static final String FORMINPUTS = "formInputs";

	// //////////////////////////////////EVENTNAMES/////////////////////////////////////////////////
	public final static String BLUR = "blur";

	public final static String CHANGE = "change";

	public final static String CONTEXTMENU = "contextmenu";

	public final static String COPY = "copy";

	public final static String CUT = "cut";

	public final static String DBLCLICK = "dblclick";

	public final static String DOMCHANGE = "domchange";

	public final static String FOCUS = "focus";

	public final static String KEYDOWN = "keydown";

	public final static String KEYPRESS = "keypress";

	public final static String KEYUP = "keyup";

	public final static String LOAD = "load";

	public final static String MOUSEDOWN = "mousedown";

	public final static String MOUSEMOVE = "mousemove";

	public final static String MOUSEOUT = "mouseout";

	public final static String MOUSEOVER = "mouseover";

	public final static String MOUSEUP = "mouseup";

	public final static String MOUSEWHEEL = "mousewheel";

	public final static String PASTE = "paste";

	public final static String RESIZE = "resize";

	public final static String SCROLL = "scroll";

	public final static String SELECT_EXTRA = "select_Extra";

	public final static String SELECT = "select";

	public final static String SELECTEXTRA = "selectextra";

	public final static String UNLOAD = "unload";

	public final static String WINDOWFOCUS = "windowfocus";

	public final static String WINDOWBLUR = "windowblur";

	public final static String MOBILETOUCHSTART = "mobileTouchStart";

	public final static String MOBILETOUCHEND = "mobileTouchEnd";

	public final static String MOBILEORIENTATIONCHANGE = "mobileOrientationChange";

	public final static String MOBILEGYROSCOPE = "mobileGyroscope";

	public final static String MOBILEMOTION = "mobileMotion";

	public final static String COOKIEDISCLAIMERSHOWN = "cookiedisclaimershown";

	public final static String COOKIEDISCLAIMERACCEPTED = "cookiedisclaimeraccepted";

	public final static String COOKIEDISCLAIMERREJECTED = "cookiedisclaimerrejected";
	
	public final static String WINDOWQUERYFOCUS = "windowqueryfocus";

	public final static String WINDOWQUERYBLUR = "windowqueryblur";

	public static final String ANDYBBCTITLE = "title";

	public static final String ANDYBBC = "andyBBC";

	public static final String SURVEYSHOWN = "surveyShown";
	
	public static final String SURVEYSTATE = "surveyState";
	
	public static final String SUBMIT = "submit";
	

}
