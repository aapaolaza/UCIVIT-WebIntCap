/**CHANGES!!! This is not the original proxyscript, it was modified to allow developers to copypaste a script initialitation instead of a proxy approach. All the changes are tagged "CHANGE"**/

//CHANGE!! I added jquery to use certain interesting functions
//<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" type="text/javascript"></script>

//I need this variable to be global, it's the original alert value that is changed in order to use it as a listener for advanced search
var _old_alert;


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
var startDate_UsaProxy;			/* Date: Initialised by UsaProxy. Load completion timestamp is  
								   calculated relative to this timestamp */
var loadDate_UsaProxy;			// Date: Initialised on load. All further timestamps are calculated
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

/* Initializes all variables, event handlers, and interval functions and
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
	lastScrollPosY_UsaProxy 	= (window.Event) ? window.pageYOffset : document.body.scrollTop;
	lastScrollPosX_UsaProxy 	= (window.Event) ? window.pageXOffset : document.body.scrollLeft;
	
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
	set_date_UsaProxy();
	startDate_UsaProxy=date_UsaProxy(window.usaProxyDate);
		
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
	if(window.Event) {
		document.captureEvents(Event.CHANGE | Event.MOUSEUP | Event.KEYPRESS | Event.KEYDOWN | Event.KEYUP | Event.MOUSEMOVE | Event.MOUSEOVER | Event.FOCUS | Event.BLUR | Event.SELECT
				| Event.DBCLICK | Event.DRAGDROP | Event.ERROR | Event.KEYUP | Event.MOUSEOUT | Event.MOUSEUP | Event.SELECT | Event.UNLOAD
				| Event.CONTEXTMENU | Event.CUT | Event.COPY | Event.PASTE | Event.HASHCHANGE | Event.MOUSEWHEEL
		);
		//We add the extra events

		window.captureEvents(Event.RESIZE);
	}
	
	/* attach event handlers to avoid overwriting
	 * IE: attachEvent
	 * NS: addEventListener */
	 
	// IE
	if(document.attachEvent) { 
	
		document.attachEvent('onmousedown', processMousedown_UsaProxy);
		document.attachEvent('onkeypress', processKeypress_UsaProxy);
		document.attachEvent('onkeydown', processKeydown_UsaProxy);
		document.attachEvent('onkeyup', processKeyup_UsaProxy);
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
		document.attachEvent('onkeyup', processKeyUp_ExtraEvent);
		document.attachEvent('onmousewheel', processMousewheel_ExtraEvent);
		document.attachEvent('onselect', processSelect_ExtraEvent);
		document.attachEvent('onunload', processUnload_ExtraEvent);
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
						document.forms[i].elements[j].attachEvent('onblur', processBlur_UsaProxy);
						document.forms[i].elements[j].attachEvent('onfocus', processFocus_UsaProxy);
					}
				}
			}
		}
	}
	
	// NS
	if(document.addEventListener) {
		document.addEventListener('mousedown', processMousedown_UsaProxy, false);
		document.addEventListener('keypress', processKeypress_UsaProxy, false);
		document.addEventListener('keydown', processKeydown_UsaProxy, false);
		document.addEventListener('keyup', processKeyup_UsaProxy, false);
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
		document.addEventListener('keyup', processKeyUp_ExtraEvent, false);
		document.addEventListener('mousewheel', processMousewheel_ExtraEvent, false);
		document.addEventListener('select', processSelect_ExtraEvent, false);
		document.addEventListener('unload', processUnload_ExtraEvent, false);
		
	
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
						document.forms[i].elements[j].addEventListener('blur', processBlur_UsaProxy, false);
						document.forms[i].elements[j].addEventListener('focus', processFocus_UsaProxy, false);
					}
				}
			}
		}
	}
	
	/* instantiate scroll check and save function being invoked periodically */
	IVL_scrollCheck_UsaProxy 	= window.setInterval("processScroll_UsaProxy()",1000);
	IVL_saveLog_UsaProxy 		= window.setInterval("saveLog_UsaProxy()",3000);
}

/* Invoke init_UsaProxy on load */
if(document.attachEvent) window.attachEvent('onload', init_UsaProxy);
if(document.addEventListener) window.addEventListener('load', init_UsaProxy, false);

