/**CHANGES!!! This is not the original proxyscript, it was modified to allow developers to copypaste a script initialitation instead of a proxy approach. All the changes are tagged "CHANGE"**/





/** Core UsaProxy JavaScript part.

	This proxyscript.js is used for pure logging of user activity

	without any collaboration functionality */



var logVal_UsaProxy;			// String: Initialised when page loads. Contains current event log entries

var FLG_writingLogVal_UsaProxy;	// Boolean: if flag set, writing log entry to logVal_UsaProxy not possible



var IVL_saveLog_UsaProxy;		// Interval function variable for sending captured data to UsaProxy



var websiteID;      /* String: contains the ID of the Web site*/



//var id_UsaProxy;				// String: contains String identifying the current UsaProxy instance

								 

/* timestamp objects */



/* Date: Initialised by UsaProxy. Load completion timestamp is  

   calculated relative to this timestamp.

   * Doesn't need to be created as the server adds it with its corresponding value*/

//var startDate_UsaProxy;

startDate_UsaProxy = parseInt(startDate_UsaProxy);



var parsedStartDateServer = new Date(startDate_UsaProxy);





var loadDate_UsaProxy = new Date();	// Date: Initialised on load. All further timestamps are calculated

								// by adding the ms passed since page load completion to this

								//  relative timestamp.



var FLG_LogMousemove_UsaProxy;	// Boolean: while flag set, mousemove logging is interrupted 

								// for all following log attempts

var lastMousePosX_UsaProxy;		// Integer: last x position of the mouse pointer

var lastMousePosY_UsaProxy;		// Integer: last y position of the mouse pointer



var IVL_scrollCheck_UsaProxy;	// Interval function variable for processScroll_UsaProxy()

var lastScrollPosY_UsaProxy;	// Integer: last position of vertical scrollbar resp. top offset of document

var lastScrollPosX_UsaProxy;	// Integer: last position of vhorozontal scrollbar resp. left offset of document



var keyName_UsaProxy;			// String: holds current pressed key/key combination

var FLG_ctrlPressed_UsaProxy;	// Boolean: flag is set when ctrl-key is pressed (and reset when released)

var FLG_ctrl_comb_UsaProxy;		// additional flag for ctrl+key combinations

var FLG_altPressed_UsaProxy;	// Boolean: flag is set when alt-key is pressed (and reset when released)

var FLG_shiftPressed_UsaProxy;	// Boolean: flag is set when shift-key is pressed (and reset when released)

var FLG_keyPress_UsaProxy;		// Boolean: flag disables keypress check; set when any of the control keys is pressed

var FLG_comb_UsaProxy;			// Boolean: flag indicates a key combination

var combMembers_UsaProxy;		// Integer: number of remaining unreleased keys if a key combination was pressed



var lastSelection_UsaProxy;		// String: last selected text



		//console.log("At the start of the script" + getCookie(lastEventTSCookieName));





////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////New Constants////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////WHEEL VARIABLES////////////////////////////////////////////////////////////////////////

////This variables are needed globally to record the amount of "delta" scrolled with the mouse wheel



//wheelGranularity will determine how close the wheel events should be to be considered part of the same event

//The smaller this value, the finer the recording will be.

// eg. instead of recording one wheel movement of 14, it may record 2 of 7

var wheelGranularity=100;



//wheelQueryFrequency will determine how often we query the wheel function to see if it's time to log it

//It will basically determine how precise we will be from the moment the granularity time ends

var wheelQueryFrequency=50; 



var wheelLastEventTimestampGlobal = new Date();    //Timestamp storing the last wheel interaction

var wheelNodeGlobal = null;

var wheelDeltaGlobal = 0;



var wheelTimeOutFunction = null; //This function will be used





/////////////////////////SCROLL VARIABLES

var scrollQueryFrequency=200;



//////////////////////////WINDOW FOCUS STATE QUERY FREQUENCY

var windowFocusedQueryFrequency = 500;

var isWindowFocusedQuery = null;

//Interval function to check the focus state of the window

var IVL_windowFocusCheck;



/////////Variable for focus and blur events

var windowIsFocused = false;





////////////////////LOG SAVE FREQUENCY

var logSaveFrequency = 3000;



//////////////////////BROWSER VARIABLE



///////This variable will be used to discern if the browser is IE or not

var isNotOldIE;



////////////////////////////////////Mouse constants////////////////////////////////////



var mouseTimeout = 150;



////////////////////////////Session ID////////////////////

var sessionID = null;



var sessionIDCookieName = "proxyUserID";



var lastEventTSCookieName = "proxyLastEventTS";





//////////////////////////////Rejection cookie///////////////////

var cookieRejection = "captureRejection";





////////////////////////////Information sensitive Web applications////////////////////

//List of Web applications in which we'll take the sensitive approach for the cookies

var sensitiveWebs=[10008,20002,20006];



////////////////////////////Capture sensitive Web applications////////////////////

//List of Web applications in which we will hide sensitive data inputs, such as text entry and IP addresses

var inputEncodeWebs=['10011','10012','20001'];





////////////////////////////Cookie lifespan////////////////////

//Will determine the lifespan of the cookie, in days

var cookieLife = 10000;





///////////////////////Resize variables



var lastResizeWidth = 0;

var lastResizeHeigth = 0;

var lastResizeDate = 0;



////End of New Constants

////////////////////////////////////





////////////////////////////////////////////////////////////////////////

////////////////////////STARTING FUNCTIONS//////////////////////////////

////////////////////////////////////////////////////////////////////////



//We infer browser's version only at the start, we want it to be the first thing it does

inferClientInfo();



//Initializing the array of log requests

var xmlreqs_UsaProxy = new Array();	/** contains the currently used XMLHttpRequest objects */





/* Now init_UsaProxy is called from handleCookieButton and getSessionFromCookie

 * This way we make sure we don't record information from users who don't want to be recorded.*/

 

if(document.attachEvent)

	isNotOldIE = false;

else

	isNotOldIE = true;

	

	

//CHANGES: we get all data from our global variables (the inclussion of a port number breaks the parsing so the code didn't work)

	

websiteID	= window.webpageIndex;



protectedIds = [];

	

protectedIds = window.protectedIds;



/*Call onLoadExecution() function on document load*/

if (isNotOldIE)

{

	window.addEventListener('load', onLoadExecution, false);

	//console.log("is not IE");

}

else {

	window.attachEvent('onload', onLoadExecution);

	//console.log("is IE");

}



/*

 * This function contains all the calls that need to be executed when the Web page is loaded

 */ 

function onLoadExecution(){

	

	//CHANGE! I will only includeJquery if it has not been loaded after 2 seconds

	//Include jQuery

	//includeJquery();

	checkJquery(0);

	/*cookieApproachSelector is the first function to load, to check for the cookie and

	* Then start the capture. As some functions use Jquery, I should call it after

	* loading it, from the includeJquery() function

	*/

	

}



/** Delays the execution of the rest of the functions until jQuery is ready

 */

function checkJquery(timePassed) {

    if (window.jQuery) {

        onJQueryReady();

    } else if (timePassed > 1000){

		includeJquery();

		checkJquery(0);

	} else {

		timePassed += 100;

		//console.log("jQuery not loaded yet");

        window.setTimeout(function(){ checkJquery(timePassed); }, 100);

    }

}



/**

 * Functions to be called when jQuery is loaded correctly

 */ 

function onJQueryReady(){

	cookieApproachSelector();

	

}



///////////////////////////////////////////////////ANDY's BBC MODIFICATION///////////////////



//It only works if it's Andy's experiment

if (websiteID =="10009")

	window.setInterval("processAndyBBC()",100);



var previousTitle = "";



function processAndyBBC(){

	var title = document.getElementById("page_title").innerHTML;

	if (previousTitle!=title){

		previousTitle = title;

		writeLog_UsaProxy("andyBBC&title=" + encodeURIComponent(title));

		

	}

}





/**

 * I added jquery to use certain interesting functions

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" type="text/javascript"></script>

*/



function includeJquery(){



	//var jQuerySrc="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"

	var jQuerySrc="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"



	

	//we add the script dinamically

	var jQueryScriptNode = document.createElement('script');

	jQueryScriptNode.id='proxyScript_jQuery';

	jQueryScriptNode.type = 'text/javascript';

	jQueryScriptNode.src = jQuerySrc;



	document.getElementsByTagName('head')[0].appendChild(jQueryScriptNode);



}





/** Initializes all variables, event handlers, and interval functions and

 * invokes the logging of the load event 

 */

function init_UsaProxy() {

	

	//show survey?

	//surveyTestAndShow();

	

	//console.log("Cookie value at init_UsaProxy()" + getCookie(lastEventTSCookieName));





	logVal_UsaProxy 			= "";

	window.status 				= "";

	FLG_writingLogVal_UsaProxy 	= false;

	

	FLG_LogMousemove_UsaProxy 	= false;

	lastMousePosX_UsaProxy 		= 0;

	lastMousePosY_UsaProxy 		= 0;

	

	/* initialize lastScrollPos_UsaProxy with current top/left offset */

	lastScrollPosY_UsaProxy 	= (isNotOldIE) ? window.pageYOffset : document.body.scrollTop;

	lastScrollPosX_UsaProxy 	= (isNotOldIE) ? window.pageXOffset : document.body.scrollLeft;

	

	lastSelection_UsaProxy 		= "";

	

	keyName_UsaProxy 			= "";

	FLG_ctrlPressed_UsaProxy 	= false;

	FLG_ctrl_comb_UsaProxy		= false;

	FLG_altPressed_UsaProxy 	= false;

	FLG_shiftPressed_UsaProxy 	= false;

	FLG_keyPress_UsaProxy 		= true;

	FLG_comb_UsaProxy 			= false;

	combMembers_UsaProxy 		= 0;





	/* log load event */

	processLoad_UsaProxy();

	

	/* registration of event handlers

	 * most event handlers are attached to the document/window element

	 * mouse events "bubble" from the target element (such as a button)

	 * to the document element and can be captured there.

	 * Other events such as focus, blur, change need to be directly

	 * captured at the target element */

	

	// NS explicit event capturing

	/*if(window.Event) {

		document.captureEvents(Event.CHANGE | Event.MOUSEUP | Event.KEYPRESS | Event.KEYDOWN | Event.KEYUP | Event.MOUSEMOVE | Event.MOUSEOVER | Event.FOCUS | Event.BLUR | Event.SELECT

				| Event.DBCLICK | Event.DRAGDROP | Event.ERROR | Event.KEYUP | Event.MOUSEOUT | Event.MOUSEUP | Event.SELECT | Event.UNLOAD

				| Event.CONTEXTMENU | Event.CUT | Event.COPY | Event.PASTE | Event.HASHCHANGE | Event.MOUSEWHEEL | Event.WHEEL

		);

		//We add the extra events



		window.captureEvents(Event.RESIZE);

	}*/

	

	/* attach event handlers to avoid overwriting

	 * IE: attachEvent

	 * NS: addEventListener */

	 

	// IE

	if(document.attachEvent) {

		

		//alert("you are IE");

	

		document.attachEvent('onmousedown', processMousedown_UsaProxy);

		//document.attachEvent('onkeypress', processKeypress_UsaProxy);

		//document.attachEvent('onkeydown', processKeydown_UsaProxy);

		//document.attachEvent('onkeyup', processKeyup_UsaProxy);

		

		document.attachEvent('onmousemove', processMousemove_UsaProxy);

		document.attachEvent('onmouseover', processMouseover_UsaProxy);

		window.attachEvent('onresize', processResize_UsaProxy);

		

		//////////////////////////////////////////////////////////

		//////////////////ADDITION OF NEW EVENTS//////////////////

		//////////////////////////////////////////////////////////

		document.attachEvent('onmouseout', processMouseOut_ExtraEvent);

		document.attachEvent('onmouseup',  processMouseup_ExtraEvent);

		document.attachEvent('oncontextmenu', processContextMenu_ExtraEvent);

		document.attachEvent('oncut', processCut_ExtraEvent);

		document.attachEvent('oncopy', processCopy_ExtraEvent);

		document.attachEvent('onpaste', processPaste_ExtraEvent);

		document.attachEvent('ondblclick', processDblClick_ExtraEvent);

		document.attachEvent('onerror', processError_ExtraEvent);

		document.attachEvent('onhashchange', processhashChange_ExtraEvent);

		document.attachEvent('onmousewheel', processMousewheel_ExtraEvent);

		document.attachEvent('onselect', processSelectText_ExtraEvent);

		window.attachEvent('onbeforeunload', processUnload_ExtraEvent);

		

		document.attachEvent('onkeydown', processKeydown_ExtraEvent);

		document.attachEvent('onkeyup', processKeyUp_ExtraEvent);

		document.attachEvent('onkeypress', processKeypress_ExtraEvent);	

		

		document.attachEvent ("onfocusin", processFocus_UsaProxy);

		document.attachEvent ("onfocusout", processBlur_UsaProxy);			

		

		

		//////////////////////////////////////////////////////////

		//////////////////END OF ADDITION OF NEW EVENTS///////////

		//////////////////////////////////////////////////////////



		

		

		/* change, focus, and blur handler for each relevant element

		 * dropdowns, lists, text fields/areas, file fields, password fields, and checkboxes*/

		/* in addition change, focus, blur, and select listener will be applied to

		 * each relevant element onmouseover (see function processMouseover_UsaProxy) */

		for (var i = 0; i < document.forms.length; ++i) {

			for (var j = 0; j < document.forms[i].elements.length; ++j) {

				if(document.forms[i].elements[j].type) {

					var elType = document.forms[i].elements[j].type;

					if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {

						document.forms[i].elements[j].attachEvent('onchange', processChange_UsaProxy);

						//document.forms[i].elements[j].attachEvent('onblur', processBlur_UsaProxy);

						//document.forms[i].elements[j].attachEvent('onfocus', processFocus_UsaProxy);

					}

				}

			}

		}

	}

	

	// NS

	else {

		

		document.addEventListener('mousedown', processMousedown_UsaProxy, false);

		//document.addEventListener('keypress', processKeypress_UsaProxy, false);

		//document.addEventListener('keydown', processKeydown_UsaProxy, false);

		//document.addEventListener('keyup', processKeyup_UsaProxy, false);

		

		document.addEventListener('mousemove', processMousemove_UsaProxy, false);

		document.addEventListener('mouseover', processMouseover_UsaProxy, false);

		window.addEventListener('resize', processResize_UsaProxy, false);

		

		

		//////////////////////////////////////////////////////////

		//////////////////ADDITION OF NEW EVENTS//////////////////

		//////////////////////////////////////////////////////////

		

		document.addEventListener('mouseout', processMouseOut_ExtraEvent, false);

		document.addEventListener('mouseup',  processMouseup_ExtraEvent, false);

		document.addEventListener('contextmenu', processContextMenu_ExtraEvent, false);

		document.addEventListener('cut', processCut_ExtraEvent, false);

		document.addEventListener('copy', processCopy_ExtraEvent, false);

		document.addEventListener('paste', processPaste_ExtraEvent, false);

		document.addEventListener('dblclick', processDblClick_ExtraEvent, false);

		document.addEventListener('error', processError_ExtraEvent, false);

		document.addEventListener('hashchange', processhashChange_ExtraEvent, false);

		

		document.addEventListener('keydown', processKeydown_ExtraEvent, false);

		document.addEventListener('keyup', processKeyUp_ExtraEvent, false);

		document.addEventListener('keypress', processKeypress_ExtraEvent, false);



		

		//Firefox doesn't recognise 'mousewheel' as an event so we have to use 'DOMMouseScroll' instead.

		var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll":"mousewheel"

		

		document.addEventListener(mousewheelevt, processMousewheel_ExtraEvent, false);

		document.addEventListener('select', processSelectText_ExtraEvent, false);

		window.addEventListener('beforeunload', processUnload_ExtraEvent, false);

		

		document.addEventListener ("focusin", processFocus_UsaProxy, false);	

		document.addEventListener ("focusout", processBlur_UsaProxy, false);

		//////////////////////////////////////////////////////////

		//////////////////END OF ADDITION OF NEW EVENTS///////////

		//////////////////////////////////////////////////////////

		

		

		

		/* change, focus, and blur handler for each relevant element

		 * dropdowns, lists, text fields/areas, file fields, password fields, and checkboxes*/

		/* in addition change, focus, blur, and select listener will be applied to

		 * each relevant element onmouseover (see function processMouseover_UsaProxy) */

		for (var i = 0; i < document.forms.length; ++i) {

			for (var j = 0; j < document.forms[i].elements.length; ++j) {

				if(document.forms[i].elements[j].type) {

					var elType = document.forms[i].elements[j].type;

					if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {

						document.forms[i].elements[j].addEventListener('change', processChange_UsaProxy, false);

						//document.forms[i].elements[j].addEventListener('blur', processBlur_UsaProxy, false);

						//document.forms[i].elements[j].addEventListener('focus', processFocus_UsaProxy, false);

					}

				}

			}

		}

	}

	

	

	/* Registration of the Window focus and blur, that will tell us if the window is in the background  */

	

	/* We need an auxiliary variable, as certain versions of chrome trigger

	the same event twice

	*/

	window.onfocus = function () {

		if(!windowIsFocused){

			processWindowFocusEvent();

			windowIsFocused = true;

			//console.log("window focused");

		}

	}; 



	window.onblur = function () { 

		if(windowIsFocused){

			processWindowBlurEvent();

			windowIsFocused = false;

			//console.log("window blurred");

		}

	}; 



	/* We also register a function to check the window focuse periodically*/

	IVL_windowFocusCheck = setInterval("processWindowFocusQuery()", 1000);

		 

	/* instantiate scroll check and save function being invoked periodically */

	IVL_scrollCheck_UsaProxy 	= window.setInterval("processScroll_UsaProxy()",scrollQueryFrequency);

	IVL_saveLog_UsaProxy 		= window.setInterval("saveLog_UsaProxy()",logSaveFrequency);

	



	includeMobileEvents();



}



