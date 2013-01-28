/**CHANGES!!! This is not the original proxyscript, it was modified to allow developers to copypaste a script initialitation instead of a proxy approach. All the changes are tagged "CHANGE"**/

//CHANGE!! I added jquery to use certain interesting functions
//<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" type="text/javascript"></script>

function includeJquery(){
//	
//	if (typeof jQuery != 'undefined') {
// 
//    alert("jQuery library is correctly loaded!");
// 
//}else{
// 
//    alert("jQuery library is not found!");
// 
//}

	var jQuerySrc="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"
	
	//we add the script dinamically
	var jQueryScriptNode = document.createElement('script');
	jQueryScriptNode.id='proxyScript_jQuery';
	jQueryScriptNode.type = 'text/javascript';
	jQueryScriptNode.src = jQuerySrc;

	document.getElementsByTagName('head')[0].appendChild(jQueryScriptNode);
	
	//alert("jQuery was added");
	//jQueryListeners();
}

/** Core UsaProxy JavaScript part.
	This proxyscript.js is used for pure logging of user activity
	without any collaboration functionality */

var logVal_UsaProxy;			// String: Initialised when page loads. Contains current event log entries
var FLG_writingLogVal_UsaProxy;	// Boolean: if flag set, writing log entry to logVal_UsaProxy not possible

var IVL_saveLog_UsaProxy;		// Interval function variable for sending captured data to UsaProxy

var serverdataId_UsaProxy;      /* String: contains related serverdata ID defined by UsaProxy 
								 * (page ID assigned by UsaProxy when data was cached)*/

var id_UsaProxy;				// String: contains String identifying the current UsaProxy instance
								 
/* timestamp objects */

/* Date: Initialised by UsaProxy. Load completion timestamp is  
   calculated relative to this timestamp.
   * Doesn't need to be created as the server add it with its corresponding value*/
//var startDate_UsaProxy;			

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


//////////////////////BROWSER VARIABLE

///////This variable will be used to discern if the browser is IE or not
var isNotOldIE;

////////////////////////////////////Mouse constants////////////////////////////////////

var mouseTimeout = 150;

////////////////////////////Session ID////////////////////
var sessionID = null;

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
inferBrowserInfo();

//Initializing the array of log requests
var xmlreqs_UsaProxy = new Array();	/** contains the currently used XMLHttpRequest objects */


/* Now init_UsaProxy is called from handleCookieButton and getSessionFromCookie
 * This way we make sure we don't record information from users who don't want to be recorded.*/
 
 
if(document.attachEvent)
	isNotOldIE = false;
else
	isNotOldIE = true;
 
//if(document.attachEvent) window.attachEvent('onload', askForCookiePermission);
//if(document.addEventListener) window.addEventListener('load', askForCookiePermission, false);

if (isNotOldIE) window.addEventListener('load', askForCookiePermission, false);
else window.attachEvent('onload', askForCookiePermission);

/*I have to imitate the previous statements to add the jQuery function*/
if (isNotOldIE) window.addEventListener('load', includeJquery, false);
else window.attachEvent('onload', includeJquery);


/** Initializes all variables, event handlers, and interval functions and
 * invokes the logging of the load event 
 */
function init_UsaProxy() {
	
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

	/* retrieve reference string URL parameters */
	
	/* GETTING PARAMETERS FROM URL IS DEPRECATED FOR COPYPASTE APPROACH!!*/
	//CHANGES: we get all data from our global variables (the inclussion of a port number breaks the parsing so the code didn't work)
	
	serverdataId_UsaProxy	= window.webpageIndex;
	//set_date_UsaProxy();
	//startDate_UsaProxy=date_UsaProxy(window.usaProxyDate);
	
	startDate_UsaProxy = parseInt(startDate_UsaProxy);
	
	id_UsaProxy=window.usaProxyId;
	
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
	
	/* instantiate scroll check and save function being invoked periodically */
	IVL_scrollCheck_UsaProxy 	= window.setInterval("processScroll_UsaProxy()",1000);
	IVL_saveLog_UsaProxy 		= window.setInterval("saveLog_UsaProxy()",3000);
	
	//We ask for implicit permission for logging
	//askForCookiePermission();

}