/*I have to imitate these events to add the jQuery function*/
if(document.attachEvent) window.attachEvent('onload', includeJquery);
else if (document.addEventListener) window.addEventListener('load', includeJquery, false);


/*document.addEventListener("DOMSubtreeModified", function() {
    alert("DOMSubtreeModified fired!");
}, false);*/
//if(document.attachEvent) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//if(document.addEventListener) $("element-root").bind(DOMSubtreeModified,"domChangeListener");
//$("element-root").bind(DOMSubtreeModified,"domChangeListener");


//CHANGE: function added to calculate the date
function set_date_UsaProxy(){
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
		  
	//Server configuration parameters
	window.usaProxyDate=cYear+"-"+cMonth+"-"+cDate+","+cHour+":"+cMin+":"+cSec;
}


// Returns a Date object computed from a given datestamp string
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

/* Returns a timestamp string of the form "2004-12-31,23:59:59".
 * Takes UsaProxy's httptraffic log entry time as start time and adds
 * the difference between load time and current time */
 
 //CHANGE: now it returns the date with milliseconds
function datestamp_UsaProxy() {
	if (loadDate_UsaProxy==null) loadDate_UsaProxy = new Date();
	var currentDate 	= new Date();
	// get milliseconds from load time
	var diffSecs 		= Math.abs(currentDate.getTime() - loadDate_UsaProxy.getTime());
	// return new Date object according to UsaProxy start time + diffMSecs
	var currentUPDate 	= new Date(startDate_UsaProxy.getTime() + diffSecs);

	return currentUPDate.getFullYear() + "-" + completeDateVals(currentUPDate.getMonth()) + "-"
	  + completeDateVals(currentUPDate.getDate()) + "," + completeDateVals(currentUPDate.getHours())
	  + ":" + completeDateVals(currentUPDate.getMinutes())
	  + ":" + completeDateVals(currentUPDate.getSeconds())
	  + ":" + completeDateVals(currentUPDate.getMilliseconds());
}

/** Completes single-digit numbers by a "0"-prefix */
function completeDateVals(dateVal) {
	var dateVal = "" + dateVal;
	if (dateVal.length<2) return "0" + dateVal;
	else return dateVal;
}

/** Completes single-digit numbers by a "0"-prefix
 * This is a special case for milliseconds, in which we will add up to two zeros */
function completeDateValsMilliseconds(dateVal) {
	var dateVal = "" + dateVal;
	if (dateVal.length<2) return "00" + dateVal;
	if (dateVal.length<3) return "0" + dateVal;
	else return dateVal;
}
  
/* Appends an event log entry together with the httptrafficindex referencing this page,
   the client's session ID,
 * and the current timestamp to logVal_UsaProxy */
function writeLog_UsaProxy(text) {
	// if function is already being executed, defer writeLog_UsaProxy for 50ms
	////DEBUG TEST
	
	
	if(FLG_writingLogVal_UsaProxy) {
		window.setTimeout("writeLog_UsaProxy(" + text + ")",50);
		console.log("writeLog was deferred, its content were: " + text.substring(0,20));
		return false;}
	
	console.log("The following event will be written, its content are: " + text.substring(0,20));
	
		//CHANGE! added additional parameters after "text"
	
	var url=window.location.href;
	url=url.replace("#","");
	
	// generate and append log entry
	var logline;
	logLine = "&time=" + datestamp_UsaProxy() + "&sd=" + serverdataId_UsaProxy + "&sid="
	+ sessionID_UsaProxy + "&event=" + text+ "&url=" + url;
	
	// set synchronization flag (block function)
	FLG_writingLogVal_UsaProxy = true;
	logVal_UsaProxy = logVal_UsaProxy + logLine + "&xX"; // Add logLine to interaction log
	// reset synchronization flag (release function)
	FLG_writingLogVal_UsaProxy = false;
}

//CHANGE!!! now this function returns textContent as well, it will be useful!!
/* Returns all available node information such as the DOM path, an image name, href, etc. */
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

	eventString = eventString + "&nodeType=" + node.tagName + "&textContent=" + encodeURIComponent(textContent) + "&textValue=" + encodeURIComponent(node.value);
		
	return eventString;
}

/* Returns file name of a URL/path */
function getFileName(path /*string*/) {
	if(path.lastIndexOf("/")>-1)
		return path.substring(path.lastIndexOf("/")+1);
	else return path;
}