/**

 * This function will register the corresponding events for mobile devices.

 * I put them in a separate function in case it would be useful to call them only

 * if the found device is mobile.

 */ 

function includeMobileEvents(){



	window.addEventListener('touchstart', processMobileTouchStart, false);

	window.addEventListener('touchend', processMobileTouchEnd, false);

	window.addEventListener('deviceorientation', processMobileGyroscope, false);

	

	window.addEventListener('orientationchange', processMobileOrientationChange, false);

	

	window.addEventListener('devicemotion', processMobileMotionEvent, false);

	window.setInterval("processMobileMotionEventAndSave()",200);





}



//See https://developer.mozilla.org/en-US/docs/Web/API/Touch?redirectlocale=en-US&redirectslug=DOM%2FTouch

function processMobileTouchStart(e) {

	

	var eventString ="mobileTouchStart";

	

	eventString += "&numberOfTouches=" + e.touches.length

					+ "&isCtrlKey=" + e.ctrlKey

					+ "&isShiftKey=" + e.shiftKey

					+ "&isAltKey=" + e.altKey

					+ "&isMetaKey=" + e.metaKey;



	var touchObject;

	//To identify each touch elements' properties, we will add the index to the variable name

	for (touchIndex = 0; touchIndex < e.touches.length; touchIndex++){

		touchObject = e.touches[touchIndex];

		

		eventString += "&identifier"+touchIndex+"=" + touchObject.identifier

					+ "&screenX"+touchIndex+"=" + touchObject.screenX

					+ "&screenY"+touchIndex+"=" + touchObject.screenY

					+ "&clientX"+touchIndex+"=" + touchObject.clientX

					+ "&clientY"+touchIndex+"=" + touchObject.clientY

					+ "&pageX"+touchIndex+"=" + touchObject.pageX

					+ "&pageY"+touchIndex+"=" + touchObject.pageY

					+ "&radiusX"+touchIndex+"=" + touchObject.radiusX

					+ "&radiusY"+touchIndex+"=" + touchObject.radiusY

					+ "&rotationAngle"+touchIndex+"=" + touchObject.rotationAngle

					+ "&force"+touchIndex+"=" + touchObject.force;

	}

	

	eventString += generateEventString_UsaProxy(e.target);

	

	writeLog_UsaProxy(eventString);

}





function processMobileTouchEnd(e) {

	 

	var eventString ="mobileTouchEnd";

	

	eventString += "&numberOfTouches=" + e.touches.length

					+ "&isCtrlKey=" + e.ctrlKey

					+ "&isShiftKey=" + e.shiftKey

					+ "&isAltKey=" + e.altKey

					+ "&isMetaKey=" + e.metaKey;

					

	var touchObject;

	//To identify each touch elements' properties, we will add the index to the variable name

	for (touchIndex = 0; touchIndex < e.touches.length; touchIndex++){

		touchObject = e.touches[touchIndex];

		

		eventString += "&identifier"+touchIndex+"=" + touchObject.identifier

					+ "&screenY"+touchIndex+"=" + touchObject.screenY

					+ "&screenY"+touchIndex+"=" + touchObject.screenY

					+ "&clientX"+touchIndex+"=" + touchObject.clientX

					+ "&clientY"+touchIndex+"=" + touchObject.clientY

					+ "&pageX"+touchIndex+"=" + touchObject.pageX

					+ "&pageY"+touchIndex+"=" + touchObject.pageY

					+ "&radiusX"+touchIndex+"=" + touchObject.radiusX

					+ "&radiusY"+touchIndex+"=" + touchObject.radiusY

					+ "&rotationAngle"+touchIndex+"=" + touchObject.rotationAngle

					+ "&force"+touchIndex+"=" + touchObject.force;

	}

	

	eventString += generateEventString_UsaProxy(e.target);

	

	writeLog_UsaProxy(eventString);

	

	//Was this mouose event employed to select something?

	processIfHtmlIsSelected("touch", target);

}



var alpha = 0,

    beta = 0,

    gamma = 0;



var alphaOld = 0,

    betaOld = 0,

    gammaOld = 0;

    

    //This threshold will determine what is the minimum value for the motion to be meaningful enough to be recorded

var gyroscopeThreshold = 10;

     

// Update the event handler to do nothing more than store the values from the event

 

function processMobileGyroscope(e) {

	//alpha: rotation around z-axis

	alpha = e.alpha;

	//beta: front back motion

	beta = e.beta;

	//gamma: left to right

	gamma = e.gamma;	



	if ((Math.abs(alphaOld-alpha) > gyroscopeThreshold) || (Math.abs(betaOld-beta) > gyroscopeThreshold) ||  (Math.abs(gammaOld-gamma) > gyroscopeThreshold)){

		var eventString = "mobileGyroscope";



		//console.log("Alpha: " + alpha + ", Beta: " + beta + ", Gamma: " + gamma);

		alphaOld = alpha;

		betaOld = beta;

		gammaOld = gamma;

		

		eventString += "&alpha=" + alpha

					+ "&beta=" + beta

					+ "&gamma=" + gamma;

		writeLog_UsaProxy(eventString);

	}

}



function processMobileOrientationChange(e) {

 

	// The device is in portrait orientation if the device is held at 0 or 180 degrees

	// The device is in landscape orientation if the device is at 90 or -90 degrees

 	//console.log("processMobileOrientationChange");



	var isPortrait = window.orientation % 180 === 0;

 

	// Set the class of the <body> tag according to the orientation of the device

 

	var orientation = isPortrait ? 'portrait' : 'landscape';

	

	var eventString = "mobileOrientationChange";

	eventString += "&orientation=" + orientation

	eventString += "&orientationRaw=" + window.orientation

	writeLog_UsaProxy(eventString);

}



// Define an event handler function for processing the device’s acceleration values

 

var accX = 0,

    accY = 0,

    accZ = 0;



var maxAcc = 0;

var maxAccGrav = 0;



var motionThreshold = 2;



/**

 * Query the sensors and store them if bigger than temp values

 */ 

function processMobileMotionEvent(e) {

 

    // Get the current acceleration values in 3 axes and find the greatest of these



	var accTemp = e.acceleration;



	var maxAccTemp = Math.max(Math.abs(accTemp.x), Math.abs(accTemp.y), Math.abs(accTemp.z));

	if (maxAccTemp > maxAcc)

		maxAcc = maxAccTemp;



	// Get the acceleration values including gravity and find the greatest of these

	var accGravity = e.accelerationIncludingGravity;

	var maxAccGravTemp = Math.max(accGravity.x, accGravity.y, accGravity.z);

	if (maxAccGravTemp > maxAccGrav)

		maxAccGrav = maxAccGravTemp;



	if (accTemp.x > accX)

		accX = accTemp.x;

	if (accTemp.y > accY)

		accY = accTemp.y;

	if (accTemp.z > accZ)

		accZ = accTemp.z;

}



/**

 * It periodically queries the value of the sensors and store them if bigger than the threshold

 */ 

function processMobileMotionEventAndSave(e) {





	//if ((accX > motionThreshold) || (accY > motionThreshold) ||  (accZ > motionThreshold)){

	if (maxAcc > motionThreshold){





		// Output to the user the greatest current acceleration value in any axis, as

		// well as the greatest value in any axis including the effect of gravity

	 

		//console.log("Current acceleration: " + maxAcc +  "m/s^2");

		//console.log("Value incl. gravity: " + maxAccGravity + "m/s^2");





		var eventString = "mobileMotion";

		eventString += "&accX=" + accX

					+ "&accY=" + accY

					+ "&accZ=" + accZ

					+ "&maxAcc=" + maxAcc

					+ "&maxAccWithGrav=" + maxAccGrav;

	

		writeLog_UsaProxy(eventString);

		

		//We reset the values so they can be refreshed in the next query

		accX = 0;

		accY = 0;

		accZ = 0;



		maxAcc = 0;

		maxAccGrav = 0;

	}

}







/** Returns a Date object computed from a given datestamp string

 */ 

function date_UsaProxy(datestamp /*string*/) {



	var datestampTail 	= datestamp;

	var year 			= Number(datestampTail.substring(0,datestampTail.indexOf("-")));

	datestampTail 		= datestampTail.substring(datestampTail.indexOf("-")+1);

	var month 			= Number(datestampTail.substring(0,datestampTail.indexOf("-")));

	datestampTail 		= datestampTail.substring(datestampTail.indexOf("-")+1);

	var day 			= Number(datestampTail.substring(0,datestampTail.indexOf(",")));

	datestampTail 		= datestampTail.substring(datestampTail.indexOf(",")+1);

	var hours 			= Number(datestampTail.substring(0,datestampTail.indexOf(":")));

	datestampTail 		= datestampTail.substring(datestampTail.indexOf(":")+1);

	var mins 			= Number(datestampTail.substring(0,datestampTail.indexOf(":")));

	datestampTail 		= datestampTail.substring(datestampTail.indexOf(":")+1);

	var secs 			= Number(datestampTail);

	return			    new Date(year,month,day,hours,mins,secs);

}



/** Returns a timestamp string of the form "2004-12-31,23:59:59".

 * Takes UsaProxy's httptraffic log entry time as start time and adds

 * the difference between load time and current time 

 * DEPRECATED!!! No function should call this one, as parsing the date in the client results in

 * problems with the time zones

 **/

/*

function datestamp_UsaProxy() {

	if (loadDate_UsaProxy==null) loadDate_UsaProxy = new Date();

	var currentDate 	= new Date();

	// get milliseconds from load time

	var diffSecs 		= Math.abs(currentDate.getTime() - loadDate_UsaProxy.getTime());

	// return new Date object according to UsaProxy start time + diffMSecs

	var currentUPDate 	= new Date(startDate_UsaProxy + diffSecs);



	return currentUPDate.getFullYear() + "-" + completeDateVals(currentUPDate.getMonth()+1) + "-"

	  + completeDateVals(currentUPDate.getDate()) + "," + completeDateVals(currentUPDate.getHours())

	  + ":" + completeDateVals(currentUPDate.getMinutes())

	  + ":" + completeDateVals(currentUPDate.getSeconds())

	  + ":" + completeDateValsMilliseconds(currentUPDate.getMilliseconds());

	  

}

* */



/**

 * Returns the same timestamp as datestamp_UsaProxy() but in milliseconds

 */

 

function datestampInMillisec() {

	if (loadDate_UsaProxy==null) loadDate_UsaProxy = new Date();

	var currentDate 	= new Date();

	// get milliseconds from load time

	var diffSecs 		= Math.abs(currentDate.getTime() - loadDate_UsaProxy.getTime());



	// return the value in ms of a new Date object according to UsaProxy start time + diffMSecs

	return (startDate_UsaProxy + diffSecs);

}



/** Completes single-digit numbers by a "0"-prefix

 *  */

function completeDateVals(dateVal) {

	var dateVal = "" + dateVal;

	if (dateVal.length<2) return "0" + dateVal;

	else return dateVal;

}



/** Completes single-digit numbers by a "0"-prefix

 * This is a special case for milliseconds, in which we will add up to two zeros 

 * */

function completeDateValsMilliseconds(dateVal) {

	var dateVal = "" + dateVal;

	if (dateVal.length<2) return "00" + dateVal;

	if (dateVal.length<3) return "0" + dateVal;

	else return dateVal;

}

  

/** Appends an event log entry together with the httptrafficindex referencing this page,

   the client's session ID,

 * and the current timestamp to logVal_UsaProxy */

function writeLog_UsaProxy(text) {

	

	//console.log("Recording: "+text);

	//We add the browser version

	text = appendClientContextInformation(text);

	

	

	// if function is already being executed, defer writeLog_UsaProxy for 50ms

	////DEBUG TEST

	

	

	if(FLG_writingLogVal_UsaProxy) {

		window.setTimeout("writeLog_UsaProxy(" + text + ")",50);

		//console.log("writeLog was deferred, its content were: " + text.substring(0,20));

		return false;}

	

		//console.log("The following event will be written, its content are: " + text.substring(0,20));

	

		//CHANGE! added additional parameters after "text"

	

	var url=window.location.href;

	url=url.replace("#","");

	

	// generate and append log entry

	

	//we will also store users' timezone

	var timezoneOffset = new Date().getTimezoneOffset();

	

	var logline;

	logLine = "time=" + datestampInMillisec() + "&sessionStartTime=" + startDate_UsaProxy 

		+ "&timezoneoffset=" + timezoneOffset + "&sd=" + websiteID 

		+ "&sid=" + sessionID + "&event=" + text

		+ "&url=" + encodeURIComponent(url)

		+ "&needsEncoding=" + (inputEncodeWebs.indexOf(websiteID)!=-1);

		

	//logline += "&needsEncoding=" + (inputEncodeWebs.indexOf(websiteID)!=-1);

	

	// set synchronization flag (block function)

	FLG_writingLogVal_UsaProxy = true;

	logVal_UsaProxy = logVal_UsaProxy + logLine + "&xX"; // Add logLine to interaction log

	// reset synchronization flag (release function)

	FLG_writingLogVal_UsaProxy = false;

}



//CHANGE!!! now this function returns textContent as well, it will be useful!!

/** Returns all available node information such as the DOM path, an image name, href, etc. */

function generateEventString_UsaProxy(node /*DOM element*/) {

	var eventString = "";

	eventString = eventString + "&dom=" + getDOMPath(node);  // append DOM path

	

	//if target has an id property

	if (node.id){

		eventString = eventString + "&id=" + node.id;

	}

	

	//if target has a name property

	if (node.name){

		eventString = eventString + "&name=" + node.name;  // append DOM path

	}



	// if target has a href property

	if (node.href) {

		/* image detection IE: IE doesn't register any src property

		 * instead href contains the file path */

		if(node.nodeName=="img" || node.nodeName=="IMG") {	

			// if linked image (parent node is an <a>-element)

			if(node.parentNode.href)  

				eventString = eventString + "&img=" + getFileName(node.href) + "&link=" + node.parentNode.href;

			else eventString = eventString + "&img=" + getFileName(node.href);

		}

		// NS+IE: link detection

		else if(node.nodeName=="a" || node.nodeName=="A") {  // if anchor tag

			// IE: innertext property contains link text

			if (node.innerText)

				eventString = eventString + "&link=" + node.href + "&text=" + encodeURIComponent(node.innerText);

			// NS: text property contains link text

			else eventString = eventString + "&link=" + node.href + "&text=" + encodeURIComponent(node.text);

		}

	} else {

		if (node.src) {		

		// image detection NS

			if (node.parentNode.href)

				eventString = eventString + "&img=" + getFileName(node.src) + "&link=" + node.parentNode.href

			else eventString = eventString + "&img=" + getFileName(node.src);

		}

	}

	

	//Get textContent of the variable

	var textContent ="null";

	try{

  		if (node.firstChild.nodeValue!=null)

			textContent = node.firstChild.nodeValue.substring(0,100);

	}

	catch(err)

  	{

  		// Do nothing, as we just want to avoid looking into null elements

  	}



	



	eventString = eventString + "&nodeType=" + node.tagName + "&textContent=" + encodeURIComponent(textContent) + "&textValue=" + encodeURIComponent(node.value);

	//eventString = eventString + "&nodeType=" + node.tagName + "&textValue=" + encodeURIComponent(node.value);

		

	return eventString;

}



/** Returns file name of a URL/path */

function getFileName(path /*string*/) {

	if(path.lastIndexOf("/")>-1)

		return path.substring(path.lastIndexOf("/")+1);

	else return path;

}



/***** AJAX code.

	   Used with each logging request  */



/** Creates a new XMLHttpRequest object with a freed parameter 

   which indicates whether the object is currently operating 

   (e.g. expecting a UsaProxy response) */