////This function will be called when DOM is ready, we will include all events that we want to handle with jQuery to maximize compatibility
//function jQueryListeners(){
	//$(document).ready(function(){
		//alert("registering jQuery events");
		//$(document).mousemove(function(ev){
			//alert("mousemoved");
			//$('#status').html(e.pageX +', '+ e.pageY);
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
//if(document.attachEvent) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//if(document.addEventListener) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//$("element-root").bind(DOMSubtreeModified,"domChangeListener");


//CHANGE: function added to calculate the date
//DEPRECATED: The time comes from the server now
/*function set_date_UsaProxy(){
	var today = new Date();
	var cDate = today.getDate();
	var cMonth = today.getMonth()+1;//JavaScript counts the months from 0 to 11
	var cYear = today.getFullYear();
	var cHour = today.getHours();
	var cMin = today.getMinutes();
	var cSec = today.getSeconds();
	var cMilliSec = today.getMilliseconds();

	//the time format must include 2 digits each, so we'll modify them
	if (cDate < 10)
	  cDate = "0" + cDate
	if (cMonth < 10)
	  cMonth = "0" + cMonth
	if (cHour < 10)
	  cHour = "0" + cHour
	if (cMin < 10)
	  cMin = "0" + cMin
	if (cSec < 10)
	  cSec = "0" + cSec
	  
	//we want milliseconds to have three digits
	if (cMilliSec < 10)
	  cMilliSec = "00" + cMilliSec
	else if (cMilliSec < 100)
	  cMilliSec = "0" + cMilliSec
		  
	//Server configuration parameters
	window.usaProxyDate=cYear+"-"+cMonth+"-"+cDate+","+cHour+":"+cMin+":"+cSec;
}*/


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
 * the difference between load time and current time */
 
 //CHANGE: now it returns the date with milliseconds
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
	
	//We add the browser version
	text = appendBrowserName(text);
	
	
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
	var logline;
	logLine = "time=" + datestamp_UsaProxy() + "&sd=" + serverdataId_UsaProxy + "&sid="
	+ sessionID + "&event=" + text+ "&url=" + encodeURIComponent(url);
	
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
				eventString = eventString + "&link=" + node.href + "&text=" + escape(node.innerText);
			// NS: text property contains link text
			else eventString = eventString + "&link=" + node.href + "&text=" + escape(node.text);
		}
	} else {
		// image detection NS
		if (node.src) {		
			if (node.parentNode.href)
				eventString = eventString + "&img=" + getFileName(node.src) + "&link=" + node.parentNode.href
			else eventString = eventString + "&img=" + getFileName(node.src);
		}
	}
	
	//Get textContent of the variable
	var textContent ="null";
	if (node.firstChild!=null)
		textContent = node.firstChild.nodeValue;    

	//We are adding also browser's information

	//eventString = eventString + "&nodeType=" + node.tagName + "&textContent=" + encodeURIComponent(textContent) + "&textValue=" + encodeURIComponent(node.value);
	eventString = eventString + "&nodeType=" + node.tagName + "&textValue=" + encodeURIComponent(node.value);
		
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
			if (window.xmlhttpChange_UsaProxy) { xmlhttpChange_UsaProxy(pos, callback_function); }
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
		//	alert('Caught Exception: ' + e.description);
		}
	}
}

/** end of AJAX code */