/***** AJAX code.
	   Used with each logging request  */

var xmlreqs_UsaProxy = new Array();	/** contains the currently used XMLHttpRequest objects */

/* Creates a new XMLHttpRequest object with a freed parameter 
   which indicates whether the object is currently operating 
   (e.g. expecting a UsaProxy response) */
function OBJ_XHR_UsaProxy(freed /*number*/){
	this.freed = freed;
	this.newReq = false;
	// NS
	if(window.XMLHttpRequest) {
	  	try { this.newReq = new XMLHttpRequest(); }
	  	catch(e) { this.newReq = false; }
	}
	// IE
	else if(window.ActiveXObject) {
	  try { this.newReq = new ActiveXObject("Microsoft.XMLHTTP"); }
	  catch(e) {
		try { this.newReq = new ActiveXObject("Msxml2.XMLHTTP"); }
		catch(e) {
		  this.newReq = false;
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

/* Processes load event (logs load event together with the page size) */
function processLoad_UsaProxy(e) {
	/* get size
	 * NS: first case (window.innerWidth/innerHeight available); IE: second case */
	var loadWidth, loadHeight;
	loadWidth 	= (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;  // innerWidth=NS
	loadHeight 	= (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;  // innerHeight=NS
	writeLog_UsaProxy("load&size=" + loadWidth + "x" + loadHeight);
	//saveLog_UsaProxy();
}

/* Processes window resize event (logs resize event together with the page size) */
function processResize_UsaProxy(e) {
	/* get size
	 * NS: first case (window.innerWidth/innerHeight available); IE: second case */
	var newWidth, newHeight;
	newWidth 	= (window.innerWidth) ? window.innerWidth : document.body.offsetWidth;  // innerWidth=NS
	newHeight 	= (window.innerHeight) ? window.innerHeight : document.body.offsetHeight;  // innerHeight=NS
	writeLog_UsaProxy("resize&size=" + newWidth + "x" + newHeight);
	//saveLog_UsaProxy();
}

/* Processes mousemove event if FLG_LogMousemove_UsaProxy isn't set 
   (FLG_LogMousemove_UsaProxy defers the next mousemove logging action
   for 150 ms) */
function processMousemove_UsaProxy(e) {
	
	/* get event target, x, and y value of mouse position
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	// if log mousemove flag is false, set it true and log a mousemove event
	if (!FLG_LogMousemove_UsaProxy
		/** if mouse pointer actually moved */
		&& !(x==lastMousePosX_UsaProxy && y==lastMousePosY_UsaProxy) ) {
			FLG_LogMousemove_UsaProxy = true;
			lastMousePosX_UsaProxy = x;
			lastMousePosY_UsaProxy = y;
			
			writeLog_UsaProxy("mousemove&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
			//saveLog_UsaProxy();
			window.setTimeout('setInaktiv_UsaProxy()',150);
	}
}

/* Resets the log mousemove blocking flag so that the next 
   mousemove event may be logged */
function setInaktiv_UsaProxy() {
	FLG_LogMousemove_UsaProxy = false;
}

/* Processes mouseover event.
 * logs mouseover events on all elements which have either an
 * id, name, href, or src property (logging more would cause a log overload).
   In addition it applies the appropriate direct event listeners to form elements */  
function processMouseover_UsaProxy(e) {
	
	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev = (window.Event) ? e : window.event;
	var target = (window.Event) ? ev.target : ev.srcElement;
	
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
				 if (target.type=="text" 
		 		  || target.type=="textarea" ) {
				 	// select listener: only for NS
					target.removeEventListener('select', processSelectionNS_UsaProxy, false);
				 	target.addEventListener('select', processSelectionNS_UsaProxy, false);
				 }
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

/* no mouseout event since with regular user tracking not necessary */

/* Processes mouse release event.
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
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
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

		////DEBUG START
			//alert("TEST");
			recordCurrentDOM();
		////DEBUG END
		writeLog_UsaProxy("mousedown&but=" + mbutton + generateEventString_UsaProxy(target));
		//saveLog_UsaProxy();
		return;
	}
	/* end mouse button detection */
	
	// dropdown selection event is handled by function processChange_UsaProxy
	if(target.nodeName=="OPTION" || target.nodeName=="option") return; // do nothing
	if(target.nodeName=="SELECT" || target.nodeName=="select") return; // do nothing
	
	// radio button selection event is handled by function processChange_UsaProxy
	if(target.type && (target.type == "radio")) {
		return;
	}
	
	/* if regular click, log click coordinates relative to the clicked element
	   and all available target properties */
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
	
	//saveLog_UsaProxy();
}

/* no mouseup event since with regular user tracking not necessary */

/* Processes change event in select lists, input fields, textareas.
   Logs change event together with the corresponding field type, and
   a couple of field content properties such as the new field value. */
function processChange_UsaProxy(e) {
	
	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
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

/* Processes scrolling of the page.
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
	
		writeLog_UsaProxy("scroll&y=" + percentOfHeight);
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
	
		writeLog_UsaProxy("scroll&x=" + percentOfWidth);
		// set last scrollbar position
		lastScrollPosX_UsaProxy = currentScrollPosX;
		//saveLog_UsaProxy();
	}
}


/* Detects key combinations: first part - key down
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

/* Processes the release of key combinations: second part - key up/released
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

/* Logs all regular single key presses. are logged
 * If keyPress flag is enabled (in case no control key is clicked at the same time)
 * the keyPress event returns for regular char keys the correct small case key code. */
function processKeypress_UsaProxy(e) {
	if(FLG_keyPress_UsaProxy) {
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
	}
}

/* Processes blur event */
function processBlur_UsaProxy(e) {

	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
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

/* Processes focus event */
function processFocus_UsaProxy(e) {

	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
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

/* Processes the selection of text within the web page's content.
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
			writeLog_UsaProxy("select&text=" + escape(currentSelection));
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
function processSelectionNS_UsaProxy(e) {

	/* get event target
	 * NS: first case (window.Event available); IE: second case (not necessary) */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
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

/* Optional: returns a hex representation of DOM path
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

/* Computes the element's offset from the left edge
   of the browser window */
function absLeft(element) {
	if (element.pageX) return element.pageX;
	else
    	return (element.offsetParent)? 
     	element.offsetLeft + absLeft(element.offsetParent) : element.offsetLeft;
  }

/* Computes the element's offset from the top edge
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
	var ev = (window.Event) ? e : window.event;
	var target = (window.Event) ? ev.target : ev.srcElement;
	
	// log mouseout coordinates and all available target attributes
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mouseoout&id=" + target.id + generateEventString_UsaProxy(target));
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mouseoout&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			// if element has an href or src attribute
			if (target.href || target.src)
				writeLog_UsaProxy("mouseoout" + generateEventString_UsaProxy(target));
		}
	}
}


function processMouseup_ExtraEvent(e) {
	
	//alert("mouseUP event");
	
/* get event target, x, and y value of mouse position
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
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

		writeLog_UsaProxy("mousedown&but=" + mbutton + generateEventString_UsaProxy(target));
		return;
	}
	// end mouse button detection 
	
	/* if regular click, log click coordinates relative to the clicked element
	   and all available target properties */
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("mousedown&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
}

function processContextMenu_ExtraEvent(e) {
	
/* get event target, x, and y value of mouse position
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	// if element has an id attribute
	if (target.id) 	writeLog_UsaProxy("oncontextmenu&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
	else {
		// if element has a name attribute
		if(target.name) writeLog_UsaProxy("oncontextmenu&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
		else {
			writeLog_UsaProxy("oncontextmenu&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
		}
	}
}

function processCut_ExtraEvent(e) {
	writeLog_UsaProxy("cut");
}

function processCopy_ExtraEvent(e) {
	writeLog_UsaProxy("copy");
}

function processPaste_ExtraEvent(e) {
	writeLog_UsaProxy("paste");
}

function processDblClick_ExtraEvent(e) {
	writeLog_UsaProxy("ondblclick");
}

function processError_ExtraEvent(e) {
	writeLog_UsaProxy("javascripterror");
}

function processhashChange_ExtraEvent(e) {
	writeLog_UsaProxy("hashChange");
}

function processKeyUp_ExtraEvent(e) {
	writeLog_UsaProxy("KeyUp");
}

function processMousewheel_ExtraEvent(e) {
	writeLog_UsaProxy("mousewheel");
}

function processSelect_ExtraEvent(e) {
	writeLog_UsaProxy("Select");
}
		
function processUnload_ExtraEvent(e) {
	writeLog_UsaProxy("Unload");
}
		
		
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