function OBJ_XHR_UsaProxy(freed /*number*/){

	this.freed = freed;

	this.newReq = false;

	// NS

	//if(window.XMLHttpRequest) {

	if(isNotOldIE) {

	  	try { this.newReq = new XMLHttpRequest(); }

	  	catch(e) { this.newReq = false; }

	}

	// IE

	//else if(window.ActiveXObject) {

	else if(!isNotOldIE) {

		if (window.XDomainRequest) // Check whether the browser supports XDR. 

		{

			this.newReq = new XDomainRequest(); // Create a new XDR object.

        }

        else{

			try { this.newReq = new ActiveXObject("Microsoft.XMLHTTP"); }

			catch(e) {

				try { this.newReq = new ActiveXObject("Msxml2.XMLHTTP"); }

				catch(e) {

					this.newReq = false;

				}

			}

		}

	}

}



/** Sends an asynchronous HTTP request to UsaProxy.

	Examines each existent XMLHttpRequest object in xmlreqs_UsaProxy array,

	whether it is ready to handle this request. If not, a new OBJ_XHR_UsaProxy

	object is created with a freed value of 1 and added to the array.

	Then, the request is sent, freed is set to 0: occupied, and the readystatechange listener

	assigned the specified handler function. */

function xmlreqGET_UsaProxy(url /*string*/, callback_function /*string*/) {

	var pos = -1;

	for (var i=0; i< xmlreqs_UsaProxy.length; i++) {

		if (xmlreqs_UsaProxy[i].freed == 1) { pos = i; break; }

	}

	if (pos == -1) { pos = xmlreqs_UsaProxy.length; xmlreqs_UsaProxy[pos] = new OBJ_XHR_UsaProxy(1); }

	if (xmlreqs_UsaProxy[pos].newReq) {

		xmlreqs_UsaProxy[pos].freed = 0;

		xmlreqs_UsaProxy[pos].newReq.open("GET",url,true);

		xmlreqs_UsaProxy[pos].newReq.onreadystatechange = function() {

			if (window.xmlhttpChange_UsaProxy) {xmlhttpChange_UsaProxy(pos, callback_function); }

		}

		

		if (window.XMLHttpRequest) {

			xmlreqs_UsaProxy[pos].newReq.send(null);

		} else if (window.ActiveXObject) {

			xmlreqs_UsaProxy[pos].newReq.send();

		}

	}

}



/** Executes the specified handler function and 

    assigns it the received XML response provided by the used XMLHttpRequest object

	(stored in the array at position pos) */

function xmlhttpChange_UsaProxy(pos /*number*/, callback_function /*string*/) {

	if (typeof(xmlreqs_UsaProxy[pos]) != 'undefined' && xmlreqs_UsaProxy[pos].freed == 0 && xmlreqs_UsaProxy[pos].newReq.readyState == 4) {

		// try catch due to status exceptions in Firefox

		try {

			if (xmlreqs_UsaProxy[pos].newReq.status == 200 || xmlreqs_UsaProxy[pos].newReq.status == 304) {

				

				eval(callback_function + '(xmlreqs_UsaProxy[' + pos + '].newReq.responseXML)');

				

			} else {

				//handle_error();

			}

			xmlreqs_UsaProxy[pos].freed = 1;

		}

		catch( e ) {

			//alert('Caught Exception: ' + e.description);

		}

	}

}



/** end of AJAX code */



/** Sends tracked usage data (if available) to UsaProxy */

/**CHANGES: this method was changed. In the proxy approach no IP adress is required, but when using a copypaste approach the IP of the server running the UsaProxy server needs to be specified here **/

function saveLog_UsaProxy() {



	if(logVal_UsaProxy!="") {

		//timestamp shjould come from cookie

		//console.log("Before sending info" + getCookie(lastEventTSCookieName));

		xmlreqGET_UsaProxy("http://"+window.usaProxyServerIP+"/usaproxylolo/log?" + getCookie(lastEventTSCookieName) + "&xX" + logVal_UsaProxy, "");

		

		//we record current time as the last event recorded

		setCookie(lastEventTSCookieName, datestampInMillisec(), cookieLife);

		//console.log("After sending info" + getCookie(lastEventTSCookieName));



		logVal_UsaProxy = ""; // reset log data

	}

}



/** Event logging functionality */



/** Processes load event (logs load event together with the page size) */