/** Sends tracked usage data (if available) to UsaProxy */
/**CHANGES: this method was changed. In the proxy approach no IP adress is required, but when using a copypaste approach the IP of the server running the UsaProxy server needs to be specified here **/
function saveLog_UsaProxy() {

	if(logVal_UsaProxy!="") {
		xmlreqGET_UsaProxy("http://"+window.usaProxyServerIP+"/usaproxylolo/log?" + logVal_UsaProxy, "");
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
	writeLog_UsaProxy("load&size=" + loadWidth + "x" + loadHeight);
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
	
	//We check if we have recorded this size at this time already
	if (lastResizeWidth!=newWidth || lastResizeHeigth!=newHeight || lastResizeDate!= new Date().getTime()){
		lastResizeWidth = newWidth;
		lastResizeHeigth = newHeight;
		lastResizeDate = new Date().getTime();
		
		writeLog_UsaProxy("resize&size=" + newWidth + "x" + newHeight);
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
	
	
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	// if log mousemove flag is false, set it true and log a mousemove event
	if (!FLG_LogMousemove_UsaProxy
		/** if mouse pointer actually moved */
		&& !(x==lastMousePosX_UsaProxy && y==lastMousePosY_UsaProxy) ) {
			FLG_LogMousemove_UsaProxy = true;
			lastMousePosX_UsaProxy = x;
			lastMousePosY_UsaProxy = y;
			
			writeLog_UsaProxy("mousemove&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
			//saveLog_UsaProxy();
			window.setTimeout('setInaktiv_UsaProxy()',mouseTimeout);
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
				
				/* if (target.type=="text" 
		 		  || target.type=="textarea" ) {
				 	// select listener: only for NS
					target.removeEventListener('select', processSelectionNS_UsaProxy, false);
				 	target.addEventListener('select', processSelectionNS_UsaProxy, false);
				 }*/
			}
		}
	}
	
	// log mouseover coordinates and all available target attributes
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mouseover&id=" + target.id + generateEventString_UsaProxy(target));
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mouseover&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			// if element has an href or src attribute
			if (target.href || target.src)
				writeLog_UsaProxy("mouseover" + generateEventString_UsaProxy(target));
		}
	}
}

/** Processes mouse release event.
   Logs mousedown event together with the mouse button type (if middle or
   right button), and the available event target properties.
   Since click might have occured also outside of form fields, images, or, hyperlinks,
   the mouse pointer position is recorded relative to the hovered-over area/element. */
function processMousedown_UsaProxy(e) {

	/* check if text was selected, if true, discontinue, 
	   since this is handled by processSelection_UsaProxy */
	if(processSelection_UsaProxy()) return;
	
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
		writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target));
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
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("mousedown&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
	
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
	
	// if select list, log the selected entry's value
	if (target.type=="select-multiple") {
		var value = "";
		// check which entries were selected
		for (var i = 0; i < target.options.length; i++)
			if (target.options[ i ].selected) value = value + target.options[ i ].value;
		// log entries
		if (target.id) {
			writeLog_UsaProxy("change&type=select-multiple&id=" + target.id
						+ generateEventString_UsaProxy(target) + "&value=" + escape(value));
		} else { if (target.name)
					writeLog_UsaProxy("change&type=select-multiple&name=" + target.name
						+ generateEventString_UsaProxy(target) + "&value=" + escape(value)) ;
		}
		//saveLog_UsaProxy();
	}
	
	// if dropdown menu, log the selected entry's value
	else if (target.type=="select-one") { 
		if (target.id) {
			writeLog_UsaProxy("change&type=select-one&id=" + target.id + generateEventString_UsaProxy(target) + "&value="
					+ escape(target.options[target.selectedIndex].value) + "&selected=" + target.selectedIndex);
		} else { if (target.name)
					writeLog_UsaProxy("change&type=select-one&name=" + target.name
							+ generateEventString_UsaProxy(target) + "&value=" 
							+ escape(target.options[target.selectedIndex].value)
							+ "&selected=" + target.selectedIndex);
		}
		//saveLog_UsaProxy();
	}
	
	// if text field/area, file field, log changed value
	else if (target.type=="text" || target.type=="textarea" || target.type=="file") {
		if (target.id) {
			writeLog_UsaProxy("change&type=" + target.type + "&id=" + target.id
							  + generateEventString_UsaProxy(target) + "&value=" + escape(target.value));
		} else { if (target.name)
					writeLog_UsaProxy("change&type=" + target.type + "&name="
							+ target.name + generateEventString_UsaProxy(target) + "&value=" + escape(target.value));
		}
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
		if (target.id) {
			writeLog_UsaProxy("change&type=" + target.type + "&id=" + target.id
							  + "&checked=" + target.checked + generateEventString_UsaProxy(target));
		} else { if (target.name)
					writeLog_UsaProxy("change&type=" + target.type + "&name="
							+ target.name + "&checked=" + target.checked + generateEventString_UsaProxy(target));
		}
		//saveLog_UsaProxy();
	}
	
	// in the case of a password field, log only THAT content was modified
	else if (target.type=="password") {
		if (target.id) {
			writeLog_UsaProxy("change&type=" + target.type + "&id="
							  + target.id + generateEventString_UsaProxy(target));
		} else { if (target.name)
					writeLog_UsaProxy("change&type=" + target.type + "&name="
									  + target.name + generateEventString_UsaProxy(target));
		}
		//saveLog_UsaProxy();
	}
	
	// log that radio button was clicked
	else if (target.type=="radio") {
		// log entries
		if (target.id) {
			writeLog_UsaProxy("change&type=" + target.type + "&id=" + target.id
							  + generateEventString_UsaProxy(target));
		} else { if (target.name)
					writeLog_UsaProxy("change&type=" + target.type + "&name="
							+ target.name + generateEventString_UsaProxy(target));
		}
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
		writeLog_UsaProxy("keypress&key=" + keyName_UsaProxy);
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
					writeLog_UsaProxy("keyPress&key=" + keyName_UsaProxy);	// log key combination
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
					writeLog_UsaProxy("keypress&key=" + keyName_UsaProxy);
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
		writeLog_UsaProxy("keypress&key=" + keyName_UsaProxy);
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
			writeLog_UsaProxy("keypress&key=" + keyName_UsaProxy);
			//saveLog_UsaProxy();
			keyName_UsaProxy = "";
		}
	//}
}

/** Processes blur event */
function processBlur_UsaProxy(e) {

	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	/*var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;*/
	
	var ev 		= (isNotOldIE) ? e : window.event;
	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;
	
	// log all available target attributes
	// if element has an id attribute
	if (target.id) {
		writeLog_UsaProxy("blur&id=" + target.id + generateEventString_UsaProxy(target));
	// if element has a name attribute
	} else {if (target.name) writeLog_UsaProxy("blur&name=" + target.name + generateEventString_UsaProxy(target));
			// all others
			else
				writeLog_UsaProxy("blur" + generateEventString_UsaProxy(target));
	}
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
	
	// log all available target attributes
	// if element has an id attribute
	if (target.id) {
		writeLog_UsaProxy("focus&id=" + target.id + generateEventString_UsaProxy(target));
	// if element has a name attribute
	} else { if (target.name) writeLog_UsaProxy("focus&name=" + target.name + generateEventString_UsaProxy(target));
			// all others
			else
				writeLog_UsaProxy("focus" + generateEventString_UsaProxy(target));
	}
	//saveLog_UsaProxy();
}

/** Processes the selection of text within the web page's content.
 * Function is invoked on mousedown */
function processSelection_UsaProxy() {
		var currentSelection;
		// NS
		if (window.getSelection) currentSelection = window.getSelection();
		// safari, konqueror
		else if (document.getSelection) currentSelection = document.getSelection();
		// IE
		else if (document.selection) currentSelection = document.selection.createRange().text;
		
		// if selection is not empty and new text was selected, log select event
		if(currentSelection != "" && lastSelection_UsaProxy != currentSelection) {
			writeLog_UsaProxy("select&selectedContent=" + escape(currentSelection));
			// set last selected text
			lastSelection_UsaProxy = currentSelection;
			saveLog_UsaProxy();
			return true;
		}
		return false;
}

/* NS: Processes text selection event in textfields/areas.
 * Since NS doesn't capture any selected text in text fields/areas over getSelection,
 * function is invoked on select */
 
 //DEPRECATED