function processLoad_UsaProxy(e) {

	/* get size

	 * NS: first case (window.innerWidth/innerHeight available); IE: second case */

	var loadWidth, loadHeight;

	loadWidth 	= (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;  // innerWidth=NS

	loadHeight 	= (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;  // innerHeight=NS

	writeLog_UsaProxy("load&size=" + loadWidth + "x" + loadHeight

			+"&resolution=" + screen.width + "x" + screen.height

			+"&htmlSize=" + jQuery(document).width() + "x" + jQuery(document).height()

			+"&usableSize=" + jQuery(window).width() + "x" + jQuery(window).height());

			

	//saveLog_UsaProxy();



	recordCurrentDOM();



}



/** Processes window resize event (logs resize event together with the page size) */

function processResize_UsaProxy(e) {

	/* get size

	 * NS: first case (window.innerWidth/innerHeight available); IE: second case */

	var newWidth, newHeight;

	newWidth 	= (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;  // innerWidth=NS

	newHeight 	= (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;  // innerHeight=NS

	

	//var screenWidth, screenHeight;

	//screen.height;

	//screen.width;

	

	//console.log ("Screen resolution:" + screen.height+","+screen.width);

	//console.log ("HTML document size" + jQuery(document).height()+","+jQuery(document).width());

	//console.log ("Viewport size" + jQuery(window).height()+","+jQuery(window).width());

	//console.log ("Recorded size" + newHeight+","+newWidth);

	//console.log ("#########################");

	

	//We check if we have recorded this size at this time already

	if (lastResizeWidth!=newWidth || lastResizeHeigth!=newHeight || lastResizeDate!= new Date().getTime()){

		lastResizeWidth = newWidth;

		lastResizeHeigth = newHeight;

		lastResizeDate = new Date().getTime();

		

		writeLog_UsaProxy("resize&size=" + newWidth + "x" + newHeight 

			+"&resolution=" + screen.width + "x" + screen.height

			+"&htmlSize=" + jQuery(document).width() + "x" + jQuery(document).height()

			+"&usableSize=" + jQuery(window).width() + "x" + jQuery(window).height());

	}

	//saveLog_UsaProxy();

}



/** Processes mousemove event if FLG_LogMousemove_UsaProxy isn't set 

   (FLG_LogMousemove_UsaProxy defers the next mousemove logging action

   for 150 ms) */

function processMousemove_UsaProxy(e) {

	

	/* get event target, x, and y value of mouse position

	 * NS: first case (window.Event available); IE: second case */

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	if (privacyCheck(ev))

	{

			return true;

	}

	



	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	// if log mousemove flag is false, set it true and log a mousemove event

	if (!FLG_LogMousemove_UsaProxy

		/** if mouse pointer actually moved */

		&& !(x==lastMousePosX_UsaProxy && y==lastMousePosY_UsaProxy) ) {

			FLG_LogMousemove_UsaProxy = true;

			window.setTimeout('setInaktiv_UsaProxy()',mouseTimeout);

			lastMousePosX_UsaProxy = x;

			lastMousePosY_UsaProxy = y;

			

			//console.log("mousemove recorded");

			

			writeLog_UsaProxy("mousemove&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

			//saveLog_UsaProxy();

	}

}



/* Resets the log mousemove blocking flag so that the next 

   mousemove event may be logged */

function setInaktiv_UsaProxy() {

	FLG_LogMousemove_UsaProxy = false;

}



/** Processes mouseover event.

 * logs mouseover events on all elements which have either an

 * id, name, href, or src property (logging more would cause a log overload).

   In addition it applies the appropriate direct event listeners to form elements */  

function processMouseover_UsaProxy(e) {

	

	/* get event target

	 * NS: first case (window.Event available); IE: second case 

	 * */

	

	var ev = (isNotOldIE) ? e : window.event;

	var target = (isNotOldIE) ? ev.target : ev.srcElement;

	

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	if (privacyCheck(ev))

		{

			//console.log("This instance won't be recorded"+target.id);

			return true;

		}

		

		

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

		//console.log("This instance will be recorded"+target.id);

	/* add appliable event listeners to hovered element */

	/* first, check if element has a type property.

	 * Secondly, check its type and apply listeners */

	 if(target.type) {

		if (target.type=="select-one" 

		 || target.type=="select-multiple"

		 || target.type=="text" 

		 || target.type=="textarea" 

		 || target.type=="file" 

		 || target.type=="checkbox" 

		 || target.type=="password"

		 || target.type=="radio") {

		 	// IE

		 	if(target.attachEvent) { 

				/* first, remove existent event listener

				 * detachEvent doesn�t give any errors if the listener 

				 * to be removed has not been added to target */

				// change listener

				target.detachEvent('onchange', processChange_UsaProxy);

				target.attachEvent('onchange', processChange_UsaProxy);

				if (target.type=="text" 

		 		 || target.type=="textarea" 

		 		 || target.type=="file" 

		 		 || target.type=="password" 

		 		 || target.type=="select-multiple") {

				 	// focus listener

				 	target.detachEvent('onfocus', processFocus_UsaProxy);

				 	target.attachEvent('onfocus', processFocus_UsaProxy);

					// blur listener

					target.detachEvent('onblur', processBlur_UsaProxy);

					target.attachEvent('onblur', processBlur_UsaProxy);

				 }

			}

			// NS

			else if (target.addEventListener) {

				/* first, remove existent event listener (equal to detachEvent) */

				// change listener

				target.removeEventListener('change', processChange_UsaProxy, false);

				target.addEventListener('change', processChange_UsaProxy, false);

				if (target.type=="text" 

		 		 || target.type=="textarea" 

		 		 || target.type=="file" 

		 		 || target.type=="password" 

		 		 || target.type=="select-multiple") {

				 	// focus listener

					target.removeEventListener('focus', processFocus_UsaProxy, false);

				 	target.addEventListener('focus', processFocus_UsaProxy, false);

					// blur listener

					target.removeEventListener('blur', processBlur_UsaProxy, false);

					target.addEventListener('blur', processBlur_UsaProxy, false);

				 }

				

			}

		}

	}

	

	// log mouseover coordinates and all available target attributes

	writeLog_UsaProxy("mouseover&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

}



/** Processes mouse release event.

   Logs mousedown event together with the mouse button type (if middle or

   right button), and the available event target properties.

   Since click might have occured also outside of form fields, images, or, hyperlinks,

   the mouse pointer position is recorded relative to the hovered-over area/element. */

function processMousedown_UsaProxy(e) {

	

	/* get event target, x, and y value of mouse position

	 * NS: first case (window.Event available); IE: second case */

	 

	/*var ev 		= (window.Event) ? e : window.event;

	var target 	= (window.Event) ? ev.target : ev.srcElement;

	var x 		= (window.Event) ? ev.pageX : ev.clientX;

	var y 		= (window.Event) ? ev.pageY : ev.clientY; */

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	/* check if text was selected, if true, discontinue, 

	  since this is handled by processSelection_UsaProxy */

	if(processSelection_UsaProxy(target)) return;

	

	if (privacyCheck(ev))

		return true;

	

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	/** mouse button detection: was middle or right mouse button clicked ?*/

	var mbutton = "l";//The default will be left

	if (ev.which) {  		// NS

		switch(ev.which) {

			case 2: mbutton = "m"; break;	// middle button

			case 3: mbutton = "r"; break;	// right button

		}

	} else if (ev.button) {		// IE

		switch(ev.button) {

			case 4: mbutton = "m"; break;

			case 2: mbutton = "r"; break;

		}

	}

	// log middle and right button events, continue if left button was clicked

	if (mbutton!="l") {



		////DEBUG START

		//alert("TEST");

		//printCookiesOnConsole();

		////DEBUG END

		writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

		//saveLog_UsaProxy();

		return;

	}

	/* end mouse button detection */

	/*

	// dropdown selection event is handled by function processChange_UsaProxy

	if(target.nodeName=="OPTION" || target.nodeName=="option") return; // do nothing

	if(target.nodeName=="SELECT" || target.nodeName=="select") return; // do nothing

	

	// radio button selection event is handled by function processChange_UsaProxy

	if(target.type && (target.type == "radio")) {

		return;

	}

	*/

	/* if regular click, log click coordinates relative to the clicked element

	   and all available target properties */

	writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

	

	

	recordCurrentDOM();

	//saveLog_UsaProxy();

}



/** Processes change event in select lists, input fields, textareas.

   Logs change event together with the corresponding field type, and

   a couple of field content properties such as the new field value. */

function processChange_UsaProxy(e) {

	

	/* get event target

	 * NS: first case (window.Event available); IE: second case */

	/*var ev 		= (window.Event) ? e : window.event;

	var target 	= (window.Event) ? ev.target : ev.srcElement;*/

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	

	if (privacyCheck(ev))

		return true;

	

	// if select list, log the selected entry's value

	if (target.type=="select-multiple") {

		var value = "";

		// check which entries were selected

		for (var i = 0; i < target.options.length; i++)

			if (target.options[ i ].selected)

				{value = value + target.options[ i ].value;}

				

		// log entries

		writeLog_UsaProxy("change&type=select-multiple"

						+ generateEventString_UsaProxy(target) + "&value=" + encodeURIComponent(value)) ;

		

		//saveLog_UsaProxy();

	}

	

	// if dropdown menu, log the selected entry's value

	else if (target.type=="select-one") { 

		

		writeLog_UsaProxy("change&type=select-one"

			+ generateEventString_UsaProxy(target) + "&value=" 

			+ encodeURIComponent(target.options[target.selectedIndex].value)

			+ "&selected=" + target.selectedIndex);

		

		//saveLog_UsaProxy();

	}

	

	// if text field/area, file field, log changed value

	else if (target.type=="text" || target.type=="textarea" || target.type=="file") {

		

		writeLog_UsaProxy("change&type=" + target.type 

			+ generateEventString_UsaProxy(target) + "&value=" + encodeURIComponent(target.value));

		

		//saveLog_UsaProxy();

	}

	

	// log that checkbox was checked/unchecked

	else if (target.type=="checkbox") {

		var value = "";

		// check boxes in checkbox group

		if(target.length>1) { 

			for ( i=0 ; i < target.length ; i++ ){ 

				if (target[i].checked==true)  

					value = value + "." + target[i].value;

			}

			if (value=="") value = "none";

		// single checkbox

		} else {value==target.checked}

		// log entries

		

		writeLog_UsaProxy("change&type=" + target.type + "&checked=" + target.checked + generateEventString_UsaProxy(target));

	}

		//saveLog_UsaProxy();

	

	// in the case of a password field, log only THAT content was modified

	else if (target.type=="password") {

		//saveLog_UsaProxy();

		writeLog_UsaProxy("change&type=" + target.type + generateEventString_UsaProxy(target));

	}

	

	// log that radio button was clicked

	else if (target.type=="radio") {

		// log entries

		writeLog_UsaProxy("change&type=" + target.type + generateEventString_UsaProxy(target));

		//saveLog_UsaProxy();

	}

	

}





/** Processes scrolling of the page.

 * Function is invoked periodically since no explicit scroll event is triggered.

   The page offset is logged in the form of a percentage value relative

   to the total HTML document height/width */

function processScroll_UsaProxy() {

	

	/** since total HTML height/width may be modified through font size settings

	    it must be computed each time a scrolling is performed */

		

	var scrollHeight_UsaProxy;

	var scrollWidth_UsaProxy;

	

	if (document.documentElement && document.documentElement.scrollHeight)

		// Explorer 6 Strict

	{

		scrollHeight_UsaProxy = document.documentElement.scrollHeight;

		scrollWidth_UsaProxy = document.documentElement.scrollWidth;

	}

	else if (document.body) // all other Explorers

	{

		scrollHeight_UsaProxy 	= document.documentElement.scrollHeight;

		scrollWidth_UsaProxy 	= document.documentElement.scrollWidth;

	}



	/* get current offset */

	 

	if (self.pageYOffset) // all except Explorer

	{

		currentScrollPosX = self.pageXOffset;

		currentScrollPosY = self.pageYOffset;

	}

	else if (document.documentElement && document.documentElement.scrollTop)

		// Explorer 6 Strict

	{

		currentScrollPosX = document.documentElement.scrollLeft;

		currentScrollPosY = document.documentElement.scrollTop;

	}

	else if (document.body) // all other Explorers

	{

		currentScrollPosX = document.body.scrollLeft;

		currentScrollPosY = document.body.scrollTop;

	}



	// if vertical scrollbar was moved new scrollbar position is logged

	if(lastScrollPosY_UsaProxy != currentScrollPosY) {

	

		/** e.g. 100, 80, 6, 0 */

		var percentOfHeight = "" + Math.round(currentScrollPosY/scrollHeight_UsaProxy * 100);

		/** shift */

		if(percentOfHeight.length==0) percentOfHeight = "000";

		if(percentOfHeight.length==1) percentOfHeight = "00" + percentOfHeight;

		if(percentOfHeight.length==2) percentOfHeight = "0" + percentOfHeight;

		percentOfHeight = percentOfHeight.substring(0,1) + "." + percentOfHeight.substring(1);

	

		writeLog_UsaProxy("scroll&scrolly=" + percentOfHeight);

		// set last scrollbar position

		lastScrollPosY_UsaProxy = currentScrollPosY;

		//saveLog_UsaProxy();

	}

	// if horizontal scrollbar was moved new scrollbar position is logged

	if(lastScrollPosX_UsaProxy != currentScrollPosX) {

	

		var percentOfWidth = "" + Math.round(currentScrollPosX/scrollWidth_UsaProxy * 100);

		/** shift */

		if(percentOfWidth.length==0) percentOfWidth = "000";

		if(percentOfWidth.length==1) percentOfWidth = "00" + percentOfWidth;

		if(percentOfWidth.length==2) percentOfWidth = "0" + percentOfWidth;

		percentOfWidth = percentOfWidth.substring(0,1) + "." + percentOfWidth.substring(1);

	

		writeLog_UsaProxy("scroll&scrollx=" + percentOfWidth);

		// set last scrollbar position

		lastScrollPosX_UsaProxy = currentScrollPosX;

		//saveLog_UsaProxy();

	}

}





/** Detects key combinations: first part - key down

 * flags are set in the case that shift, ctrl, or alt is pressed

 * in case any og those flags is true, a combination is detected and logged.  */

function processKeydown_UsaProxy(e) {



	/* get keycode

	 * IE: first case (window.event available); NS: second case */

	var evtobj 				= window.event ? window.event : e;

	var KeyID 				= evtobj.which ? evtobj.which : evtobj.keyCode;

	FLG_ctrl_comb_UsaProxy 	= false;	// "ctrl key pressed" combinations flag



	switch(KeyID)

	{

		// if shift is pressed

		case 16:		

			FLG_comb_UsaProxy = false;			// reset combination flag

			combMembers_UsaProxy = 0;			// reset combination members

			FLG_shiftPressed_UsaProxy = true;	// set "shift key pressed" flag

			FLG_keyPress_UsaProxy = false;		// keypress-event blocked (keypress event is blocked)

			return false;

		break;

		// if ctrl is pressed

		case 17:		

			FLG_comb_UsaProxy = false;			// reset combination flag

			combMembers_UsaProxy = 0;			// reset combination members

			FLG_ctrlPressed_UsaProxy = true;	// set "ctrl key pressed" flag

			FLG_keyPress_UsaProxy = false;		// keypress-event blocked

			return false;

		break;

		// if alt is pressed

		case 18:		

			FLG_comb_UsaProxy = false;			// reset combination flag

			combMembers_UsaProxy = 0;			// reset combination members

			FLG_altPressed_UsaProxy = true;		// set "alt key pressed" flag

			FLG_keyPress_UsaProxy = false;		// keypress-event blocked

			return false;

		break;

	}

	

	/** the following code is only executed for the character key in a key combination */

	

	/** combination check: if shift-char combination */

	if (FLG_shiftPressed_UsaProxy) {			// if shift was already pressed: keyID holds the char which follows shift

		keyName_UsaProxy = "shift+" + String.fromCharCode(KeyID);	// Select capital

		FLG_comb_UsaProxy = true;		// set key combination flag

		combMembers_UsaProxy = 2;	// 2 keys pressed

	}

	/** combination check: if ctrl-char combination */

	if (FLG_ctrlPressed_UsaProxy) {

		switch(KeyID) {		// if ctrl was already pressed: keyID holds the char which follows ctrl

			case 65: keyName_UsaProxy = "ctrl+a"; break;	// Select Alls command

			case 66: keyName_UsaProxy = "ctrl+b"; break;	// Edit bookmarks command

			case 67: keyName_UsaProxy = "ctrl+c"; break;	// Copy command

			case 68: keyName_UsaProxy = "ctrl+d"; break;	// Add bookmark command

			case 69: keyName_UsaProxy = "ctrl+e"; break;

			case 70: keyName_UsaProxy = "ctrl+f"; break;	// Find command

			case 71: keyName_UsaProxy = "ctrl+g"; break;	// NS: find Again command

			case 72: keyName_UsaProxy = "ctrl+h"; break;	// NS: open history command

			case 73: keyName_UsaProxy = "ctrl+i"; break;	// NS: page info command

			case 74: keyName_UsaProxy = "ctrl+j"; break;	// NS: downloads box

			case 75: keyName_UsaProxy = "ctrl+k"; break;	// NS: google search bar

			case 76: keyName_UsaProxy = "ctrl+l"; break;	// IE: open command

			case 77: keyName_UsaProxy = "ctrl+m"; break;	

			case 78: keyName_UsaProxy = "ctrl+n"; break;	// IE: new window NS: new message command

			case 79: keyName_UsaProxy = "ctrl+o"; break;	// Open command

			case 80: keyName_UsaProxy = "ctrl+p"; break;	// Print command

			case 81: keyName_UsaProxy = "ctrl+q"; break;	// NS: exit command

			case 82: keyName_UsaProxy = "ctrl+r"; break;	// Reload command

			case 83: keyName_UsaProxy = "ctrl+s"; break;	// Save command

			case 84: keyName_UsaProxy = "ctrl+t"; break;	

			case 85: keyName_UsaProxy = "ctrl+u"; break;	// NS: page source command

			case 86: keyName_UsaProxy = "ctrl+v"; break;	// Paste command

			case 87: keyName_UsaProxy = "ctrl+w"; break;	// Close command

			case 88: keyName_UsaProxy = "ctrl+x"; break;	// Cut command

			case 89: keyName_UsaProxy = "ctrl+y"; break;	// Select Alls command

			case 90: keyName_UsaProxy = "ctrl+z"; break;	// Select Alls command

		}

		

		// log ctrl+key combination

		writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

		saveLog_UsaProxy();

		

		keyName_UsaProxy 			= "";				// reset keyName_UsaProxy

		

		/* reset ctrl key pressed flag already at keydown since NS doesn't

		 * trigger any keyup event in case of e.g. ctrl-f */

		FLG_ctrlPressed_UsaProxy 	= false;

		FLG_ctrl_comb_UsaProxy		= true;		/* set additional flag true to be able to

												 * determine a ctrl+key below although FLG_ctrlPressed_UsaProxy

												 * was already set false above */

		

		/* unlock handling of regular key presses:

		 * enable processKeyUp_UsaProxy functionality */

		FLG_keyPress_UsaProxy 		= true;

		

		FLG_comb_UsaProxy 			= true;			// set key combination flag

		combMembers_UsaProxy 		= 2;			// 2 keys pressed

	}

	

	/* NS: in case a combination (ctrl+key) was requested before

	 * which triggered a platform action (such as focus on Firefox find box)

	 * the keyup event won't be triggered. Therefore a reset of a possible

	 * combination must be performed on keydown

	 * since FLG_ctrlPressed_UsaProxy is set false above in the

	 * "if (FLG_ctrlPressed_UsaProxy)" block the additional variable

	 * FLG_ctrl_comb_UsaProxy is used */

	if(!FLG_ctrl_comb_UsaProxy && !FLG_shiftPressed_UsaProxy && !FLG_altPressed_UsaProxy) {

		FLG_comb_UsaProxy 			= false;			// reset key combination flag

		combMembers_UsaProxy 		= 0;

	}

	

}



/** Processes the release of key combinations: second part - key up/released

 * flags are reset in case shift, ctrl, or alt is released

 * in case any flag is true a combination is detected and logged  */

function processKeyup_UsaProxy(e) {



	/* get keycode

	* IE: first case (window.event available); NS: second case */

	var evtobj 	= window.event ? window.event : e;

	var KeyID 	= evtobj.which ? evtobj.which : evtobj.keyCode;

	

	// control key check

	switch(KeyID)

	{	

		// if shift is released

		case 16:

			// in case combination was pressed

			if(FLG_comb_UsaProxy==true) {

				/* if shift key is the first key of the combination which is released

				 * decrease number of remaining combination members */

				if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

				/* if shift is last released key of the combination */

				else {	

					FLG_comb_UsaProxy 			= false;	// reset key combination

					writeLog_UsaProxy("keyPress&key=" + encodeInput(keyName_UsaProxy));	// log key combination

					keyName_UsaProxy 			= "";		// reset key name

					FLG_shiftPressed_UsaProxy 	= false;	// reset shift pressed flag

					FLG_keyPress_UsaProxy 		= true;		// re-enable keypress event processing

				}

				return false;

			// if shift was pressed without combining it with another key

			} else {

				keyName_UsaProxy 			= "shift";		// set key name	

				FLG_shiftPressed_UsaProxy 	= false;		// reset shift pressed flag

				FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

			}

		break;

		/* if ctrl is released and no key combination was pressed (single ctrl press)

		 * since all combination reset actions were already performed on keydown

		 * no key combination resetting neccessary at this point */

		case 17:

			if(FLG_comb_UsaProxy==false && FLG_ctrlPressed_UsaProxy) {

				keyName_UsaProxy 			= "ctrl";		// set key name

				FLG_ctrlPressed_UsaProxy 	= false;		// reset ctrl pressed flag

				FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

			} 

		break;

		// if alt is released

		case 18:

			if(FLG_comb_UsaProxy==true) {

				/* if alt key is the first key of the combination which is released

				 * decrease number of remaining combination members */

				if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

				else {	

					FLG_comb_UsaProxy 		= false;		// reset key combination

					writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

					keyName_UsaProxy 		= "";			// reset key name

					FLG_altPressed_UsaProxy = false;		// reset alt pressed flag

					FLG_keyPress_UsaProxy 	= true;			// re-enable keypress event processing

				}

				return false;

			// if alt was pressed without combining it with another key

			} else {

				keyName_UsaProxy 			= "alt";		// set key name

				FLG_altPressed_UsaProxy 	= false;		// reset alt pressed flag

				FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

			}

		break;

		// set key name in case of other control keys

		case 19: keyName_UsaProxy = "pause"; break;			// set key name

		case 37: keyName_UsaProxy = "arrowleft"; break;		// set key name

		case 38: keyName_UsaProxy = "arrowup"; break;		// set key name

		case 39: keyName_UsaProxy = "arrowright"; break;	// set key name

		case 40: keyName_UsaProxy = "arrowdown"; break; 	// set key name

		case 46: keyName_UsaProxy = "del"; break; 			// set key name

	}

	

	/* if combination is released (except ctrl+key since all flags

	 * are released on keydown)

	 * if first key of combination, decrease number of combination members

	 * else, reset combination flag */

	if(FLG_comb_UsaProxy) {

		if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

		else	FLG_comb_UsaProxy = false;

	}



	/* log a single key press or a key combination

	 * single press or end of key combination (last member to be released)

	 * is true if flag FLG_comb_UsaProxy is false and

	 * also the additional ctrl+key combination indicator (since

	 * resetting of all ctrl+key combination (except FLG_ctrl_comb_UsaProxy)

	 * flags occurs on keydown) */

	if(FLG_comb_UsaProxy==false && !FLG_ctrl_comb_UsaProxy && keyName_UsaProxy.length!=0) {

		writeLog_UsaProxy("keypress&key=" +  encodeInput(keyName_UsaProxy));

		saveLog_UsaProxy();

		keyName_UsaProxy = "";

	}

}



/** Logs all regular single key presses. are logged

 * If keyPress flag is enabled (in case no control key is clicked at the same time)

 * the keyPress event returns for regular char keys the correct small case key code. */

function processKeypress_UsaProxy(e) {

	//if(FLG_keyPress_UsaProxy) {

		/* get keycode

		 * IE: first case (window.event available); NS: second case */

		var evtobj 	= window.event ? window.event : e;

		var KeyID 	= evtobj.which ? evtobj.which : evtobj.keyCode;

		keyName_UsaProxy = String.fromCharCode(KeyID);

		

		if(FLG_comb_UsaProxy==false && !FLG_ctrl_comb_UsaProxy) {

			writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

			//saveLog_UsaProxy();

			keyName_UsaProxy = "";

		}

	//}

}



/** Processes blur event */

function processBlur_UsaProxy(e) {

	

	//console.log("blur event");

	/* get event target

	 * NS: first case (window.Event available); IE: second case */

	/*var ev 		= (window.Event) ? e : window.event;

	var target 	= (window.Event) ? ev.target : ev.srcElement;*/

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	

	if (privacyCheck(ev))

		return true;

	

	// log all available target attributes

	

	writeLog_UsaProxy("blur" + generateEventString_UsaProxy(target));

	//saveLog_UsaProxy();

}



/** Processes focus event */

function processFocus_UsaProxy(e) {



	/* get event target

	 * NS: first case (window.Event available); IE: second case */

	/*var ev 		= (window.Event) ? e : window.event;

	var target 	= (window.Event) ? ev.target : ev.srcElement;

	*/

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	

	if (privacyCheck(ev))

		return true;

	

	// log all available target attributes

	// if element has an id attribute

	

	writeLog_UsaProxy("focus" + generateEventString_UsaProxy(target));

	//saveLog_UsaProxy();

}



/** Processes the selection of text within the web page's content.

 * Function is invoked on mousedown */

function processSelection_UsaProxy(target) {

		var currentSelection;

		// NS

		if (window.getSelection) currentSelection = window.getSelection();

		// safari, konqueror

		else if (document.getSelection) currentSelection = document.getSelection();

		// IE

		else if (document.selection) currentSelection = document.selection.createRange().text;

		

		// if selection is not empty and new text was selected, log select event

		if(currentSelection != "" && lastSelection_UsaProxy != currentSelection) {

			writeLog_UsaProxy("select" + generateEventString_UsaProxy(target) + "&selectedContent=" + encodeURIComponent(currentSelection));

			// set last selected text

			lastSelection_UsaProxy = currentSelection;

			saveLog_UsaProxy();

			return true;

		}

		return false;

}



/** Function that registers the focus state of the current window, if different than the last registered state

 * Function is invoked periodically */



function processWindowFocusQuery() {	

	if (document.hasFocus() != isWindowFocusedQuery){

		//If different, we record the event

		if (document.hasFocus())

			writeLog_UsaProxy("windowqueryfocus");

		else

			writeLog_UsaProxy("windowqueryblur");

		

		isWindowFocusedQuery = document.hasFocus();

	}

}



//////////////////////////WINDOW FOCUS STATE QUERY FREQUENCY

var focusQueryFrequency = 500;

var isWindowFocused = null;



/** end events logging */



/* Returns the DOM path of the specified DOM node beginning with the first

 * corresponding child node of the document node (i.e. HTML) */

 

 //CHANGE!!! Now this function returns the XPATH

function getDOMPath(node /*DOM element*/) {



	return getPathTo(node)

	

	/*if nodeType==9 same as nodetype==Node.DOCUMENT_NODE, IE doesn't speak constants*/

	//~ if(node.parentNode.nodeType==9) return getDOMIndex(node);

	//~ else return getDOMPath(node.parentNode) + getDOMIndex(node);

}



/** Returns the position of the specified node 

    in its parent node's childNodes array */

function getDOMIndex(node /*DOM element*/) {

	var parent = node.parentNode;

	var children = parent.childNodes;

	var length = children.length;

	var position = 0;

	for (var i = 0; i < length; i++) {

		/* if nodeType==1 same as nodetype==Node.ELEMENT_NODE, IE doesn't speak constants */

		if (children[i].nodeType==1) { // count only element nodes

			position += 1;

			if (children[i] == node) return mapToAlph(position);

		} 

	}

}



/** Optional: returns a hex representation of DOM path

 * e.g. having a path of <HTML><BODY><FORM><P>1st<INPUT>

 * results in 2h2h1h1h1h

 * e.g. having a path of <HTML><BODY><FORM><P>34th<INPUT>

 * results in 2h2h1h1h22h

 * with an "h" as hex suffix */

function mapToHex(position /*number*/) {

	return (position.toString(16) + "h");

}



/* Returns an alphabetic representation of the DOM path

 * e.g. having a path of <HTML><BODY><FORM><P>1st<INPUT>

 * results in bbaaa

 * e.g. having a path of <HTML><BODY><FORM><P>34th<INPUT>

 * results in bbaa1h

 * with an optional number as prefix which indicates the extent

 * to which the position exceeds the number of characters available

 * e.g. a position of 54 is represented by 2b (= 2x26 + b)*/

var alphArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

function mapToAlph(position /*number*/) {

	var amountAlphs = 0;

	var alphRemain = "";

	if(position>alphArray.length) { // if position > available indexes

		amountAlphs = Math.floor(position/alphArray.length);

		alphRemain = alphArray[(position % alphArray.length)-1];

	} 

	if(amountAlphs>0) return (amountAlphs + alphRemain);

	return (alphArray[position-1]);

}



/** Computes the element's offset from the left edge

   of the browser window */

function absLeft(element) {

	if (element.pageX) return element.pageX;

	else

    	return (element.offsetParent)? 

     	element.offsetLeft + absLeft(element.offsetParent) : element.offsetLeft;

  }



/** Computes the element's offset from the top edge

   of the browser window */

function absTop(element) {

  	if (element.pageY) return element.pageY;

	else

     	return (element.offsetParent)? 

     	element.offsetTop + absTop(element.offsetParent) : element.offsetTop;

}







/*

///TEST!!!!

document.onclick= function(event) {

    if (event===undefined) event= window.event;                     // IE hack

    var target= 'target' in event? event.target : event.srcElement; // another IE hack



alert(target.textContent);



    //var root= document.compatMode==='CSS1Compat'? document.documentElement : document.body;

    //var mxy= [event.clientX+root.scrollLeft, event.clientY+root.scrollTop];



    //var path= getPathTo(target);

    //var txy= getPageXY(target);

    //alert('Clicked element '+path+' offset '+(mxy[0]-txy[0])+', '+(mxy[1]-txy[1]));

}*/



function getPathTo(element) {

    if (element.id!=='')

        return 'id("'+element.id+'")';

    if (element===document.body)

        return element.tagName;



    var ix= 0;

    var siblings= element.parentNode.childNodes;

    for (var i= 0; i<siblings.length; i++) {

        var sibling= siblings[i];

        if (sibling===element)

            return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';

        if (sibling.nodeType===1 && sibling.tagName===element.tagName)

            ix++;

    }

}



function getPageXY(element) {

    var x= 0, y= 0;

    while (element) {

        x+= element.offsetLeft;

        y+= element.offsetTop;

        element= element.offsetParent;

    }

    return [x, y];

}









///////////////////////////////////DOM RECORDING FUNCTIONS/////////////////////////

///////////////////////////////////////////////////////////////////////////////////





function recordCurrentDOM(){

	//console.log(document.getElementsByTagName("body")[0].innerHTML);

	//alert("recording DOM");

	writeLog_UsaProxy("domchange&domContent=" +encodeURIComponent(document.getElementsByTagName("body")[0].innerHTML));

	//jQuery(document.body).html()));

	//+encodeURIComponent(document.getElementsByTagName("body")[0].innerHTML); 

	

}









//////////////////////////////////////////////////////////////////////////////////////////

////////////////////////NEW EVENTS HANDLERS////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////

function processMouseOut_ExtraEvent(e) {



	/* get event target

	 * NS: first case (window.Event available); IE: second case */

	/*var ev = (window.Event) ? e : window.event;

	var target = (window.Event) ? ev.target : ev.srcElement;

	*/

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	

	if (privacyCheck(ev))

		return true;

	

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	// log mouseout coordinates and all available target attributes

	// if element has an id attribute

	

	writeLog_UsaProxy("mouseout&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));



}





function processMouseup_ExtraEvent(e) {

	

	//alert("mouseUP event");

	

/* get event target, x, and y value of mouse position

	 * NS: first case (window.Event available); IE: second case */

	/*var ev 		= (window.Event) ? e : window.event;

	var target 	= (window.Event) ? ev.target : ev.srcElement;

	var x 		= (window.Event) ? ev.pageX : ev.clientX;

	var y 		= (window.Event) ? ev.pageY : ev.clientY; 

	*/

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	if (privacyCheck(ev))

		return true;

	

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	/** mouse button detection: was middle or right mouse button clicked ?*/

	var mbutton = "l";

	if (ev.which) {  		// NS

		switch(ev.which) {

			case 2: mbutton = "m"; break;	// middle button

			case 3: mbutton = "r"; break;	// right button

		}

	} else if (ev.button) {		// IE

		switch(ev.button) {

			case 4: mbutton = "m"; break;

			case 2: mbutton = "r"; break;

		}

	}

	

	// log middle and right button events, continue if left button was clicked

	if (mbutton!="l") {



		writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

		return;

	}

	// end mouse button detection 

	

	/* if regular click, log click coordinates relative to the clicked element

	   and all available target properties */

	// if element has an id attribute

	

	writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

	

	//Was this mouose event employed to select something?

	processIfHtmlIsSelected("mouse", target);

}



function processContextMenu_ExtraEvent(e) {

	

/* get event target, x, and y value of mouse position

	 * NS: first case (window.Event available); IE: second case */

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	if (privacyCheck(ev))

		return true;

	

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	writeLog_UsaProxy("contextmenu&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));



}



function processCut_ExtraEvent(e) {

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var data 	= (isNotOldIE) ? ev.data : ev.data;

	

	if (privacyCheck(ev))

		return true;

		

	// if selection is not empty, log select event with the selected text

	if (target.selectionStart!=target.selectionEnd) {

		writeLog_UsaProxy("cut&content=" + encodeURIComponent(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));

		//saveLog_UsaProxy();

	}

}



function processCopy_ExtraEvent(e) {

		

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var data 	= (isNotOldIE) ? ev.data : ev.data;

		

	if (privacyCheck(ev))

		return true;

		

	// if selection is not empty, log select event with the selected text

	if (target.selectionStart!=target.selectionEnd) {

		writeLog_UsaProxy("copy&content=" + encodeURIComponent(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));

		//saveLog_UsaProxy();

	}

}



function processPaste_ExtraEvent(e) {

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var data 	= (isNotOldIE) ? ev.data : ev.data;

	

	if (privacyCheck(ev))

		return true;

		

	// if selection is not empty, log select event with the selected text

	if (target.selectionStart!=target.selectionEnd) {

		writeLog_UsaProxy("paste&content=" + encodeURIComponent(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));

		//saveLog_UsaProxy();

	}

}



function processDblClick_ExtraEvent(e) {

	/* get event target, x, and y value of mouse position

	 * NS: first case (window.Event available); IE: second case */

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var x 		= (isNotOldIE) ? ev.pageX : ev.clientX;

	var y 		= (isNotOldIE) ? ev.pageY : ev.clientY; 

	

	if (privacyCheck(ev))

		return true;

		

	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

	

	/** mouse button detection: was middle or right mouse button clicked ?*/

	var mbutton = "left";

	if (ev.which) {  		// NS

		switch(ev.which) {

			case 2: mbutton = "m"; break;	// middle button

			case 3: mbutton = "r"; break;	// right button

		}

	} else if (ev.button) {		// IE

		switch(ev.button) {

			case 4: mbutton = "m"; break;

			case 2: mbutton = "r"; break;

		}

	}



	writeLog_UsaProxy("dblclick&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset +"&but=" + mbutton + generateEventString_UsaProxy(target));

	

}



function processError_ExtraEvent(e) {

	writeLog_UsaProxy("javascripterror");

}



function processhashChange_ExtraEvent(e) {

	writeLog_UsaProxy("hashChange");

}



function processKeydown_ExtraEvent(e) {



	/* get keycode

	 * IE: first case (window.event available); NS: second case */

	var ev 				= window.event ? window.event : e;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var KeyID 				= ev.which ? ev.which : ev.keyCode;



	if (privacyCheck(ev))

		return true;

		

	keyName_UsaProxy = returnKeyValue(KeyID);

	

	writeLog_UsaProxy("keydown&key=" +  encodeInput(keyName_UsaProxy) + generateEventString_UsaProxy(target));

	//saveLog_UsaProxy();

	keyName_UsaProxy = "";

}



/** Logs all regular single key presses. are logged

 */ 

function processKeypress_ExtraEvent(e) {

	/* get keycode

	 * IE: first case (window.event available); NS: second case */

	var ev 	= window.event ? window.event : e;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var KeyID 	= ev.which ? ev.which : ev.keyCode;

	

	if (privacyCheck(ev))

		return true;

		

	writeLog_UsaProxy("keypress&key=" + encodeInput(String.fromCharCode(KeyID)) + generateEventString_UsaProxy(target));

}





/*

 * Keyup event, we don't take into account any combination of keys detector flag.

 */ 

function processKeyUp_ExtraEvent(e) {

	/* get keycode

	 * IE: first case (window.event available); NS: second case */

	var ev 	= window.event ? window.event : e;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	var KeyID 	= ev.which ? ev.which : ev.keyCode;

	//keyName_UsaProxy = String.fromCharCode(KeyID);

	//keyName_UsaProxy = String.fromKeyCode(KeyID);

	keyName_UsaProxy = returnKeyValue(KeyID);



	if (privacyCheck(ev))

		return true;

		

	writeLog_UsaProxy("keyup&key=" + encodeInput(keyName_UsaProxy) + generateEventString_UsaProxy(target));

	//saveLog_UsaProxy();

	keyName_UsaProxy = "";



}



/**

 * Piece of code adapted from http://www.adomas.org/javascript-mouse-wheel/

 */ 

function processMousewheel_ExtraEvent(e) {

	var event = (isNotOldIE) ? e : window.event;

	var target = (isNotOldIE) ? event.target : event.srcElement;

	var delta = 0;

	

	if (!event) /* For IE. */

		event = window.event;

	if (event.wheelDelta) { /* IE/Opera. */

		delta = event.wheelDelta/120;

	} else if (event.detail) { /** Mozilla case. */

		/** In Mozilla, sign of delta is different than in IE.

		 * Also, delta is multiple of 3.

		 */

		delta = -event.detail/3;

	}

	

	handleWheelEvents(delta, target);

}



/**

 * This function will accummulate the mouse wheel movement in order to record it periodically 

 */

function handleWheelEvents(delta, node){

	

	var currentTime = new Date();

	

	//if node is null, we have to store this event as a new one. Store the delta value and start the timer

	if (wheelNodeGlobal==null){

		//console.log("WHEEL: node was null, program next event");

		wheelDeltaGlobal += delta; //wheelDeltaGlobal should be 'zero' here anyway

		wheelNodeGlobal = node;

		wheelLastEventTimestampGlobal = new Date();

		

		//START TIMEOUT! But first I need to cancel the previous timeout, otherwise this function will be called more than once

		if (wheelTimeOutFunction != null)

			window.clearTimeout(wheelTimeOutFunction);//This timeout should be cancelled already anyway

		wheelTimeOutFunction = setTimeout("handleWheelEvents(0, wheelNodeGlobal)", wheelQueryFrequency);



	}

	

	//If it's the same node, we check the time to see if it's time to record it or to program next timeout function

	else if (node.isEqualNode(wheelNodeGlobal)){

		//console.log("WHEEL: same node as before");

		

		//If the time expired for the event, just record the event, and the next time user uses the wheel, it will be recorded as a different event

		if (currentTime.getTime() - wheelLastEventTimestampGlobal.getTime() > wheelGranularity){

			//console.log("WHEEL: it's time to write it. time before: " + wheelLastEventTimestampGlobal.getTime() + " and current time is:" + currentTime.getTime());

			//console.log("WHEEL: Last time was: " + wheelLastEventTimestampGlobal + " and current time is:" + currentTime);

			

			wheelDeltaGlobal += delta;

			writeLog_UsaProxy("mousewheel&delta="+wheelDeltaGlobal+generateEventString_UsaProxy(node));

			

			//We set the variables ready for the next event, resetting delta counter, and setting the node to null

			wheelDeltaGlobal=0;

			wheelNodeGlobal=null;

			

			//we also have to remove the timeouts

			if (wheelTimeOutFunction != null)

				window.clearTimeout(wheelTimeOutFunction);

		}

		

		//if it's not time, but delta is 0, that means it's just the timeout function.

		//Recall the function without altering the "wheelLastEventTimestampGlobal"

		else if (delta == 0){

			if (wheelTimeOutFunction != null)

				window.clearTimeout(wheelTimeOutFunction);

			

			wheelTimeOutFunction = setTimeout("handleWheelEvents(0, wheelNodeGlobal)", wheelQueryFrequency);

		}

		//if it's not time, but we have delta values

		else{

			//console.log("WHEEL: Last time was: " + wheelLastEventTimestampGlobal.getTime() + " and current time is:" + currentTime.getTime());

			//console.log("WHEEL: Last time was: " + wheelLastEventTimestampGlobal + " and current time is:" + currentTime);

			

			wheelDeltaGlobal += delta;

			wheelLastEventTimestampGlobal = currentTime;

			

			//console.log("WHEEL: it's not time so just accumulate delta:" + wheelDeltaGlobal);

						

			//START TIMEOUT! But first I need to cancel the previous timeout, otherwise this function will be called more than once

			if (wheelTimeOutFunction != null)

				window.clearTimeout(wheelTimeOutFunction);

				

			wheelTimeOutFunction = setTimeout("handleWheelEvents(0, wheelNodeGlobal)", wheelQueryFrequency);

		}

	}

	

	



	//if globalNode is neither the same nor null, the user must be using the wheel in another DOM element!! record the previous one and start recording this one

	else{

		//console.log("WHEEL: node was neither null nor the same as before so it's a new one, time to write");

		writeLog_UsaProxy("mousewheel&delta="+wheelDeltaGlobal+generateEventString_UsaProxy(node));

		

		//We "restart" the counters with the new event we received

		wheelDeltaGlobal = delta;

		wheelNodeGlobal = node;

		wheelLastEventTimestampGlobal = currentTime;

		

		//START TIMEOUT! But first I need to cancel the previous timeout, otherwise this function will be called more than once

		if (wheelTimeOutFunction != null)

			window.clearTimeout(wheelTimeOutFunction);

		wheelTimeOutFunction = setTimeout("handleWheelEvents(0, wheelNodeGlobal)", wheelQueryFrequency);

	}



	//If last interaction was more than half a second ago



}







function processSelectText_ExtraEvent(e) {

	

	var ev 		= (isNotOldIE) ? e : window.event;

	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	

	if (privacyCheck(ev))

		return true;

		

	// if selection is not empty, log select event with the selected text

	if (target.selectionStart!=target.selectionEnd) {

		writeLog_UsaProxy("select_Extra" + generateEventString_UsaProxy(target) + "&selectedContent=" + encodeURIComponent(target.value.substring(target.selectionStart,target.selectionEnd)));

		//saveLog_UsaProxy();

	}

}



/**

 * This function is never called, as we don't have time to process it before the window closes.

 * The end of the interaction (last interaction event recorded) will be considered the end of the session instead

 * 

 * */

function processUnload_ExtraEvent(e) {

	writeLog_UsaProxy("unload");

	saveLog_UsaProxy();

	//console.log("UNLOAD RECORDED");

	//pausecomp(3000);

	//alert("logging unload");

}



/**

 * This event will register the event of the window gaining focus.

 * It will occur when the focus comes back to the window after going to another tab,

 * or minimizing the window

 * 

 */ 

 

function processWindowFocusEvent(){

	writeLog_UsaProxy("windowfocus");



}



/**

 * This event will register the event of the window losing focus.

 * It will occur when the focus on the window is lost

 * after going to another tab, or minimizing the window

 * 

 */ 

  

function processWindowBlurEvent(){

	writeLog_UsaProxy("windowblur");



}

 

/**

 * Returns true if it detects that something has been selected in the web page.

 * If it's true, then it records the content of the selection as a selection event

 * The usual functions that will call this function are mouse up and keyup

 */

function processIfHtmlIsSelected(selectionTool, target){

	var selectedContent = getSelectionHtml();

	

	if (selectedContent != "")

		writeLog_UsaProxy("selectextra&selectionTool="+ selectionTool + generateEventString_UsaProxy(target) + "&selectedContent=" + encodeURIComponent(selectedContent));

	

}





//////////////////////////////////////////////////////////////////////////

////////////////USEFUL FUNCTIONS//////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////



/**

 * Adding the Client's context information to the event string,

 * such as browser's name and operating system

 * 

 * 

 */

  function appendClientContextInformation(text){

	  

	if (browserName=="undefined"){

		inferClientInfo();

	}

	

	return text + "&platform=" + platform+ "&browser=" + browserName + fullVersion;

  }



//////////////CODE FOR GETTING BROWSER INFORMATION

//code obtained from http://www.javascripter.net/faq/browsern.htm



var nVer, nAgt, browserName, fullVersion, majorVersion, nameOffset, verOffset, ix, platform;





function inferClientInfo(){

	nVer = navigator.appVersion;

	nAgt = navigator.userAgent;

	browserName  = navigator.appName;

	fullVersion  = ''+parseFloat(navigator.appVersion); 

	majorVersion = parseInt(navigator.appVersion,10);

	nameOffset,verOffset,ix;

	

	//This will give us the operating system

	platform = navigator.platform.toString().toLowerCase();



	

	// In Opera, the true version is after "Opera" or after "Version"

	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {

	 browserName = "Opera";

	 fullVersion = nAgt.substring(verOffset+6);

	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 

	   fullVersion = nAgt.substring(verOffset+8);

	}

	// In MSIE, the true version is after "MSIE" in userAgent

	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {

	 browserName = "Microsoft Internet Explorer";

	 fullVersion = nAgt.substring(verOffset+5);	 

	}

	// In Chrome, the true version is after "Chrome" 

	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {

	 browserName = "Chrome";

	 fullVersion = nAgt.substring(verOffset+7);

	}

	// In Safari, the true version is after "Safari" or after "Version" 

	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {

	 browserName = "Safari";

	 fullVersion = nAgt.substring(verOffset+7);

	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 

	   fullVersion = nAgt.substring(verOffset+8);

	}

	// In Firefox, the true version is after "Firefox" 

	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {

	 browserName = "Firefox";

	 fullVersion = nAgt.substring(verOffset+8);

	}

	// In most other browsers, "name/version" is at the end of userAgent 

	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 

	          (verOffset=nAgt.lastIndexOf('/')) ) 

	{

	 browserName = nAgt.substring(nameOffset,verOffset);

	 fullVersion = nAgt.substring(verOffset+1);

	 if (browserName.toLowerCase()==browserName.toUpperCase()) {

	  browserName = navigator.appName;

	 }

	}

	// trim the fullVersion string at semicolon/space if present

	if ((ix=fullVersion.indexOf(";"))!=-1)

	   fullVersion=fullVersion.substring(0,ix);

	if ((ix=fullVersion.indexOf(" "))!=-1)

	   fullVersion=fullVersion.substring(0,ix);

	

	majorVersion = parseInt(''+fullVersion,10);

	if (isNaN(majorVersion)) {

	 fullVersion  = ''+parseFloat(navigator.appVersion); 

	 majorVersion = parseInt(navigator.appVersion,10);

	}



	//document.write(''

	 //+'Browser name  = '+browserName+'<br>'

	 //+'Full version  = '+fullVersion+'<br>'

	 //+'Major version = '+majorVersion+'<br>'

	 //+'navigator.appName = '+navigator.appName+'<br>'

	 //+'navigator.userAgent = '+navigator.userAgent+'<br>'

	//)



}

/**

 * Dirty function to make the browser wait





function pausecomp(ms) {

	ms += new Date().getTime();

	while (new Date() < ms){}

}

 * 

 */



/**

 * Returns currently selected (highlighted) text in the web page

 */ 

function getSelectionHtml() {

	 

	//if (typeof window.getSelection != "undefined") {

		//console.log("window");

		////alert(window.getSelection());

		

	//} else if (typeof document.selection != "undefined") {

		//console.log("document");

		////alert(document.selection.type);

	//}

	

    var html = "";

    if (typeof window.getSelection != "undefined") {

        var sel = window.getSelection();

        if (sel.rangeCount) {

            var container = document.createElement("div");

            for (var i = 0, len = sel.rangeCount; i < len; ++i) {

                container.appendChild(sel.getRangeAt(i).cloneContents());

            }

            html = container.innerHTML;

        }

    } else if (typeof document.selection != "undefined") {

        if (document.selection.type == "Text") {

            html = document.selection.createRange().htmlText;

        }

    }

    return(html);

}







//////////////////////////////////////////////////////////////////////////

////////////////////////COOKIE HANDLER////////////////////////////////////

//////////////////////////////////////////////////////////////////////////

function getCookie(c_name)

{

	var i,x,y,ARRcookies=document.cookie.split(";");

	for (i=0;i<ARRcookies.length;i++)

	{

		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));

		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);

		x=x.replace(/^\s+|\s+$/g,"");

		if (x==c_name)

		{

			//console.log("Cookie value at getCookie()" + decodeURIComponent(y));

			return decodeURIComponent(y);

			



		}

	}

	//console.log("Cookie value at getCookie() is null");

	//we didn't find the cookie, so we return null

	return "null";

}



/**

 * Stores the given value in the cookie whose name is given

 * @param c_name label of the cookie

 * @param value value to store

 * @param exdays expiration date (cookieLife variable, defined above, can be used)

 */

function setCookie(c_name,value,exdays)

{

				//console.log("Cookie value at setCookie()" + value);



	var exdate=new Date();

	exdate.setDate(exdate.getDate() + exdays);

	var c_value = encodeURIComponent(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());

	

	//We want the cookie to be available through all pages in the domain, to do that we have to remove the www from the start

	var domain = document.domain;

	if (domain.substring(0, 3) == "www"){

		domain = domain.substring(3, domain.length);

	}

	

	c_value += "; path=/; domain="+domain;



	document.cookie=c_name + "=" + c_value;

}





function printCookiesOnConsole(){

	

	var i,x,y,ARRcookies=document.cookie.split(";");

	for (i=0;i<ARRcookies.length;i++)

	{

		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));

		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);

		x=x.replace(/^\s+|\s+$/g,"");

		

		//console.log(x);

		/*if (x==c_name)

		{

			return decodeURIComponent(y);

		}*/

	}

	

	//alert(document.cookie);

}



//////////////////////////////////////////////////////////////////////////

////////////////////////COOKIE DISCLAIMER/////////////////////////////////

//////////////////////////////////////////////////////////////////////////



/**I have to include two different cookie policy disclaimers

	 * A) the normal cookie approach. Check for regular cookies:

	 *  - if they exist, start capturing

	 *  - If there are no cookies, then we need to ask for permission to deploy cookie, show the disclaimer and wait for implicit consent

	 * 

	 * B) The alternative approach giving the alternative to opt-out.

	 * We start capturing from the start, but giving them the option to opt-out of the capture.





*/



function cookieApproachSelector(){

	

	var websiteIsSensitive = false;

	//First we test if the Web application is in the list of information sensitive Web applications

	for (i=0;i<sensitiveWebs.length;i++)

	{

		if (websiteID == sensitiveWebs[i]){

			websiteIsSensitive = true;

		}

    }

    

    /*Website is sensitive, so we follow the alternative approach giving the alternative to opt-out.

	 * We start capturing from the start, but giving them the option to opt-out of the capture.

	 */

    if (websiteIsSensitive){

		//console.log("Sensitive Website");

		cookieSensitivePermission();

	}

	

	/*Else, Website is NOT sensitive, so we follow the normal cookie approach. Check for regular cookies:

	 *  - if they exist, start capturing

	 *  - If there are no cookies, then we need to ask for permission to deploy cookie, show the disclaimer and wait for implicit consent

	 */

	else{

		//console.log("Normal Website");

		cookieNormalPermission();

	}

	

}





/**

 * Sensitive Websites cookie approach.

 *  we follow the alternative approach giving the alternative to opt-out.	

 *  We start capturing from the start, but giving them the option to opt-out of the capture.

 * 

 */ 

function cookieSensitivePermission(){

		//First we check if the users opted out of the research, if so, stop.

	if (cookieSensitiveCookieCheck()==true){

		//console.log("User opted out. Capture interrupted");

		return false;

	}

	

	//If we can get the Session ID from the cookie we don't do anything else

	if (getSessionFromCookie()){

		//console.log("Tracking cookie found.");



		init_UsaProxy();

		return true;

	}

	

	//If we cannot find the cookie, we need to ask the user, although we will start the tool anyway

	//console.log("Tracking cookie NOT found. Asking implicit permission");	

	writeLog_UsaProxy("cookiedisclaimershown");

	

	//if not, we show the sensitive disclaimer

	//alert("showing cookie disclaimer");

	

	var htmlDivContent = document.createElement("div");

	

	htmlDivContent.id = "proxyCookieDisclaimer";

	htmlDivContent.style.backgroundColor = "silver";

	htmlDivContent.style.border = "1px solid black";

	

	//htmlDivContent.style.height="50px"

	//htmlDivContent.style.width="500px"

	

	//htmlDivContent.style.border.style="";

	//htmlDivContent.style.border.color="";

	htmlDivContent.style.textAlign = "center";

	htmlDivContent.style.margin = "0px auto 0px auto";

	htmlDivContent.style.position = "static";

	//htmlDivContent.style.width = "50px";

	

	//htmlDivContent.style.zIndex="9999"

	

	//htmlDivContent.style.width = "720px";

	

	var headerNode = document.createElement("h2");

	headerNode.style.textAlign = "center";



	var headerText = document.createTextNode("Cookies on this website");

	headerNode.appendChild(headerText);

	

	//headerNode.style.float = "left";

	//headerNode.style.textAlign = "right";

	

	htmlDivContent.appendChild(headerNode);



	

	

	var textNode = document.createElement("p");

	textNode.style.textAlign = "center";





	var disclaimerText = document.createTextNode("This site uses cookies to help us improve the usability of this site. If you continue to use the site, we will assume you don't mind allowing our cookie. All collected information is anonymous, but you can opt out anytime. Be aware that we will use a cookie as a reminder of your refusal, if you want no cookies at all, you will have to change your browser settings to reject all cookies from this domain.");

	textNode.appendChild(disclaimerText);

	htmlDivContent.appendChild(textNode);

	

	var htmlButton = document.createElement("button");

	

	htmlButton.onclick=cookieSensitiveHandleRejection;

	

	var buttonText = document.createTextNode("I do not want to use cookies from this site.");

	htmlButton.appendChild(buttonText);

	

	htmlDivContent.appendChild(htmlButton);



	

	//We push the HTML down before inserting the disclaimer

	

	pushHTMLDown();



	if (document.body.firstChild){

      	document.body.insertBefore(htmlDivContent, document.body.firstChild);

		//console.log("inserting before");

	} else {

      	document.body.appendChild(htmlDivContent);

      	//console.log("appending before");

	}

	

	//We have shown the disclaimer, we will now set the cookie and start the tool until the user opts out



	setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);

	sessionID = sessionID_Proxy;

	

	init_UsaProxy();



}





/**

 * In the sensitive approach, if users click on the button, that means they don't

 * want to take part in the study, we need to put the "rejection" cookie.

 * 

 */ 

function cookieSensitiveHandleRejection(){

	//User clicked in the cookie disclaimer button, we record the user rejected to be tracked

	writeLog_UsaProxy("cookiedisclaimerrejected");

	

	//Set rejection cookie

	setCookie(cookieRejection, true, cookieLife);

	

	//Delete our tracking cookie

	setCookie(sessionIDCookieName,"",-1);



	//We remove the cookie disclaimer and we show the new message

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



	if (document.body.firstChild){

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

function cookieSensitiveCookieCheck(){

	

	var cookieValueTemp = getCookie(cookieRejection);

	

	if (cookieValueTemp == "true"){

		//rejection cookie was found and has "true" as value

		return true;

	}else if (cookieValueTemp == "false"){

		//rejection cookie was found and has "false" as value

		return false;

	}

	else if (cookieValueTemp == "null"){

		//The rejection cookie was not found

		return "null";

	}

}





/**

 * Normal cookie approach.

 * This function will check if the cookie is available, if not it shows a disclaimer with a button

 * when that button is pressed, a new session ID is created and stored in a cookie

 * 

 */ 

function cookieNormalPermission(){

		

	//console.log("asking for cookie permission");

	//If we can get the Session ID from the cookie, we start the tool and finish

	if (getSessionFromCookie()){

		init_UsaProxy();

		return true;

	}

	

	//We showed the disclaimer so we store an event

	

	writeLog_UsaProxy("cookiedisclaimershown");



	

	//if not, we show the disclaimer

	//alert("showing cookie disclaimer");

	

	var htmlDivContent = document.createElement("div");

	

	htmlDivContent.id = "proxyCookieDisclaimer";

	htmlDivContent.style.backgroundColor = "silver";

	htmlDivContent.style.border = "1px solid black";

	

	//htmlDivContent.style.height="50px"

	//htmlDivContent.style.width="500px"

	

	//htmlDivContent.style.border.style="";

	//htmlDivContent.style.border.color="";

	htmlDivContent.style.textAlign = "center";

	htmlDivContent.style.margin = "0px auto 0px auto";

	htmlDivContent.style.position = "static";

	//htmlDivContent.style.width = "50px";

	

	//htmlDivContent.style.zIndex="9999"

	

	//htmlDivContent.style.width = "720px";

	

	var headerNode = document.createElement("h2");

	headerNode.style.textAlign = "center";



	var headerText = document.createTextNode("Cookies on this website");

	headerNode.appendChild(headerText);

	

	//headerNode.style.float = "left";

	//headerNode.style.textAlign = "right";

	

	htmlDivContent.appendChild(headerNode);



	

	

	var textNode = document.createElement("p");

	textNode.style.textAlign = "center";





	var disclaimerText = document.createTextNode("This site uses cookies to help us improve the usability of this site. If you continue to use the site, we will assume you don't mind allowing our cookie. All collected information is anonymous, but if you want no cookies at all, you will have to change your browser settings to reject all cookies from this domain.");

	textNode.appendChild(disclaimerText);

	htmlDivContent.appendChild(textNode);

		

	/*LISTENERS

	 * 

	 * We don't really need the button any more, so I'll remove it. Now the cookis will get activated as soon as the user clicks somewhere.

	 * 

	 * The listener will remain registered, but the function will not do anything if the disclaimer has been hidden already.

	*/

	if (isNotOldIE)

		document.addEventListener('mousedown', cookieNormalHandleImplicitPermission, false);

	else

		document.attachEvent('onmousedown', cookieNormalHandleImplicitPermission);



	//var htmlButton = document.createElement("button");

	//htmlButton.onclick=cookieNormalHandleImplicitPermission;	

	//var buttonText = document.createTextNode("I do not want to use cookies from this site.");

	//htmlButton.appendChild(buttonText);

	//htmlDivContent.appendChild(htmlButton);



	

	//We look for all 'fixed' elements and pushed them down by a certain height.

	

	pushHTMLDown();



	if (document.body.firstChild){

      	document.body.insertBefore(htmlDivContent, document.body.firstChild);

		//console.log("inserting before");

	} else {

      	document.body.appendChild(htmlDivContent);

      	//console.log("appending before");

	}

}





/**

 * In the normal approach, if the user gives implicit permission, then we generate the ID, set the cookie and store the ID

 * 

 */ 

function cookieNormalHandleImplicitPermission(){

	//Implicit acceptance event was triggered, we test if the disclaimer was visible, if so, register the cookie.

	var div = document.getElementById("proxyCookieDisclaimer");

	

	if (div != null){

		//disclaimer is visible

		writeLog_UsaProxy("cookiedisclaimeraccepted");

	

		//console.log("getSessionFromCookie");

		setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);

		sessionID = sessionID_Proxy;

		//document.getElementById("proxyCookieDiscalimer").style.visibility = "hidden";

	

		div.parentNode.removeChild(div);

    

		init_UsaProxy();

	}

	else{

		//disclaimer is not visible, we assume everything is working fine, and this was some residual listener

		//console.log("the disclaimer was dismissed already");

	}

}



/**

 * This function will push the contents of the Web page down

 * Solution obtained from http://stackoverflow.com/questions/11436904/how-to-wrap-all-the-body-contents-in-a-div-with-jquery

 * and http://stackoverflow.com/questions/7135281/how-to-move-all-content-relative-absolute-down

 */ 

function pushHTMLDown(){

	

	jQuery('body').wrapInner('<div class="pushedDown" />');



	//jQuery('.pushedDown').css('margin-top', '50px');

   	jQuery('.pushedDown').css('position', 'relative');

 

	/*jQuery('*').filter(function() {

		return jQuery(this).css("position") === 'absolute';

	}).css('margin-top', '50px');*/

}





/**

 * This function will push the contents of the Web page up. It will probably be never used.

 */ 

function pushHTMLUp(){

	

	jQuery('*').filter(function() {

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

function getSessionFromCookie(){

	//console.log("getSessionFromCookie");

	

	//We check if there are cookies in the Web page

	if (document.cookie.length > 0)

	//if (false)

	{

		

		sessionID = getCookie(sessionIDCookieName);

		

		if (sessionID == "null")

		{

			//We don't have our cookie deployed, but there were other cookies, so we should be able to create one

			setCookie(sessionIDCookieName, sessionID_Proxy, cookieLife);

			sessionID = sessionID_Proxy;

			//document.getElementById("proxyCookieDiscalimer").style.visibility = "hidden";

		}

		return true;

	}

	else

		sessionID = null;

		return false;

}



/**

 * This function will take an event as input, and it will compare its target's parents' id

 * against the ones contained in the "protectedIds" variable. It returns a boolean

 * indicating if the given target is protected or not

 * 

 * BEWARE!!! The ids comparison is case sensitive!

 */ 

function privacyCheck(ev){

		

	jqueryTarget = jQuery(ev.target);



	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;

	targetId = target.id;

	

	for (i=0;i<protectedIds.length;i++)

	{

		if (targetId == protectedIds[i]){

			//console.log("Target has banned ID!! " + protectedIds[i]);

			return true;

		}

		

		//The '#' is required for jQuery to know it's an id

		if (jqueryTarget.parents('#' + protectedIds[i]).length){

			//console.log("Target is child of banned ID!! " + protectedIds[i]);

			return true;

		}



    }



	return false;

}



/**

 * This function will check if certain inputs should be encoded or not, depending on what Web application

 * we are capturing information from. If the Web application is in the list inputEncodeWebs, then we'll 

 * encode the input text from keypresses and the IP address.

 * This function will just take the content to be encoded as input, test if current Web application is in

 * inputEncodeWebs, and return the encoded text if true. return original input if false.

 * 

 */ 

function encodeInput(inputString){

	

	if (inputEncodeWebs.indexOf(websiteID)!=-1){

		

		return hex_md5(inputString);

	}

	else{

		return inputString;

	}

}

/**

 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message

 * Digest Algorithm, as defined in RFC 1321.

 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009

 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet

 * Distributed under the BSD License

 * See http://pajhome.org.uk/crypt/md5 for more info.

 */

var hexcase=0;function hex_md5(a){return rstr2hex(rstr_md5(str2rstr_utf8(a)))}function hex_hmac_md5(a,b){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a),str2rstr_utf8(b)))}function md5_vm_test(){return hex_md5("abc").toLowerCase()=="900150983cd24fb0d6963f7d28e17f72"}function rstr_md5(a){return binl2rstr(binl_md5(rstr2binl(a),a.length*8))}function rstr_hmac_md5(c,f){var e=rstr2binl(c);if(e.length>16){e=binl_md5(e,c.length*8)}var a=Array(16),d=Array(16);for(var b=0;b<16;b++){a[b]=e[b]^909522486;d[b]=e[b]^1549556828}var g=binl_md5(a.concat(rstr2binl(f)),512+f.length*8);return binl2rstr(binl_md5(d.concat(g),512+128))}function rstr2hex(c){try{hexcase}catch(g){hexcase=0}var f=hexcase?"0123456789ABCDEF":"0123456789abcdef";var b="";var a;for(var d=0;d<c.length;d++){a=c.charCodeAt(d);b+=f.charAt((a>>>4)&15)+f.charAt(a&15)}return b}function str2rstr_utf8(c){var b="";var d=-1;var a,e;while(++d<c.length){a=c.charCodeAt(d);e=d+1<c.length?c.charCodeAt(d+1):0;if(55296<=a&&a<=56319&&56320<=e&&e<=57343){a=65536+((a&1023)<<10)+(e&1023);d++}if(a<=127){b+=String.fromCharCode(a)}else{if(a<=2047){b+=String.fromCharCode(192|((a>>>6)&31),128|(a&63))}else{if(a<=65535){b+=String.fromCharCode(224|((a>>>12)&15),128|((a>>>6)&63),128|(a&63))}else{if(a<=2097151){b+=String.fromCharCode(240|((a>>>18)&7),128|((a>>>12)&63),128|((a>>>6)&63),128|(a&63))}}}}}return b}function rstr2binl(b){var a=Array(b.length>>2);for(var c=0;c<a.length;c++){a[c]=0}for(var c=0;c<b.length*8;c+=8){a[c>>5]|=(b.charCodeAt(c/8)&255)<<(c%32)}return a}function binl2rstr(b){var a="";for(var c=0;c<b.length*32;c+=8){a+=String.fromCharCode((b[c>>5]>>>(c%32))&255)}return a}function binl_md5(p,k){p[k>>5]|=128<<((k)%32);p[(((k+64)>>>9)<<4)+14]=k;var o=1732584193;var n=-271733879;var m=-1732584194;var l=271733878;for(var g=0;g<p.length;g+=16){var j=o;var h=n;var f=m;var e=l;o=md5_ff(o,n,m,l,p[g+0],7,-680876936);l=md5_ff(l,o,n,m,p[g+1],12,-389564586);m=md5_ff(m,l,o,n,p[g+2],17,606105819);n=md5_ff(n,m,l,o,p[g+3],22,-1044525330);o=md5_ff(o,n,m,l,p[g+4],7,-176418897);l=md5_ff(l,o,n,m,p[g+5],12,1200080426);m=md5_ff(m,l,o,n,p[g+6],17,-1473231341);n=md5_ff(n,m,l,o,p[g+7],22,-45705983);o=md5_ff(o,n,m,l,p[g+8],7,1770035416);l=md5_ff(l,o,n,m,p[g+9],12,-1958414417);m=md5_ff(m,l,o,n,p[g+10],17,-42063);n=md5_ff(n,m,l,o,p[g+11],22,-1990404162);o=md5_ff(o,n,m,l,p[g+12],7,1804603682);l=md5_ff(l,o,n,m,p[g+13],12,-40341101);m=md5_ff(m,l,o,n,p[g+14],17,-1502002290);n=md5_ff(n,m,l,o,p[g+15],22,1236535329);o=md5_gg(o,n,m,l,p[g+1],5,-165796510);l=md5_gg(l,o,n,m,p[g+6],9,-1069501632);m=md5_gg(m,l,o,n,p[g+11],14,643717713);n=md5_gg(n,m,l,o,p[g+0],20,-373897302);o=md5_gg(o,n,m,l,p[g+5],5,-701558691);l=md5_gg(l,o,n,m,p[g+10],9,38016083);m=md5_gg(m,l,o,n,p[g+15],14,-660478335);n=md5_gg(n,m,l,o,p[g+4],20,-405537848);o=md5_gg(o,n,m,l,p[g+9],5,568446438);l=md5_gg(l,o,n,m,p[g+14],9,-1019803690);m=md5_gg(m,l,o,n,p[g+3],14,-187363961);n=md5_gg(n,m,l,o,p[g+8],20,1163531501);o=md5_gg(o,n,m,l,p[g+13],5,-1444681467);l=md5_gg(l,o,n,m,p[g+2],9,-51403784);m=md5_gg(m,l,o,n,p[g+7],14,1735328473);n=md5_gg(n,m,l,o,p[g+12],20,-1926607734);o=md5_hh(o,n,m,l,p[g+5],4,-378558);l=md5_hh(l,o,n,m,p[g+8],11,-2022574463);m=md5_hh(m,l,o,n,p[g+11],16,1839030562);n=md5_hh(n,m,l,o,p[g+14],23,-35309556);o=md5_hh(o,n,m,l,p[g+1],4,-1530992060);l=md5_hh(l,o,n,m,p[g+4],11,1272893353);m=md5_hh(m,l,o,n,p[g+7],16,-155497632);n=md5_hh(n,m,l,o,p[g+10],23,-1094730640);o=md5_hh(o,n,m,l,p[g+13],4,681279174);l=md5_hh(l,o,n,m,p[g+0],11,-358537222);m=md5_hh(m,l,o,n,p[g+3],16,-722521979);n=md5_hh(n,m,l,o,p[g+6],23,76029189);o=md5_hh(o,n,m,l,p[g+9],4,-640364487);l=md5_hh(l,o,n,m,p[g+12],11,-421815835);m=md5_hh(m,l,o,n,p[g+15],16,530742520);n=md5_hh(n,m,l,o,p[g+2],23,-995338651);o=md5_ii(o,n,m,l,p[g+0],6,-198630844);l=md5_ii(l,o,n,m,p[g+7],10,1126891415);m=md5_ii(m,l,o,n,p[g+14],15,-1416354905);n=md5_ii(n,m,l,o,p[g+5],21,-57434055);o=md5_ii(o,n,m,l,p[g+12],6,1700485571);l=md5_ii(l,o,n,m,p[g+3],10,-1894986606);m=md5_ii(m,l,o,n,p[g+10],15,-1051523);n=md5_ii(n,m,l,o,p[g+1],21,-2054922799);o=md5_ii(o,n,m,l,p[g+8],6,1873313359);l=md5_ii(l,o,n,m,p[g+15],10,-30611744);m=md5_ii(m,l,o,n,p[g+6],15,-1560198380);n=md5_ii(n,m,l,o,p[g+13],21,1309151649);o=md5_ii(o,n,m,l,p[g+4],6,-145523070);l=md5_ii(l,o,n,m,p[g+11],10,-1120210379);m=md5_ii(m,l,o,n,p[g+2],15,718787259);n=md5_ii(n,m,l,o,p[g+9],21,-343485551);o=safe_add(o,j);n=safe_add(n,h);m=safe_add(m,f);l=safe_add(l,e)}return Array(o,n,m,l)}function md5_cmn(h,e,d,c,g,f){return safe_add(bit_rol(safe_add(safe_add(e,h),safe_add(c,f)),g),d)}function md5_ff(g,f,k,j,e,i,h){return md5_cmn((f&k)|((~f)&j),g,f,e,i,h)}function md5_gg(g,f,k,j,e,i,h){return md5_cmn((f&j)|(k&(~j)),g,f,e,i,h)}function md5_hh(g,f,k,j,e,i,h){return md5_cmn(f^k^j,g,f,e,i,h)}function md5_ii(g,f,k,j,e,i,h){return md5_cmn(k^(f|(~j)),g,f,e,i,h)}function safe_add(a,d){var c=(a&65535)+(d&65535);var b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}function bit_rol(a,b){return(a<<b)|(a>>>(32-b))};





//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////







/////////////////KUPB BROWSER EVENT COLLECTION////////////////////////////

/////THEY WERE DELETED BUT SOME POSSIBLY USEFUL FUNCTIONS ARE REMAINING///

//////////////////////////////////////////////////////////////////////////



//This function consider if the element's colour has been defined to transparent in order to omit it.

//I had to fix the code as it was using "jqueryElement.css("background-color");" type of functions instead of "jQuery(jqueryElement).css("

//The first function also returns information about the "colour parent" that is responsible for the colour change of the element



//Source:http://stackoverflow.com/questions/4259815/how-do-i-detect-the-inherited-background-color-of-an-element-using-jquery-js

function getBackgroundColourWithColourParent(jqueryElement) {

    // Is current element's background color set?

    var color = jQuery(jqueryElement).css("background-color");

    

    if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {

        // if so then return that color

        return (jqueryElement.html() + "," + jqueryElement.textContent+":" + color);

    }



    // if not: are you at the body element?

    if (jQuery(jqueryElement).is("body")) {

        // return known 'false' value

        return false;

    } else {

        // call getBackground with parent item

        return getBackgroundColourWithColourParent(jQuery(jqueryElement).parent());

    }

}



function getBackgroundColour(jqueryElement) {

    // Is current element's background color set?

    var color = jQuery(jqueryElement).css("background-color");

    

    if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {

        // if so then return that color

        return (color);

    }



    // if not: are you at the body element?

    if (jQuery(jqueryElement).is("body")) {

        // return known 'false' value

        return false;

    } else {

        // call getBackground with parent item

        return getBackgroundColour(jQuery(jqueryElement).parent());

    }

}



/**

 * Returns the string representation of the corresponding key code.

 * I got this code from the web page, although is slightly modified: http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

 * 

 */ 



function returnKeyValue(keyCode)

{

	var stringValue = String.fromCharCode(keyCode);

	

	if (keyCode == 8) stringValue = "backspace"; //  backspace

	if (keyCode == 9) stringValue = "tab"; //  tab

	if (keyCode == 13) stringValue = "enter"; //  enter

	if (keyCode == 16) stringValue = "shift"; //  shift

	if (keyCode == 17) stringValue = "ctrl"; //  ctrl

	if (keyCode == 18) stringValue = "alt"; //  alt

	if (keyCode == 19) stringValue = "pause/break"; //  pause/break

	if (keyCode == 20) stringValue = "caps lock"; //  caps lock

	if (keyCode == 27) stringValue = "escape"; //  escape

	if (keyCode == 33) stringValue = "page up"; // page up, to avoid displaying alternate character and confusing people	         

	if (keyCode == 34) stringValue = "page down"; // page down

	if (keyCode == 35) stringValue = "end"; // end

	if (keyCode == 36) stringValue = "home"; // home

	if (keyCode == 37) stringValue = "left arrow"; // left arrow

	if (keyCode == 38) stringValue = "up arrow"; // up arrow

	if (keyCode == 39) stringValue = "right arrow"; // right arrow

	if (keyCode == 40) stringValue = "down arrow"; // down arrow

	if (keyCode == 45) stringValue = "insert"; // insert

	if (keyCode == 46) stringValue = "delete"; // delete

	if (keyCode == 91) stringValue = "left window"; // left window

	if (keyCode == 92) stringValue = "right window"; // right window

	if (keyCode == 93) stringValue = "select key"; // select key

	if (keyCode == 96) stringValue = "numpad 0"; // numpad 0

	if (keyCode == 97) stringValue = "numpad 1"; // numpad 1

	if (keyCode == 98) stringValue = "numpad 2"; // numpad 2

	if (keyCode == 99) stringValue = "numpad 3"; // numpad 3

	if (keyCode == 100) stringValue = "numpad 4"; // numpad 4

	if (keyCode == 101) stringValue = "numpad 5"; // numpad 5

	if (keyCode == 102) stringValue = "numpad 6"; // numpad 6

	if (keyCode == 103) stringValue = "numpad 7"; // numpad 7

	if (keyCode == 104) stringValue = "numpad 8"; // numpad 8

	if (keyCode == 105) stringValue = "numpad 9"; // numpad 9

	if (keyCode == 106) stringValue = "multiply"; // multiply

	if (keyCode == 107) stringValue = "add"; // add

	if (keyCode == 109) stringValue = "subtract"; // subtract

	if (keyCode == 110) stringValue = "decimal point"; // decimal point

	if (keyCode == 111) stringValue = "divide"; // divide

	if (keyCode == 112) stringValue = "F1"; // F1

	if (keyCode == 113) stringValue = "F2"; // F2

	if (keyCode == 114) stringValue = "F3"; // F3

	if (keyCode == 115) stringValue = "F4"; // F4

	if (keyCode == 116) stringValue = "F5"; // F5

	if (keyCode == 117) stringValue = "F6"; // F6

	if (keyCode == 118) stringValue = "F7"; // F7

	if (keyCode == 119) stringValue = "F8"; // F8

	if (keyCode == 120) stringValue = "F9"; // F9

	if (keyCode == 121) stringValue = "F10"; // F10

	if (keyCode == 122) stringValue = "F11"; // F11

	if (keyCode == 123) stringValue = "F12"; // F12

	if (keyCode == 144) stringValue = "num lock"; // num lock

	if (keyCode == 145) stringValue = "scroll lock"; // scroll lock

	if (keyCode == 186) stringValue = ";"; // semi-colon

	if (keyCode == 187) stringValue = "="; // equal-sign

	if (keyCode == 188) stringValue = ","; // comma

	if (keyCode == 189) stringValue = "-"; // dash

	if (keyCode == 190) stringValue = "."; // period

	if (keyCode == 191) stringValue = "/"; // forward slash

	if (keyCode == 192) stringValue = "`"; // grave accent

	if (keyCode == 219) stringValue = "["; // open bracket

	if (keyCode == 220) stringValue = "\\"; // back slash

	if (keyCode == 221) stringValue = "]"; // close bracket

	if (keyCode == 222) stringValue = "'"; // single quote

	

	return stringValue;



}



/**

 * Code for the survey

 * 

 */

 

 

 ///SURVEY COOKIE FUNCTIONS

 

 

 ////////////////Survey variables

/**

 * States of the cookie:

 * - If not found, set it to '1' (first visit since survey code has been added)

 * - If found, and greater than 0, the value corresponds to the number of visits since the survey code was added

 * - If 0, the user has already replied to the survey

 * - If -1, the user has requested to never see the question again

 */ 

var surveyStateCookie = "proxySurveyStateNew";



/**

 * The timestamp for the last time the survey was shown to the user

 */ 

var surveyLastTimeShownCookie = "proxySurveyLastTimeShownNew";



//minimum amount of visits to wait before showing the questionnaire

var surveyMinimumVisits = 2;

//necessary time between visits in order to be counted as visit

var surveyTimeBetweenVisits = 2400000;//40 minutes//1minute:60000;//

//Cookie storing the timestamp of the last time we counted the user as a visit

var surveyLastVisitCookie = "proxySurveyLastVisitNew";



//Time between surveys. Before showing the survey, if the time between now and surveyLastTimeShown is smaller than this, we won't show the survey

var surveyTimeBetweenSurveys = 86400000;//1 day//4 minutes:240000;//


//Are we going to show this user a first time survey
var isFirstSurvey = false;
var firstTimeSurveyCookie = "proxySurveyfirstTimeSurvey";

 /**

  * Functions to modify the state of the survey

  */ 

function surveyTestAndShow(){

	if ((websiteID =="10001"|| websiteID =="10006" || websiteID =="20001") && surveyTestCookie()){

		surveyShow();
		
		if(getCookie(firstTimeSurveyCookie)=="true" && getCookie(surveyStateCookie) == 1)
			window.setTimeout(function(){writeLog_UsaProxy("surveyShown&surveyState=" + "-5"); }, 2000);
        else
			window.setTimeout(function(){writeLog_UsaProxy("surveyShown&surveyState=" + "-3"); }, 2000);

	}

}

 

function surveyTestCookie(){

	 /**

	 * States of the cookie:

	 * - If not found, set it to '1' (first visit since survey code has been added)

	 * - If found, and greater than 0, the value corresponds to the number of visits since the survey code was added

	 * - If 0, the user has already replied to the survey

	 * - If -1, the user has requested to never see the question again

	 */

	var surveyState = getCookie(surveyStateCookie);

	//The timestamp for the last time the survey was shown to the user ('0' if it was never shown)

	var surveyLastTimeShown = getCookie(surveyLastTimeShownCookie);

	

	//Cookie storing the timestamp of the last time we counted the user as a visit

	var surveyLastVisit = getCookie(surveyLastVisitCookie);

	

	

	//console.log("Testing if survey should be shown");

	//console.log("surveyState:" + surveyState);

	//console.log("surveyLastVisit:" + surveyLastVisit);

	//console.log("surveyLastTimeShown:" + surveyLastTimeShown);

	

	/*

	 * Look for surveyStateCookie

	 * _if not found
	 * __Roll a random number
	 * _____if smaller than 0.5, set to 1, and RETURN false (First visit with survey code)
	 * _____if bigger than 0.5, set to 1, set firstTimeSurveyCookie = true, and RETURN true (First visit survey should show now)

	 * _else if value equal to '0' (user has already replied) or '-1' (user wished not to be bothered ever again), RETURN false

	 * _else if value smaller than surveyMinimumVisits
	 * _____ if firstTimeSurveyCookie is true, and the visit count is 1, return true
	 * _____ else increase surveyStateCookie value by one, and RETURN false 

	 * _else (the visits value is high enough)

	 * ___if (timeNow - surveyLastTimeShown) > surveyTimeBetweenSurveys, RETURN true

	 * ___else increase surveyStateCookie value by one, and RETURN false

	 */

	 

	//if not found, set to 1, and RETURN false (First visit with survey code)

	if (surveyState == "null"){

		//console.log("Initialising cookies");

	 	setCookie(surveyStateCookie, 1, cookieLife);

		setCookie(surveyLastTimeShownCookie, 0, cookieLife);

		setCookie(surveyLastVisitCookie, datestampInMillisec(), cookieLife);


		//It's the users' first visit, we'll roll to see if the first time survey should be shown
		var randValue = Math.random();
		console.log("First visit survey chance:" + randValue);
		if (randValue >= 0.5){
			//if true, we'll take this user as first time survey user
			setCookie(firstTimeSurveyCookie, true, cookieLife);
			return true;
		}
		else
			return false;

	}

	//if value equal to '0' (user has already replied) or '-1' (user wished not to be bothered ever again), RETURN false

	else if(surveyState == 0 || surveyState == -1){

		return false;

	}

	else{

		//only increase surveyStateCookie value by one if time since last visit was over the threshold

		if((datestampInMillisec() - surveyLastVisit) > surveyTimeBetweenVisits){

			surveyState++;

			setCookie(surveyStateCookie, surveyState, cookieLife);

			//console.log("Increasing surveyLastVisit:" + surveyState);

		}

		setCookie(surveyLastVisitCookie, datestampInMillisec(), cookieLife);

		//console.log("Storing latest surveyLastVisit:" + datestampInMillisec());



		//if value smaller than surveyMinimumVisits 

		if(surveyState < surveyMinimumVisits){

			//console.log("Visit count was not enough:" + surveyState);
			
			//Check if the user was selected for first visit survey AND we are still in the first visit
			if (getCookie(firstTimeSurveyCookie)=="true" && surveyState == 1)
				return true;
			else
				return false;

		}

		//if the visits value is high enough

		else{

			//console.log("Visit count was enough:" + surveyState);

			//if the time between the last time the survey was shown and now is great enough

			if ((datestampInMillisec() - surveyLastTimeShown) > surveyTimeBetweenSurveys){
				
				return true;

			}

			else{

				//console.log("Time since last survey was not enough:" + surveyLastTimeShown);

				return false;

			}

		}

	}

}



function surveyInsertCSSSource(){

	var latoFont = document.createElement("link");

	latoFont.href = 'http://fonts.googleapis.com/css?family=Lato';

	latoFont.rel = 'stylesheet';

	latoFont.type = 'text/css';

	

	if (document.body.firstChild){

      	document.body.insertBefore(latoFont, document.body.firstChild);

	} else {

      	document.body.appendChild(latoFont);

	}

}



//if (isUserEligibleForSurvey()){

function surveyShow(){


	//First we need to add the CSS sources we'll use

	surveyInsertCSSSource();



	//main surveyDiv object, containing the entire set of message and buttons

	var surveyDiv = document.createElement("div");



	surveyDiv.id = "surveyDialog";

	surveyDiv.style.position = "fixed";//"absolute";

	surveyDiv.style.bottom = "20px";//"50%";//

	surveyDiv.style.right = "20px";//"37.5%";//

	surveyDiv.style.zIndex = "9999";

	surveyDiv.style.width = "25%";

	surveyDiv.style.height = "auto";

	surveyDiv.style.backgroundColor = "#F5F5F5";//"#EAEAEA"//"#dddddd";//"#ffffff";//

	surveyDiv.style.borderStyle = "ridge";

	surveyDiv.style.fontSize = "20px";

	surveyDiv.style.fontFamily = "'Lato', sans-serif";

	surveyDiv.style.textAlign = "justify";

	

	//surveyDiv.style.boxShadow = "10px 10px 5px rgba(0, 0, 0, 0.7)"//#888888";

	surveyDiv.style.boxShadow = "10px 10px 5px rgba(102, 0, 153, 0.7)"//#888888";

	

	

	//Thicker border to make it stand out

	//#660099 is the university's logo purple colour

	surveyDiv.style.border = "6px solid #660099";

	surveyDiv.style.borderRadius = "10px";





	

	//university logo

	var surveyLogoDiv = document.createElement("div");

	surveyLogoDiv.style.display = "table-cell";

	surveyLogoDiv.style.verticalAlign = "middle";

	surveyLogoDiv.style.paddingRight = "5px";

	surveyLogoDiv.style.paddingLeft = "5px";

	surveyLogoDiv.style.paddingTop = "5px";

	surveyLogoDiv.style.paddingBottom = "5px";





	var surveyLogo = document.createElement("img");

	surveyLogo.src = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/Logo_ManchesterEst1824.png";

	surveyLogo.style.height="42px";

	surveyLogo.style.maxWidth="none";

	surveyLogoDiv.appendChild(surveyLogo);

	surveyDiv.appendChild(surveyLogoDiv);



	//Title next ot the logo

	var surveyTitleDiv = document.createElement("div");

	surveyTitleDiv.style.display = "table-cell";

	surveyTitleDiv.style.verticalAlign = "middle";

	surveyTitleDiv.style.paddingRight = "5px";

	surveyTitleDiv.style.paddingLeft = "5px";

	surveyTitleDiv.style.paddingTop = "5px";

	surveyTitleDiv.style.paddingBottom = "5px";

	surveyTitleDiv.style.width = "100%"

	surveyTitleDiv.style.textAlign = "center";



	surveyTitleDiv.textContent = "Help us";

	surveyTitleDiv.style.fontWeight = "bold";

	surveyTitleDiv.style.fontSize = "150%";

	surveyDiv.appendChild(surveyTitleDiv);

	

	//new line to add separation between message and buttons

	var newLineDiv = document.createElement("br");

	newLineDiv.style.lineHeigth = "1px";

	//surveyDiv.appendChild(newLineDiv);

	

	//main message div

	var surveyMainMessageDiv = document.createElement("div");

	//surveyMainMessageDiv.style.display = "table-cell";

	surveyMainMessageDiv.style.verticalAlign = "middle";

	surveyMainMessageDiv.style.paddingRight = "5px";

	surveyMainMessageDiv.style.paddingLeft = "5px";

	surveyMainMessageDiv.style.paddingTop = "5px";

	surveyMainMessageDiv.style.paddingBottom = "5px";



	var surveyMainMessage = document.createElement("div");

	surveyMainMessage.id = "surveyMainMessage";

	//document.createTextNode("Please take part in the survey, you would make a PhD student really happy");

	surveyMainMessage.textContent = "Would you like to help the University of Manchester with their research? It only takes 10 seconds.";

	surveyMainMessageDiv.style.verticalAlign = "middle";

	surveyMainMessageDiv.style.textAlign = "center";

	//surveyMainMessageDiv.style.paddingRight = "15px";

	//surveyMainMessageDiv.style.paddingLeft = "15px";





	surveyMainMessageDiv.appendChild(surveyMainMessage);

	surveyDiv.appendChild(surveyMainMessageDiv);



	

	//div containing the buttons

	var buttonLineDive =  document.createElement("div");

	buttonLineDive.style.marginLeft = "auto";

	buttonLineDive.style.marginRight = "auto";

	buttonLineDive.style.width = "100%"

	buttonLineDive.style.heigth = "40px"

	buttonLineDive.style.display = "table";

	buttonLineDive.style.paddingRight = "5px";

	buttonLineDive.style.paddingLeft = "5px";

	buttonLineDive.style.paddingTop = "5px";

	buttonLineDive.style.paddingBottom = "5px";

	surveyDiv.appendChild(buttonLineDive);



	//in order for display table and table-cell to obtain the effect we want (equal distribution accross the div) the button need div containers

	var agreeButtonDiv = document.createElement("div");

	agreeButtonDiv.style.fontWeight = "bold";

	agreeButtonDiv.style.display = "table-cell";

	agreeButtonDiv.style.textAlign = "center";

	

	var agreeButton = document.createElement("button");

	agreeButton.id = "surveyDialogAgreeButton";

	agreeButton.textContent = "Take part in the study";

	agreeButton.onclick = surveyAgreeTo;

	agreeButtonDiv.appendChild(agreeButton);

	buttonLineDive.appendChild(agreeButtonDiv);



	var rejectButtonDiv = document.createElement("div");

	rejectButtonDiv.style.fontWeight = "bold";

	rejectButtonDiv.style.display = "table-cell";

	rejectButtonDiv.style.textAlign = "center";



	var rejectButton = document.createElement("button");

	rejectButton.id = "surveyDialogRejectButton";

	rejectButton.textContent = "Not now";

	rejectButton.onclick = surveyNextTime;

	rejectButtonDiv.appendChild(rejectButton);

	buttonLineDive.appendChild(rejectButtonDiv);



	var rejectForeverButtonDiv = document.createElement("div");

	rejectForeverButtonDiv.style.fontWeight = "bold";

	rejectForeverButtonDiv.style.display = "table-cell";

	rejectForeverButtonDiv.style.textAlign = "center";

	rejectForeverButtonDiv.style.paddingRight = "10px";



	var rejectForeverButton = document.createElement("button");

	rejectForeverButton.id = "surveyDialogRejectForeverButton";

	rejectForeverButton.textContent = "Never ask again";

	rejectForeverButton.onclick = surveyRejectForever;

	rejectForeverButtonDiv.appendChild(rejectForeverButton);



	buttonLineDive.appendChild(rejectForeverButtonDiv);

	



	if (document.body.firstChild){

      	document.body.insertBefore(surveyDiv, document.body.firstChild);

		//console.log("inserting before");

	} else {

      	document.body.appendChild(surveyDiv);

      	//console.log("appending before");

	}

}



function surveyAgreeTo(){

	//alert("Agreed");

	surveyMainMessage = document.getElementById("surveyMainMessage");

	rejectButton = document.getElementById("surveyDialogRejectButton");

	agreeButton = document.getElementById("surveyDialogAgreeButton");

	rejectForeverButton = document.getElementById("surveyDialogRejectForeverButton");

	

	//window.open("https://docs.google.com/forms/d/1AVeEBa9tpjvU1zpQlS6qpHQNisYWVq_UvwJtCb452yQ?sid=" + window.sessionId);
	
	//First time survey
	if(getCookie(firstTimeSurveyCookie)=="true" && getCookie(surveyStateCookie) == 1){
		questionnaireUrl = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/familiarityQuestionair1stTimers.html";

		window.open(questionnaireUrl + "?sid=" + sessionID + "&sd=" + window.webpageIndex);
		setCookie(firstTimeSurveyCookie, true, cookieLife);
		writeLog_UsaProxy("surveyShown&surveyState=" + "-4");
		
	}
	
	else{
		//revisiting survey
		questionnaireUrl = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/familiarityQuestionnaire.html";

		window.open(questionnaireUrl + "?sid=" + sessionId + "&sd=" + window.webpageIndex);

	}


	surveyMainMessage.textContent = "Thanks for agreeing! We appreciate you taking the time";



	//write a generic event, just so it's reflected in the db

	//I will also send the cookie information about the number of visits

	writeLog_UsaProxy("surveyShown&surveyState=" + getCookie(surveyStateCookie));

	

	//Update the state of the cookie

	//Survey shown time

	setCookie(surveyLastTimeShownCookie, datestampInMillisec(), cookieLife);

	//State of the survey to '0' (answered)

	setCookie(surveyStateCookie, 0, cookieLife);

	

	rejectButton.textContent = "Close";

	rejectButton.onclick = function(){

		rejectButton.parentNode.removeChild(rejectButton);

		surveyDialog.parentNode.removeChild(surveyDialog);

		};

	

	agreeButton.parentNode.removeChild(agreeButton);

	rejectForeverButton.parentNode.removeChild(rejectForeverButton);



}





function surveyNextTime(){

	surveyMainMessage = document.getElementById("surveyMainMessage");

	rejectButton = document.getElementById("surveyDialogRejectButton");

	agreeButton = document.getElementById("surveyDialogAgreeButton");

	rejectForeverButton = document.getElementById("surveyDialogRejectForeverButton");



	surveyMainMessage.textContent = "OK, we will ask you again another time.";

	

	//write a generic event, just so it's reflected in the db

	//I will also send the cookie information about the number of visits

	writeLog_UsaProxy("surveyShown&surveyState=" + "-2");

	

	//Update the state of the cookie

	//Survey shown time

	setCookie(surveyLastTimeShownCookie, datestampInMillisec(), cookieLife);

	

	

	rejectButton.parentNode.removeChild(rejectButton);

	agreeButton.parentNode.removeChild(agreeButton);

	rejectForeverButton.parentNode.removeChild(rejectForeverButton);

	

	setTimeout(function(){

			surveyDialog = document.getElementById("surveyDialog");

			surveyDialog.parentNode.removeChild(surveyDialog);

		}, 5000);

	

}



function surveyRejectForever(){

	surveyMainMessage = document.getElementById("surveyMainMessage");

	rejectButton = document.getElementById("surveyDialogRejectButton");

	agreeButton = document.getElementById("surveyDialogAgreeButton");

	rejectForeverButton = document.getElementById("surveyDialogRejectForeverButton");



	surveyMainMessage.textContent = "Sorry to hear that, we won't ask again.";

	

		

	//write a generic event, just so it's reflected in the db

	//I will also send the cookie information about the number of visits

	writeLog_UsaProxy("surveyShown&surveyState=" + "-1");

	

	//Update the state of the cookie

	//Survey shown time

	setCookie(surveyLastTimeShownCookie, datestampInMillisec(), cookieLife);

	//The user doesn't want to be bothered ever again, set surveyState to -1

	setCookie(surveyStateCookie, -1, cookieLife);

	

	rejectButton.parentNode.removeChild(rejectButton);

	agreeButton.parentNode.removeChild(agreeButton);

	rejectForeverButton.parentNode.removeChild(rejectForeverButton);

	

	setTimeout(function(){

			surveyDialog = document.getElementById("surveyDialog");

			surveyDialog.parentNode.removeChild(surveyDialog);

		}, 5000);

}

function surveyFirstTimeAgreeTo(){
	

}

////////////////////USEFUL FUNCTIONS FOR DEBUGGING

//It's pretty useful to put calls to specific nodes in the mousedown function,

//when the right or middle button gets activated



//Function that prints all CSS values of an element

	

	/*var computedStyle = window.getComputedStyle(node);

	var stringedStyle = "";

	

	//looping through the vector we get the value names

	for (i=0; i<computedStyle.length; i++) {

		

		var cssValue = jQuery(node).css(computedStyle[i]);//jQuery will get us the value of those fields

		stringedStyle+= computedStyle[i] + ":" + cssValue +"||||\n";

	}

	

	alert(stringedStyle);

*/









////This function will be called when DOM is ready, we will include all events that we want to handle with jQuery to maximize compatibility

//function jQueryListeners(){

	//jQuery(document).ready(function(){

		//alert("registering jQuery events");

		//jQuery(document).mousemove(function(ev){

			//alert("mousemoved");

			//jQuery('#status').html(e.pageX +', '+ e.pageY);

			//var target 	= ev.target;

			//var x 		= ev.pageX;

			//var y 		= ev.pageY;

		

			//var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

			//var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

			

			//// if log mousemove flag is false, set it true and log a mousemove event

			//if (!FLG_LogMousemove_UsaProxy

				//// if mouse pointer actually moved 

				//&& !(x==lastMousePosX_UsaProxy && y==lastMousePosY_UsaProxy) ) {

					//FLG_LogMousemove_UsaProxy = true;

					//lastMousePosX_UsaProxy = x;

					//lastMousePosY_UsaProxy = y;

					

					//writeLog_UsaProxy("jQuerymousemove&coords=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

					////saveLog_UsaProxy();

					//window.setTimeout('setInaktiv_UsaProxy()',mouseTimeout);

			//}

		   //});

	   

	//})

//}



/*document.addEventListener("DOMSubtreeModified", function() {

    alert("DOMSubtreeModified fired!");

}, false);*/

//if(document.attachEvent) jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

//if(document.addEventListener) jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

//jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