function processSelectionNS_UsaProxy(e) {

	/* get event target
	 * NS: first case (window.Event available); IE: second case (not necessary) */
	/*var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	*/
	
	var ev 		= (isNotOldIE) ? e : window.event;
	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;
	
	// if selection is not empty, log select event with the selected text
	if (target.selectionStart!=target.selectionEnd) {
		writeLog_UsaProxy("select" + generateEventString_UsaProxy(target) + "&text=" + escape(target.value.substring(target.selectionStart,target.selectionEnd)));
		saveLog_UsaProxy();
	}
}

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
	//$(document.body).html()));
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
	
	// log mouseout coordinates and all available target attributes
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mouseout&id=" + target.id + generateEventString_UsaProxy(target));
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mouseout&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			// if element has an href or src attribute
			if (target.href || target.src)
				writeLog_UsaProxy("mouseout" + generateEventString_UsaProxy(target));
		}
	}
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

		writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target));
		return;
	}
	// end mouse button detection 
	
	/* if regular click, log click coordinates relative to the clicked element
	   and all available target properties */
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("mouseup&but=" + mbutton + "&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
	
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
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("contextmenu&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("contextmenu&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("contextmenu&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
}

function processCut_ExtraEvent(e) {
	
	var ev 		= (isNotOldIE) ? e : window.event;
	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;
	var data 	= (isNotOldIE) ? ev.data : ev.data;
	
	
	// if selection is not empty, log select event with the selected text
	if (target.selectionStart!=target.selectionEnd) {
		writeLog_UsaProxy("cut&content=" + escape(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));
		//saveLog_UsaProxy();
	}
}

function processCopy_ExtraEvent(e) {
		
	var ev 		= (isNotOldIE) ? e : window.event;
	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;
	var data 	= (isNotOldIE) ? ev.data : ev.data;
	
	// if selection is not empty, log select event with the selected text
	if (target.selectionStart!=target.selectionEnd) {
		writeLog_UsaProxy("copy&content=" + escape(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));
		//saveLog_UsaProxy();
	}
}

function processPaste_ExtraEvent(e) {
	var ev 		= (isNotOldIE) ? e : window.event;
	var target 	= (isNotOldIE) ? ev.target : ev.srcElement;
	var data 	= (isNotOldIE) ? ev.data : ev.data;
	
	// if selection is not empty, log select event with the selected text
	if (target.selectionStart!=target.selectionEnd) {
		writeLog_UsaProxy("paste&content=" + escape(target.value.substring(target.selectionStart,target.selectionEnd)) + generateEventString_UsaProxy(target));
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
	
	// log middle and right button events, continue if left button was clicked
	if (mbutton!="left") {

		writeLog_UsaProxy("dblclick&coord=" + x + "," + y + "&but=" + mbutton + generateEventString_UsaProxy(target));
		return;
	}

	// end mouse button detection 
	
	/* if regular click, log click coordinates relative to the clicked element
	   and all available target properties */
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("dblclick&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("dblclick&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("dblclick&coord=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
	
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

	keyName_UsaProxy = returnKeyValue(KeyID);
	
	writeLog_UsaProxy("keydown&key=" + keyName_UsaProxy + generateEventString_UsaProxy(target));
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
	
	writeLog_UsaProxy("keypress&key=" + String.fromCharCode(KeyID) + generateEventString_UsaProxy(target));
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

	writeLog_UsaProxy("keyup&key=" + keyName_UsaProxy + generateEventString_UsaProxy(target));
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
	
	// if selection is not empty, log select event with the selected text
	if (target.selectionStart!=target.selectionEnd) {
		writeLog_UsaProxy("select_Extra" + generateEventString_UsaProxy(target) + "&selectedContent=" + escape(target.value.substring(target.selectionStart,target.selectionEnd)));
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
 * Adding the browser's name to the event
 * 
 * 
 */
  function appendBrowserName(text){
	  
	if (browserName=="undefined"){
		inferBrowserInfo();
	}
	
	return text + "&browser=" + browserName;
  }

//////////////CODE FOR GETTING BROWSER INFORMATION
//code obtained from http://www.javascripter.net/faq/browsern.htm

var nVer, nAgt, browserName, fullVersion, majorVersion, nameOffset, verOffset, ix;


function inferBrowserInfo(){
	nVer = navigator.appVersion;
	nAgt = navigator.userAgent;
	browserName  = navigator.appName;
	fullVersion  = ''+parseFloat(navigator.appVersion); 
	majorVersion = parseInt(navigator.appVersion,10);
	nameOffset,verOffset,ix;
	
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
 * 
 */

function pausecomp(ms) {
	ms += new Date().getTime();
	while (new Date() < ms){}
}


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
			return unescape(y);
		}
	}
	
	//we didn't find the cookie, so we return null
	return "null";
}

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	
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
			return unescape(y);
		}*/
	}
	
	//alert(document.cookie);
}

/**
 * This function will check if the cookie is available, if not it shows a disclaimer with a button
 * when that button is pressed, a new session ID is created and stored in a cookie
 * 
 */ 
function askForCookiePermission(){
		
	//If we can get the Session ID from the cookie, we finish
	if (getSessionFromCookie()){
		return true;
	}
	
	//if not, we show the disclaimer
	//alert("showing cookie disclaimer");
	
//	htmlDivContent = "<div style=\"text-align:center;border: 1px solid black;background-color:silver\">	<h3>This site uses cookies with the sole purpose of remembering that you visited this site. They are completely anonymous and help us improve the usability of this site</h3><button  align=\"center\">I don't want to use cookies</button></div>"
	
	var htmlDivContent = document.createElement("div");
	
	htmlDivContent.id = "proxyCookieDiscalimer";
	htmlDivContent.style.backgroundColor = "silver";
	htmlDivContent.style.border = "1px solid black";
	
	//htmlDivContent.style.height="50px"
	//htmlDivContent.style.width="500px"
	
	//htmlDivContent.style.border.style="";
	//htmlDivContent.style.border.color="";
	htmlDivContent.style.textAlign = "center";
	htmlDivContent.style.margin = "0px auto 0px auto";
	htmlDivContent.style.position = "static";
	
	
	var headerNode = document.createElement("h2");
	headerNode.style.textAlign = "center";

	var headerText = document.createTextNode("Cookies in this website");
	headerNode.appendChild(headerText);
	
	//headerNode.style.float = "left";
	//headerNode.style.textAlign = "right";
	
	htmlDivContent.appendChild(headerNode);

	
	
	var textNode = document.createElement("p");
	textNode.style.textAlign = "center";


	var disclaimerText = document.createTextNode("This site uses cookies with the sole purpose of remembering that you visited this site. They are completely anonymous and help us improve the usability of this site");
	textNode.appendChild(disclaimerText);
	htmlDivContent.appendChild(textNode);
	
	var htmlButton = document.createElement("button");
	
	htmlButton.onclick=handleCookieButton;
	
	var buttonText = document.createTextNode("I don't mind using cookies");
	htmlButton.appendChild(buttonText);
	
	htmlDivContent.appendChild(htmlButton);
	
	//document.getElementsByTagName('body')[0].appendChild(htmlDivContent);
	
	
	//document.insertBefore(htmlDivContent, document.getElementsByTagName('html')[0]);
	
	if (document.body.firstChild){
      	document.body.insertBefore(htmlDivContent, document.body.firstChild);
		console.log("inserting before");
	} else {
      	document.body.appendChild(htmlDivContent);
      	console.log("appending before");
	}
	
	
	///Changing CSS style
	//document.getElementsByTagName('div')
	/*divArray = document.body.getElementsByTagName('div');
	alert( divArray.length);
	for (var i = divArray.length-1; i >= 0; i--) {
		divArray[i].style.marginTop = "100px";
	} */

	//document.body.style.marginTop = "50px";
	
	//htmlDivContent.style.marginTop = "0px";
}

/**
 * If the user clicks, then we generate the ID, set the cookie and store the ID
 * 
 */ 
function handleCookieButton(){
	//console.log("getSessionFromCookie");
	setCookie("proxyUserID", sessionID_Proxy, cookieLife);
	sessionID = getCookie("proxyUserID");
	//document.getElementById("proxyCookieDiscalimer").style.visibility = "hidden";
	var div = document.getElementById("proxyCookieDiscalimer");
	div.parentNode.removeChild(div);
    
	init_UsaProxy();
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
	
//DEBUG PURPOSES REMEMBER TO DELETE IT!!!

/*DEBUG CODE START
	if (document.cookie.length > 0){
		alert(document.cookie.split(';').length);
		alert(document.cookie);
	}
	else
		alert("No cookies were found");
			
	return false;
DEBUG CODE END*/
	
	//We check if there are cookies in the Web page
	if (document.cookie.length > 0)
	{
		
		sessionID = getCookie("proxyUserID");
		
		if (sessionID == "null")
		{
			//We don't have our cookie deployed, but there were other cookies, so we should be able to create one
			setCookie("proxyUserID", sessionID_Proxy, cookieLife);
			sessionID = getCookie("proxyUserID");
			//document.getElementById("proxyCookieDiscalimer").style.visibility = "hidden";
		}
		init_UsaProxy();
		return true;
	}
	else
		sessionID = null;
		return false;
}
      
      
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////



/////////////////KUPB BROWSER EVENT COLLECTION////////////////////////////
/////THEY WERE DELETED BUT SOME POSSIBLY USEFUL FUNCTIONS ARE REMAINING///
//////////////////////////////////////////////////////////////////////////

//This function consider if the element's colour has been defined to transparent in order to omit it.
//I had to fix the code as it was using "jqueryElement.css("background-color");" type of functions instead of "$(jqueryElement).css("
//The first function also returns information about the "colour parent" that is responsible for the colour change of the element

//Source:http://stackoverflow.com/questions/4259815/how-do-i-detect-the-inherited-background-color-of-an-element-using-jquery-js
function getBackgroundColourWithColourParent(jqueryElement) {
    // Is current element's background color set?
    var color = $(jqueryElement).css("background-color");
    
    if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {
        // if so then return that color
        return (jqueryElement.html() + "," + jqueryElement.textContent+":" + color);
    }

    // if not: are you at the body element?
    if ($(jqueryElement).is("body")) {
        // return known 'false' value
        return false;
    } else {
        // call getBackground with parent item
        return getBackgroundColourWithColourParent($(jqueryElement).parent());
    }
}

function getBackgroundColour(jqueryElement) {
    // Is current element's background color set?
    var color = $(jqueryElement).css("background-color");
    
    if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {
        // if so then return that color
        return (color);
    }

    // if not: are you at the body element?
    if ($(jqueryElement).is("body")) {
        // return known 'false' value
        return false;
    } else {
        // call getBackground with parent item
        return getBackgroundColour($(jqueryElement).parent());
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

////////////////////USEFUL FUNCTIONS FOR DEBUGGING
//It's pretty useful to put calls to specific nodes in the mousedown function,
//when the right or middle button gets activated

//Function that prints all CSS values of an element
	
	/*var computedStyle = window.getComputedStyle(node);
	var stringedStyle = "";
	
	//looping through the vector we get the value names
	for (i=0; i<computedStyle.length; i++) {
		
		var cssValue = $(node).css(computedStyle[i]);//jQuery will get us the value of those fields
		stringedStyle+= computedStyle[i] + ":" + cssValue +"||||\n";
	}
	
	alert(stringedStyle);
*/




////This function will be called when DOM is ready, we will include all events that we want to handle with jQuery to maximize compatibility
//function jQueryListeners(){
	//$(document).ready(function(){
		//alert("registering jQuery events");
		//$(document).mousemove(function(ev){
			//alert("mousemoved");
			//$('#status').html(e.pageX +', '+ e.pageY);
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
//if(document.attachEvent) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//if(document.addEventListener) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//$("element-root").bind(DOMSubtreeModified,"domChangeListener");
