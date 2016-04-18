/* <![CDATA[ */

/** Core UsaProxy JavaScript part.
	This proxyscript.js is used for shared browsing and remote monitoring.
	User activity is tracked and logged. In the other browser it is reconstructed. */

/* proposal management functions and fields
 * added on-the-fly by UsaProxy when this JavaScript is delivered 
 * dependend from sharing mode */
 
/* propose management functions and fields
 * added on-the-fly by UsaProxy when this JavaScript is delivered
 * dependend from sharing mode */

/* fields added on-the-fly by UsaProxy when this JavaScript is delivered */
// var onlineUser_UsaProxy;		// String: status of user ("online": in a shared session or "offline")
// var partnerSID_UsaProxy;		// String: collaborator of user in a shared session
// var lastLogEntry_UsaProxy;	// Integer: holds the last fetched event index
// var FLG_RemoteMonitoring;	// Boolean: true if remote monitoring mode is enabled (and shared browsing disabled)
// var remoteMonitorer;			// String: "true" if user is the monitoring party in a shared
								// session, "false" if not, "undefined" if shared browsing mode
// FLG_isAdmin_UsaProxy;		// Boolean: in remote monitoring true if user is registered 
								// as remote support assistant
// var FLG_WindowNameSet_UsaProxy;// Boolean: true if shared window was defined in an earlier execution of the JavaScript

/* local event tracking fields */

var logVal_UsaProxy;			// String: Initialised when page loads. Contains entire log of actions
var FLG_writingLogVal_UsaProxy; // Boolean: flag: if set, writing log entry to logVal_UsaProxy not possible	

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
var lastMousePosY_UsaProxy;		// Integer: last x position of the mouse pointer	
var lastMousePosX_UsaProxy;		// Integer: last y position of the mouse pointer

var IVL_scrollCheck_UsaProxy;	// Interval function variable for processScroll_UsaProxy()
var lastScrollPosY_UsaProxy;	// Integer: last position of vertical scrollbar resp. top offset of document
var lastScrollPosX_UsaProxy;	// Integer: last position of vhorozontal scrollbar resp. left offset of document

/** fetching of remote events and data */

var IVL_getEvents_UsaProxy;		// Interval variable: timer for poll function getEvents_UsaProxy()
var IVL_getStatus_UsaProxy;		// Interval variable: timer for poll function getStatus_UsaProxy()
								  
var FLG_isSharedSessionWindow;	// Boolean: true if this window is shared session window

/* remote event representation fields */

var remoteAppendPoint;			// DOM element to which remote viz objects are appended
/* remote mouse variables */
var DIV_remoteMouse_UsaProxy;	// Div: contains remote mouse pointer
var IMG_remoteMouseCursorPointer; 	// Image: holds default remote mouse pointer image
var IMG_remoteMouseCursorHand;	// Image: holds remote mouse hand image for mouse over events

var UsaProxy_divs = new Array();/** Array: containing all divs produced by this JavaScript
								  * any events triggered on these divs resp. their childNodes
								  * won't be logged */
								  
/* checks for the current browser window/tab, if it is the shared session window,
 * initializes all variables and calls startLogging() in case the user
 * participates in a shared session
 */
function init_UsaProxy() {

	// check if a shared session window already exists
	if (window.FLG_WindowNameSet_UsaProxy) {
		if (window.name=="sharedsession_UsaProxy")
			FLG_isSharedSessionWindow = true;
		else
			FLG_isSharedSessionWindow = false;
	// else assign name to window and set this window the shared session window
	} else {
		window.name = "sharedsession_UsaProxy";
		FLG_isSharedSessionWindow = true;
		xmlreqGET_UsaProxy("/usaproxylolo/setwindownameset?sid=" + sessionID_UsaProxy, "");
	}

	/* all tracking, logging and steering
	   only occurs in the shared session window ! */
	if (FLG_isSharedSessionWindow) {
	
		/** call panel init() */
		if(window.remoteMonitoringPage_UsaProxy || window.sharedBrowsingPage_UsaProxy)
			init();
		
		// check status at UsaProxy
		getStatus_UsaProxy();
		
		/* local event logging */
		logVal_UsaProxy = "";
		aktiv_UsaProxy = false;
		FLG_writingLogVal_UsaProxy = false;
		
		FLG_LogMousemove_UsaProxy 	= false;
		lastMousePosX_UsaProxy 		= 0;
		lastMousePosY_UsaProxy 		= 0;
		
		/* initialize lastScrollPos_UsaProxy with current top/left offset */
		lastScrollPosY_UsaProxy 	= (window.Event) ? window.pageYOffset : document.body.scrollTop;
		lastScrollPosX_UsaProxy 	= (window.Event) ? window.pageXOffset : document.body.scrollLeft;
		
		/* retrieve proxyscipt src URL parameters */
		var par_start			= document.getElementById("proxyScript_UsaProxy").src.indexOf("?");
		var pars_UsaProxy   	= document.getElementById("proxyScript_UsaProxy").src.substring(par_start);
		/* retrieve current serverdata ID which is specified in parameter sd */
		par_start				= 4;
		var par_end				= pars_UsaProxy.indexOf("&");
		serverdataId_UsaProxy	= pars_UsaProxy.substring(par_start, par_end);
		/* initialize start date specified in proxyscript-parameter ts */
		par_start				= pars_UsaProxy.indexOf("&ts=") + 4;
		var par_end				= pars_UsaProxy.indexOf("&", par_start);
		if (par_end==-1) par_end = pars_UsaProxy.length;
		startDate_UsaProxy		= date_UsaProxy(pars_UsaProxy.substring(par_start, par_end));
		/* initialize UsaProxy id specified in proxyscript-parameter id */
		par_start				= pars_UsaProxy.indexOf("&id=") + 4;
		var par_end				= pars_UsaProxy.indexOf("&", par_start);
		if (par_end==-1) par_end = pars_UsaProxy.length;
		id_UsaProxy				= pars_UsaProxy.substring(par_start, par_end);
		
		// body tag as append point for remote viz objects
		remoteAppendPoint 		= document.getElementsByTagName("body")[0];
		
		// if user takes part in shared browsing (is online)
		if (onlineUser_UsaProxy=="online") {
			startLogging_UsaProxy(true);
			getEvents_UsaProxy();
		}
		// poll UsaProxy for shared browsing proposals if user is offline
		if (onlineUser_UsaProxy=="offline") {
			/**.. and if user is Remote Monitorer being on Remote Monitoring page
				 and being admin or Remote Monitoring disabled */
			if ((FLG_RemoteMonitoring && window.remoteMonitoringPage_UsaProxy && FLG_isAdmin_UsaProxy)
					|| !FLG_RemoteMonitoring) {
				getProposals_UsaProxy();
			}
		}
		
		/** if Live Support Button available, add mousedown listener */
		if (document.getElementById("proposebut"))
			/** attach mousedown event listener to button
			  * "propose a shared browse" (if shared browsing mode && shared browsing page)
			  * resp. "Live Support" (if remote monitoring mode && not shared browsing page) */
			if ((!FLG_RemoteMonitoring && window.sharedBrowsingPage_UsaProxy)
				|| (FLG_RemoteMonitoring && !window.sharedBrowsingPage_UsaProxy))
				document.getElementById("proposebut").onmousedown = propose_UsaProxy;
		
		// initialize dragging
		OBJ_drag.init();
	}
	
}

/** Creates remote event visualization elements such as the remote mouse pointer.
  * Starts polling UsaProxy for remote events
  * and attaches event listeners for local user activity tracking. 
    Depending on the specified boolean parameter, a load event is either logged or not.*/
function startLogging_UsaProxy(invokedOnLoad /*boolean*/) {

	/* create remote event visualization objects
	   if Remote Monitoring mode only on the monitorers side */
	
	if ((FLG_RemoteMonitoring && remoteMonitorer=="true") || !FLG_RemoteMonitoring) {
	
		/* create remote mouse cursor */
		DIV_remoteMouse_UsaProxy 				= document.createElement("div");
		DIV_remoteMouse_UsaProxy.id 			= "remoteMouse_UsaProxy";
		DIV_remoteMouse_UsaProxy.style.width 	= "17px";		// width of mouse image
		DIV_remoteMouse_UsaProxy.style.height 	= "22px";		// height of mouse image
		DIV_remoteMouse_UsaProxy.style.position = "absolute";
		DIV_remoteMouse_UsaProxy.style.top 		= "0px";
		DIV_remoteMouse_UsaProxy.style.left 	= "0px";
		DIV_remoteMouse_UsaProxy.style.zIndex	= "31999";
		
		// append remote mouse layer
		remoteAppendPoint.appendChild(DIV_remoteMouse_UsaProxy);
		
		/** append remote mouse layer to the Array of non-loggable elements */
		UsaProxy_divs.push("remoteMouse_UsaProxy");
		
		// instantiate regular remote cursor and hand cursor image for switching
		IMG_remoteMouseCursorPointer			= new Image();
		IMG_remoteMouseCursorPointer.src 		= "/usaproxylolo/file/remoteMouse.gif";
		IMG_remoteMouseCursorHand				= new Image();
		IMG_remoteMouseCursorHand.src 			= "/usaproxylolo/file/remoteMouseHand.gif";
		
		// instantiate remote mouse image
		IMG_remoteMouseCursor					= new Image();
		IMG_remoteMouseCursor.src				= "/usaproxylolo/file/remoteMouse.gif"
		IMG_remoteMouseCursor.id				= "remoteMouseCursor_UsaProxy";
		// append mouse image to remote mouse layer
		DIV_remoteMouse_UsaProxy.appendChild(IMG_remoteMouseCursor);
	}
	
	/** if Remote Monitoring mode only on the monitored user's side */
	if ((FLG_RemoteMonitoring && remoteMonitorer=="false") || !FLG_RemoteMonitoring) {
	
		// log load event if new document (not a copy) was loaded
		if(document.URL.indexOf("usaproxyload")==-1 && invokedOnLoad) {
			/** framecheck: if page is frame, no load event is triggered */
			if (parent==this) processLoad_UsaProxy();
		}
		
		// event capturing
		
		// NS explicit event capturing
		if(window.Event) {
			document.captureEvents(Event.MOUSEMOVE | Event.MOUSEOVER | Event.MOUSEOUT | Event.MOUSEDOWN | Event.MOUSEUP | Event.CHANGE);
		}
		
		// IE
		if(document.attachEvent) { 
			document.attachEvent('onmousemove', processMousemove_UsaProxy);
			document.attachEvent('onmouseover', processMouseover_UsaProxy);
			document.attachEvent('onmouseout', processMouseout_UsaProxy);
			/* change Handler for each relevant element
			 * dropdowns, lists, text fields/areas, file fields, password fields, and checkboxes*/
			for (var i = 0; i < document.forms.length; ++i) {
				for (var j = 0; j < document.forms[i].elements.length; ++j) {
					if(document.forms[i].elements[j].type) {
						var elType = document.forms[i].elements[j].type;
						if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {
							document.forms[i].elements[j].attachEvent('onchange', processChange_UsaProxy);
						}
					}
				}
			}
			document.attachEvent('onmousedown', processMousedown_UsaProxy);
			document.attachEvent('onmouseup', processMouseup_UsaProxy);
		}
		
		// NS
		if(document.addEventListener) {
			document.addEventListener('mousemove', processMousemove_UsaProxy, false);
			document.addEventListener('mouseover', processMouseover_UsaProxy, false);
			document.addEventListener('mouseout', processMouseout_UsaProxy, false);
			for (var i = 0; i < document.forms.length; ++i) {
				for (var j = 0; j < document.forms[i].elements.length; ++j) {
					if(document.forms[i].elements[j].type) {
						var elType = document.forms[i].elements[j].type;
						if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {
							document.forms[i].elements[j].addEventListener('change', processChange_UsaProxy, false);
						}
					}
				}
			}
			document.addEventListener('mousedown', processMousedown_UsaProxy, false);
			document.addEventListener('mouseup', processMouseup_UsaProxy, false);
		}
		
		/* instantiate scroll check and save function being invoked periodically */
		IVL_saveLog_UsaProxy 		= window.setInterval("saveLog_UsaProxy()",500);
		IVL_scrollCheck_UsaProxy 	= window.setInterval("processScroll_UsaProxy()",1000);
	}	
	
	// create chat for both parties, only on top frame level
	if (parent==this) OBJ_chat.createChat();

}

/** Removes remote event visualization elements.
  * Stops polling for remote events,
  * and removes attached event listeners. */
function stopLogging_UsaProxy() {

	/** if Remote Monitoring mode only on the monitored user's side */
	if ((FLG_RemoteMonitoring && remoteMonitorer=="false") || !FLG_RemoteMonitoring) {

		// remove event listeners
		
		// IE
		if(document.detachEvent) { 
			document.detachEvent('onmousemove', processMousemove_UsaProxy);
			document.detachEvent('onmouseover', processMouseover_UsaProxy);
			document.detachEvent('onmouseout', processMouseout_UsaProxy);
			document.detachEvent('onmousedown', processMousedown_UsaProxy);
			document.detachEvent('onmouseup', processMouseup_UsaProxy);
			/* change Handler for each relevant element
			 * dropdowns, lists, text fields/areas, file fields, password fields, and checkboxes*/
			for (var i = 0; i < document.forms.length; ++i) {
				for (var j = 0; j < document.forms[i].elements.length; ++j) {
					if(document.forms[i].elements[j].type) {
						var elType = document.forms[i].elements[j].type;
						if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {
							document.forms[i].elements[j].detachEvent('onchange', processChange_UsaProxy);
						}
					}
				}
			}
		}
		
		// NS
		if(document.removeEventListener) {
			document.removeEventListener('mousemove', processMousemove_UsaProxy, false);
			document.removeEventListener('mouseover', processMouseover_UsaProxy, false);
			document.removeEventListener('mouseout', processMouseout_UsaProxy, false);
			document.removeEventListener('mousedown', processMousedown_UsaProxy, false);
			document.removeEventListener('mouseup', processMouseup_UsaProxy, false);
			for (var i = 0; i < document.forms.length; ++i) {
				for (var j = 0; j < document.forms[i].elements.length; ++j) {
					if(document.forms[i].elements[j].type) {
						var elType = document.forms[i].elements[j].type;
						if (elType=="select-one" || elType=="select-multiple" || elType=="text" || elType=="textarea" || elType=="file" || elType=="checkbox" || elType=="password" || elType=="radio") {
							document.forms[i].elements[j].removeEventListener('change', processChange_UsaProxy, false);
						}
					}
				}
			}
		}
		
		// clear interval logging function		
		clearInterval(IVL_saveLog_UsaProxy);
		clearInterval(IVL_scrollCheck_UsaProxy);
	}
	
	if ((FLG_RemoteMonitoring && remoteMonitorer=="true") || !FLG_RemoteMonitoring) {
	
		// clear interval polling functions		
		//#################clearInterval(IVL_getEvents_UsaProxy);
		
		/* remove remote event visualization objects */
		/* remove remote mouse cursor */
		var DIV_remoteMouse	= document.getElementById(DIV_remoteMouse_UsaProxy.id);
		remoteAppendPoint.removeChild(DIV_remoteMouse);
		
		// restart polling for proposals
		if (!FLG_RemoteMonitoring)
			getProposals_UsaProxy();
	}
	
	// delete chat layer
	OBJ_chat.deleteChat();
	
	// if Remote Monitoring mode reset remoteMonitorer flag
	if(FLG_RemoteMonitoring) remoteMonitorer="";
			
}

/* Invoke init_UsaProxy on load */
if(document.attachEvent) window.attachEvent('onload', init_UsaProxy);
if(document.addEventListener) window.addEventListener('load', init_UsaProxy, false);

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
function datestamp_UsaProxy() {
	if (loadDate_UsaProxy==null) loadDate_UsaProxy = new Date();
	var currentDate 	= new Date();
	// get milliseconds from loading time
	var diffSecs 		= Math.abs(currentDate.getTime() - loadDate_UsaProxy.getTime());
	// return new Date object according to UsaProxy start time + diffMSecs
	var currentUPDate 	= new Date(startDate_UsaProxy.getTime() + diffSecs);
	//alert(currentUPDate);
	return currentUPDate.getFullYear() + "-" + completeDateVals(currentUPDate.getMonth()) + "-"
	  + completeDateVals(currentUPDate.getDate()) + "," + completeDateVals(currentUPDate.getHours())
	  + ":" + completeDateVals(currentUPDate.getMinutes())
	  + ":" + completeDateVals(currentUPDate.getSeconds());
}

/** Completes single-digit numbers by a "0"-prefix */
function completeDateVals(dateVal /*string*/) {
	var dateVal = "" + dateVal;
	if (dateVal.length<2) return "0" + dateVal;
	else return dateVal;
}

/* Appends an event log entry together with the httptrafficindex referencing this page,
   the client's session ID, the collaborating partner's session ID
 * and the current timestamp to logVal_UsaProxy */
function writeLog_UsaProxy(text /*string*/) {
	if(FLG_writingLogVal_UsaProxy || partnerSID_UsaProxy=="") { window.setTimeout("writeLog_UsaProxy('" + text + "')",50); return;}
	var logline;
	
	// generate and append log entry
	logLine = datestamp_UsaProxy() + "&sd=" + serverdataId_UsaProxy + "&sid="
	+ sessionID_UsaProxy + "&psid="
	+ partnerSID_UsaProxy  + "&event=" + text;
	
	// set synchronization flag (block function)
	FLG_writingLogVal_UsaProxy = true;
	logVal_UsaProxy = logVal_UsaProxy + logLine + "&xX"; // add logLine to interaction log
	/* send captured data to the proxy;
	   to reduce the amount of requests this command may be hidden */
	saveLog_UsaProxy();
	// reset synchronization flag (release function)
	FLG_writingLogVal_UsaProxy = false;
}

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
	
	return eventString;
}

/* Returns file name of a URL/path */
function getFileName(path /*string*/) {
	if(path.lastIndexOf("/")>-1)
		return path.substring(path.lastIndexOf("/")+1);
	else return path;
}

/***** AJAX code.
	   Used with each UsaProxy request such as for the logging of the tracking data or 
	   for the polling for remote events */

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
function saveLog_UsaProxy() {
	if(logVal_UsaProxy!="") {
		xmlreqGET_UsaProxy("/usaproxylolo/log?" + logVal_UsaProxy, "handleSendLog_UsaProxy");
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
	writeLog_UsaProxy("load&page=" + document.URL + "&size=" + loadWidth + "x" + loadHeight);
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

/* Processes mouseover event
 * logs mouseover events on all elements which have either an
 * id, name, href, or src property (logging more would cause a log overload) */ 
function processMouseover_UsaProxy(e) {
	
	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev = (window.Event) ? e : window.event;
	var target = (window.Event) ? ev.target : ev.srcElement;
	
	/** check if element wasn't created by this JavaScript
	  * by examining if element or the element's parent is contained in the usaProxy_divs array */
	if(!(
		( target.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.id) )
		|| ( target.parentNode.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.parentNode.id) )
		)) {
		
		// log mouseover coordinates and all available target attributes
		// if element has an id attribute
		/** only links, images, and form elements*/
		if (target.type=="select-one" 
			 || target.type=="select-multiple" 
			 || target.type=="textarea" 
			 || target.nodeName=="input" 
			 || target.nodeName=="INPUT"
			 || target.href
			 || target.src) {
			if (target.id) { 
				writeLog_UsaProxy("mouseover&id=" + target.id
									+ generateEventString_UsaProxy(target));
				//saveLog_UsaProxy();
			}
			else {
				// if element has a name attribute
				if(target.name) {
					writeLog_UsaProxy("mouseover&name=" + target.name
										+ generateEventString_UsaProxy(target));
					//saveLog_UsaProxy();
				} else {
					// if element has an href or src attribute
					if (target.href || target.src) {
						writeLog_UsaProxy("mouseover" + generateEventString_UsaProxy(target));
						//saveLog_UsaProxy();
					}
				}
			}
		}
	}
}

/* Processes mouseout event
 * logs mouseout events on all elements which have either an
 * id, name, href, or src property (logging more would cause a log overload) */ 
function processMouseout_UsaProxy(e) {
	
	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev = (window.Event) ? e : window.event;
	var target = (window.Event) ? ev.target : ev.srcElement; 
	
	/** check if element wasn't created by this JavaScript
	  * by examining if element or the element's parent is contained in the usaProxy_divs array */
	if(!(
		( target.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.id) )
		|| ( target.parentNode.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.parentNode.id) )
		)) {
		
		// log mouseout coordinates and all available target properties
		// if element has an id attribute
		/** only links, images, and form elements*/
		if (target.type=="select-one" 
			 || target.type=="select-multiple" 
			 || target.type=="textarea" 
			 || target.nodeName=="input" 
			 || target.nodeName=="INPUT"
			 || target.href
			 || target.src) {
			if (target.id) { 
				writeLog_UsaProxy("mouseout&id=" + target.id
									+ generateEventString_UsaProxy(target));
				//saveLog_UsaProxy();
			}
			else {
				// if element has a name attribute
				if(target.name) {
					writeLog_UsaProxy("mouseout&name=" + target.name
										+ generateEventString_UsaProxy(target));
					//saveLog_UsaProxy();
				} else {
					// if element has an href or src attribute
					if (target.href || target.src) {
						writeLog_UsaProxy("mouseout" + generateEventString_UsaProxy(target));
						//saveLog_UsaProxy();
					}
				}
			}
		}
	}
}


/* Processes mouse release event.
   Logs mousedown event together with the mouse button type (if middle or
   right button), and the available event target properties.
   Since click might have occured also outside of form fields, images, or, hyperlinks,
   the mouse pointer position is recorded relative to the hovered-over area/element. */
function processMousedown_UsaProxy(e) {

	/* get event target, x, and y value of mouse position
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	/** check if element wasn't created by this JavaScript
	  * by examining if element or the element's parent is contained in the usaProxy_divs array */
	if(!(
		( target.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.id) )
		|| ( target.parentNode.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.parentNode.id) )
		)) {
		
		/** mouse button detection: was middle or right mouse button clicked ? */
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
		
		/** if left mouse button was pressed and the target element
		    isn't a direct child node of
		    the top-level HTML element e.g. the scrollbar */
		if (mbutton=="left" && target.parentNode!=document.documentElement) {
			
			/* if regular click, log click coordinates relative to the clicked element
	   		   and all available target attributes */
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
	}
}

/* similar to mousedown */
function processMouseup_UsaProxy(e) {

	/* get event target, x, and y value of mouse position
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	var x 		= (window.Event) ? ev.pageX : ev.clientX;
	var y 		= (window.Event) ? ev.pageY : ev.clientY; 
	
	var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element
	var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element
	
	/** check if element wasn't created by this JavaScript
	  * by examining if element or the element's parent is contained in the usaProxy_divs array */
	if(!(
		( target.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.id) )
		|| ( target.parentNode.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.parentNode.id) )
		)) {
		
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
	
		/** if left mouse button was pressed and the target element
		    isn't a direct child node of
		    the top-level HTML element e.g. the scrollbar */
		if (mbutton=="left" && target.parentNode!=document.documentElement) {
			
			// if regular click log click coordinates and all available target attributes
			// if element has an id attribute
			if (target.id) 	writeLog_UsaProxy("mouseup&offset=" + xOffset + "," + yOffset + "&id=" + target.id + generateEventString_UsaProxy(target) );
			else {
				// if element has a name attribute
				if(target.name) writeLog_UsaProxy("mouseup&offset=" + xOffset + "," + yOffset + "&name=" + target.name + generateEventString_UsaProxy(target));
				else {
					writeLog_UsaProxy("mouseup&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));
				}
			}
			
		}
	}
}

/* Processes change event in select lists, input fields, textareas.
   Logs change event together with the corresponding field type, and
   a couple of field content properties such as the new field value. */
function processChange_UsaProxy(e) {
	
	/* get event target
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
	/** check if element wasn't created by this JavaScript
	  * by examining if element or the element's parent is contained in the usaProxy_divs array */
	if(!(
		( target.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.id) )
		|| ( target.parentNode.id && containsArrayEntry_UsaProxy(UsaProxy_divs, target.parentNode.id) )
		)) {
	
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


/** end event logging */

/** deletes all child nodes from the specified node */
function removeChildrenFromNode_UsaProxy(node /*DOM element*/) {
	while (node.hasChildNodes())
		node.removeChild(node.firstChild);
}

/** Fetches the user's status from UsaProxy */
function getStatus_UsaProxy() {
	xmlreqGET_UsaProxy( "/usaproxylolo/getstatus?sid=" + sessionID_UsaProxy, "handleStatus_UsaProxy");
}

/** Handles the status response.
    If status switches from online to offline (session was terminated), logging is disabled and
    a notification div popup is displayed. Otherwise (offline to online) the shared session
	is instantiated and the session-dependent content is displayed in the case
	that this wasn't achieved yet by the functions in proposal.js and propose.js
	(e.g. due to page switch).
    Function must be invoked periodically due to caching. */
function handleStatus_UsaProxy(xmldoc /*XML response*/) {

	try {
	/** since proposer might receive proposal acknowledgement in between
	    getStatus and receive status response, check is neccessary to
		avoid onlineUser_UsaProxy switching from "online" back to "offline" */
	if((window.FLG_proposed_UsaProxy && FLG_proposed_UsaProxy==false) || ! window.FLG_proposed_UsaProxy) {
	
		var status_node = xmldoc.getElementsByTagName("status");
		var partner_node = xmldoc.getElementsByTagName("psid");
		
		/** offline status detected */
		if (status_node[0].firstChild.nodeValue=="offline") {
	
			/** if local status variable contains an "online" value, it is switched, and the
			    session is terminated (session-specific contents are reset and notification
				popup is displayed */
			if(onlineUser_UsaProxy=="online") {
				// set status variable offline
				onlineUser_UsaProxy="offline";
			
				// stop sharedBrowsing/logging
				stopLogging_UsaProxy();
				
				// display info div
				/* create offline layer and append it after the body tag */
				var DIV_offline_UsaProxy 	= createDIV_UsaProxy("150px", "auto", "10px", "10px", "offline_UsaProxy", true);
				remoteAppendPoint.appendChild(DIV_offline_UsaProxy);
				
				// create termination statement and append it to DIV
				var offline_statement 		= document.createElement("p");
				offline_statement.innerHTML = "Your session was terminated !";
				DIV_offline_UsaProxy.appendChild(offline_statement);
				
				/** reset contents if on remotemonitoring.htm or sharedbrowsing.htm */
				if (window.sharedBrowsingPage_UsaProxy || window.remoteMonitoringPage_UsaProxy)
					rebuildOfflinePage(); 
				
				// create ok button which closes the div on click
				var offline_but				= createBut("offlineAck_UsaProxy", "button", 80, "ok");
				offline_but.style.marginTop = "10px";
				offline_but.onmousedown		= function (e) { 
												var offlineDiv = document.getElementById('offline_UsaProxy');
												remoteAppendPoint.removeChild(offlineDiv);
											  }
				DIV_offline_UsaProxy.appendChild(offline_but);
			}
			
		}
		/** online status detected */
		else {
			/** if the partner's session ID wasn't assigned yet by the methods in
			    proposal.js and propose.js, assign the specified string */
			if (partnerSID_UsaProxy=="") partnerSID_UsaProxy = partner_node[0].firstChild.nodeValue;
			
			/** if chat headline wasn't assigned yet, display customized headline, depending
			    on the sharing mode */
			if (document.getElementById("DIV_chat_UsaProxy")) {
				if (document.getElementById("chat_headline_UsaProxy").innerHTML=="") {
					/** if remote monitoring mode and this user is the monitoring party,
					    or if shared browsing mode
					    display a customized message referring to the partner */
					if ((FLG_RemoteMonitoring && remoteMonitorer=="true") || !FLG_RemoteMonitoring) {
						document.getElementById("chat_headline_UsaProxy").innerHTML = "<b>Chat</b> "
					   	+ "with <span style='color:green;'>" + partnerSID_UsaProxy + "</span>!";
					}
					/** if remote monitoring mode and this user is the monitored party,
					    display a anonymous message */
					else
						document.getElementById("chat_headline_UsaProxy").innerHTML =  "<b>Chat</b> with the support !";
			}}
			/** display customized status content if not yet assigned */
			if (document.getElementById("statusTXT") && document.getElementById("statusTXT").innerHTML=="")
				buildOnlinePage();
			/** finally, start polling for remote events (in shared browsing mode, and 
			    if this user is the monitoring party in remote monitoring mode */
			if (onlineUser_UsaProxy=="offline") {
				/** display customized status content if not yet assigned */
				if (window.sharedBrowsingPage_UsaProxy || window.remoteMonitoringPage_UsaProxy)
					buildOnlinePage(); 
				onlineUser_UsaProxy="online";
				if ((FLG_RemoteMonitoring && remoteMonitorer=="true") || !FLG_RemoteMonitoring)
					getEvents_UsaProxy();
			}
		}
		
	}
	
	} catch( e ) {
		window.setTimeout('getStatus_UsaProxy();',2000);
	}
	
	// getStatus must be performed periodically in order to update the user's timestamp at UsaProxy
	window.setTimeout('getStatus_UsaProxy();',2000);
}

/** Returns a customized div element according to the specified parameters.
    If div shall be draggable, assign an absolute css position property */
function createDIV_UsaProxy(width /*string*/, height /*string*/, top /*string*/, left /*string*/, id /*string*/, draggable /*boolean*/) {

	var DIV 				= document.createElement("div");
	
	/* define layer look and feel */
	
	DIV.id 					= id;
	
	DIV.style.width 		= width;
	DIV.style.height 		= height;
	DIV.style.top 			= top;
	DIV.style.left 			= left;
	DIV.style.fontFamily 	= "Arial";
	DIV.style.fontSize 		= "9pt";
	DIV.style.color 		= "#333333";
	DIV.style.background 	= "#DDF0B6";
	DIV.style.textAlign		= "left";
	DIV.style.zIndex		= "32000";
	DIV.style.border 		= "1px solid #006600";
	DIV.style.padding 		= "2px";
	
	if(draggable) {
		DIV.style.position 	= "absolute";
		var dragBar			= OBJ_drag.createBar();
		DIV.appendChild(dragBar);
	}
	
	return DIV;
}

/** Returns a customized button according to the specified parameters. */
function createBut(name /*string*/, type /*string*/, width /*string*/, value /*string*/) {

	var but 					= document.createElement("input");
	but.name 					= name;
	but.type 					= type;
	but.value 					= value;
	but.style.width 			= width;
	but.style.fontSize 			= "8pt";
	
	return but;
}


/** Chat object.
    Object provides methods for the creation of the integrated chat div,
	and for the exchange of chat messages. */

var OBJ_chat = {
	lastMessage : -1,	/** last fetched chat message */
	IVL_getChatText : null,		/** interval variable */
	
	/* Creates chat div */
	createChat 	: function () {
		/* create chat layer incl. dragbar and append it after the body tag */
		var DIV_chat 		= createDIV_UsaProxy("250px", "auto", "10px", "10px", "DIV_chat_UsaProxy", true);
		remoteAppendPoint.appendChild(DIV_chat);
		
		/** append remote mouse layer to the array of non-loggable elements */
		UsaProxy_divs.push("DIV_chat_UsaProxy");
		
		// append exitbut
		// create exitBut which fires endSession function
		var exit_but				= createBut("exitbutton_UsaProxy", "button", 25, "x");
		exit_but.onmousedown		= endSession_UsaProxy;
		// append button to dragbar (first Child of chat div)
		document.getElementById("DIV_chat_UsaProxy").firstChild.appendChild(exit_but);
	
		// headline
		var headline 		= document.createElement("p");
		headline.id			= "chat_headline_UsaProxy";
		headline.style.marginTop = "5px";
		headline.style.marginBottom = "5px";
		if (partnerSID_UsaProxy) headline.innerHTML = "<b>Chat</b> with <span style='color:green;'>" + partnerSID_UsaProxy + "</span>!";
		else headline.innerHTML = "";
    	DIV_chat.appendChild(headline);
		
		// textarea
		var textarea 		= createDIV_UsaProxy("244px", "120px", "0px", "0px", "chatarea_UsaProxy", false);
		textarea.style.marginBottom = "1px";
		textarea.style.background	= "#E7F4CA";
		textarea.style.overflow		= "auto";
		if(textarea.style.cssFloat) textarea.style.cssFloat	= "left";	// FF
		if(textarea.style.styleFloat) textarea.style.styleFloat	= "left";  // IE
		DIV_chat.appendChild(textarea);

		// text field
		var textfield 					= document.createElement("input");
		textfield.type 					= "text";
		textfield.id 					= "sendfield_UsaProxy";
		textfield.style.width 			= "200px";
		textfield.style.height 			= "22px";
		textfield.style.fontFamily 		= "Arial";
		textfield.style.fontSize 		= "9pt";
		textfield.onkeydown				= OBJ_chat.processKeydown;
		if(textfield.style.cssFloat) textfield.style.cssFloat	= "left";	// FF
		if(textfield.style.styleFloat) textfield.style.styleFloat	= "left";  // IE
		DIV_chat.appendChild(textfield);
		
		// send button which invokes the sending of the typed in message when clicked
		var send_but				= createBut("sendbutton_UsaProxy", "button", 40, "send");
		send_but.onmousedown		= OBJ_chat.sendChatText;
		DIV_chat.appendChild(send_but);
		
		// create status bar and append it to DIV
		var statusbar 				= OBJ_statusbar.createBar(70, 240, 4, "online..");
		statusbar.style.marginTop 	= "3px";
		DIV_chat.appendChild(statusbar);
		OBJ_statusbar.loading();
		
		OBJ_chat.getChatText();
	},
	/** removes the chat div from the DOM tree */
	deleteChat : function () {
		var DIV_chat = document.getElementById("DIV_chat_UsaProxy");
		remoteAppendPoint.removeChild(DIV_chat);
	},
	/** Fetches new messages from UsaProxy and appends the index of the last received message */
	getChatText : function () {
		xmlreqGET_UsaProxy( "/usaproxylolo/chat?last=" + OBJ_chat.lastMessage + "&sid="
			+ sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "OBJ_chat.handleChatResponse");
	},
	/** Handles the return of new chat messages in the form of a XML document */
	handleChatResponse : function(xmldoc /*XML response*/) {

		var textarea 		= document.getElementById("chatarea_UsaProxy");
		var message_nodes 	= xmldoc.getElementsByTagName("message");
		var n_messages 		= message_nodes.length;
		for (var m = 0; m < n_messages; m++) {
			var text_node 	= message_nodes[m].getElementsByTagName("text");
			var sid_node 	= message_nodes[m].getElementsByTagName("sid");
			/** append message to the textarea represented by a div (due to style),
			    either in green when a remote message, or in red if an own message. */
			if(unescape(sid_node[0].firstChild.nodeValue) != sessionID_UsaProxy)
				appendToDIV_UsaProxy(textarea, unescape(text_node[0].firstChild.nodeValue), "green");
			else appendToDIV_UsaProxy(textarea, unescape(text_node[0].firstChild.nodeValue), "red");
			/** assign new lastMessage index */
			OBJ_chat.lastMessage = (message_nodes[m].getAttribute('id'));
		}
		// if chat div still exists
		if (document.getElementById("chatarea_UsaProxy")!=null) {
			/** force textarea div to be always scrolled down to the newest message */
			document.getElementById("chatarea_UsaProxy" ).scrollTop = document.getElementById("chatarea_UsaProxy").scrollHeight;
			window.setTimeout('OBJ_chat.getChatText();',2000);
		}
	},
	/* Processes the release of keys and sends the typed-in text when 
	   the enter key was pressed  */
	processKeydown : function(e) {
	
		/* get keycode
		* IE: first case (window.event available); NS: second case */
		var evtobj 	= window.event ? window.event : e;
		var KeyID 	= evtobj.which ? evtobj.which : evtobj.keyCode;
		
		if(KeyID==13) OBJ_chat.sendChatText();
	},
	/** sends the typed-in text to UsaProxy */
	sendChatText : function() {
		var textfield = document.getElementById("sendfield_UsaProxy").value;
		if(textfield!="") {
			xmlreqGET_UsaProxy( "/usaproxylolo/chat?" + datestamp_UsaProxy()
				+ "&sd=" + serverdataId_UsaProxy + "&sid=" + sessionID_UsaProxy
				+ "&psid=" + partnerSID_UsaProxy
				+ "&text=" + escape(textfield), "");
			// reset text field
			document.getElementById("sendfield_UsaProxy").value = "";
		}
	}
};

/** Drag object managing all dragging activities */

var OBJ_drag = {
	dragobject		: null,	// object to be dragged
	dragx			: 0,	// position the object was clicked
	dragy			: 0,	
	posx			: 0,	// mouse position
	posy			: 0,
	init : function () {
		
		// IE
		if(document.attachEvent) { 
			document.attachEvent('onmouseup', OBJ_drag.processMouseup);
			document.attachEvent('onmousemove', OBJ_drag.processMousemove);
		}
		
		// NS
		if(document.addEventListener) {
			document.addEventListener('mouseup', OBJ_drag.processMouseup, false);
			document.addEventListener('mousemove', OBJ_drag.processMousemove, false);
		}
	},	
	/** Returns the dragger div which is assigned to another div layer */
	createBar : function () {
		var dragBar					= document.createElement("div");
		dragBar.id					= "dragBar_UsaProxy";
		dragBar.style.width 		= "100%";
		dragBar.style.height 		= "auto";
		dragBar.style.marginBottom 	= "1px";
		if(dragBar.style.cssFloat) dragBar.style.cssFloat 	= "left";	// FF
		if(dragBar.style.styleFloat) dragBar.style.styleFloat 	= "left";  // IE
		dragBar.style.cursor 		= "move";
		dragBar.style.textAlign		= "right";
		dragBar.style.background 	= "#006600";
		dragBar.onmousedown			= OBJ_drag.dragstartInvoke;		// dragging is enabled on mousedown
		
		/** append dragger div to the array of non-loggable elements */
		if(!containsArrayEntry_UsaProxy(UsaProxy_divs, "dragBar_UsaProxy"))
			UsaProxy_divs.push("dragBar_UsaProxy");
	
		return dragBar;
	},
	processMouseup : function (e) {
		OBJ_drag.dragstop();
	},
	processMousemove : function (e) {
		OBJ_drag.drag(e);
	},
	// Sets initial values for dragging
	dragstart : function(element) {
		OBJ_drag.dragobject = element;
		OBJ_drag.setOpacity(OBJ_drag.dragobject, 80);
		OBJ_drag.dragx = OBJ_drag.posx - OBJ_drag.dragobject.offsetLeft;
		OBJ_drag.dragy = OBJ_drag.posy - OBJ_drag.dragobject.offsetTop;
	},
	// Makes the dragged element semi-transparent
	setOpacity : function(element, opacity) {
		opacity = (opacity == 100)? 99.999 : opacity;
		// IE/Win
		element.style.filter = "alpha(opacity:"+opacity+")";
		// Safari<1.2, Konqueror
		element.style.KHTMLOpacity = opacity/100;
		// Older Mozilla and Firefox
		element.style.MozOpacity = opacity/100;
		// Safari 1.2, newer Firefox and Mozilla, CSS3
		element.style.opacity = opacity/100;
	},
	// Invokes the dragging
	dragstartInvoke : function(e) {
		// retrieve element to be dragged and start dragging it
		/* get event target = the respective dragbar
		 * NS: first case (window.Event available); IE: second case */
		var ev 		= (window.Event) ? e : window.event;
		var target 	= (window.Event) ? ev.target : ev.srcElement;
		// get parent div of dragbar
		var targetParent = target.parentNode;
		// start dragging parent
		OBJ_drag.dragstart(targetParent);
	},
	// resets dragobject in order to stop dragging
	dragstop : function () {
		if(OBJ_drag.dragobject!=null) {
			OBJ_drag.setOpacity(OBJ_drag.dragobject, 100);
			OBJ_drag.dragobject = null;
		}
	},
	// Is invoked on mousemove, drags the dragobject
	drag : function(e) {
		OBJ_drag.posx = document.all ? window.event.clientX : e.pageX;
		OBJ_drag.posy = document.all ? window.event.clientY : e.pageY;
		if(OBJ_drag.dragobject != null) {
			OBJ_drag.dragobject.style.left = (OBJ_drag.posx - OBJ_drag.dragx) + "px";
			OBJ_drag.dragobject.style.top = (OBJ_drag.posy - OBJ_drag.dragy) + "px";
		}
	}
};

// statusbar object displays a periodically accumulating  status bar
var OBJ_statusbar = {
	startWidth	: 1,
	beginWidth 	: 1,
	endWidth	: 150,
	speed		: 5,
	// Expands/contracts the status bar periodically according to the defined parameters
	loading 	: function () {
		if(document.getElementById("statusdot")) {
			window.setTimeout(OBJ_statusbar.loading, 100);
		
			if (OBJ_statusbar.beginWidth  < OBJ_statusbar.endWidth) {
				OBJ_statusbar.beginWidth  += OBJ_statusbar.speed;
				document.getElementById("statusdot").style.width = OBJ_statusbar.beginWidth;
			}
			if (OBJ_statusbar.beginWidth  >= OBJ_statusbar.endWidth) OBJ_statusbar.beginWidth = OBJ_statusbar.startWidth;
		}
	},
	// Creates and returns a statusbar with the specified parameters
	createBar : function (startWidth /*number*/, endWidth /*number*/, speed /*number*/, text /*string*/) {
	
		OBJ_statusbar.startWidth		= startWidth;
		OBJ_statusbar.endWidth			= endWidth;
		OBJ_statusbar.speed				= speed;
		
		var statusdot					= document.createElement("div");
		statusdot.id					= "statusdot";
		statusdot.style.width 			= "1px";
		statusdot.style.height 			= "16px";
		statusdot.style.marginBottom 	= "1px";
		if(statusdot.style.cssFloat) statusdot.style.cssFloat 	= "left";	// FF
		if(statusdot.style.styleFloat) statusdot.style.styleFloat 	= "left";  // IE
		statusdot.style.background 		= "#B5D595";
		statusdot.innerHTML				= text;
		statusdot.style.font			= "italic 14px Arial";
		statusdot.style.lineHeight		= "16px";
	
		return statusdot;
	}
};

/** Terminates a shared session and notifies UsaProxy */
function endSession_UsaProxy() {
		
	/** only mode: online to offline */
	if (onlineUser_UsaProxy=="online") {
	
		/** first, switch onlineUser variable to "offline" */
		onlineUser_UsaProxy = "offline";
		/** stop logging/steering functionality */
		stopLogging_UsaProxy();
		
		/** if script is incorporated into sharedbrowsing.htm/remotemonitoring.htm page
		  * reset page, restore offline state */
		if (window.sharedBrowsingPage_UsaProxy || window.remoteMonitoringPage_UsaProxy)
			rebuildOfflinePage();
		
		/** notify UsaProxy */
		xmlreqGET_UsaProxy( "/usaproxylolo/endsession?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "");
	}
}


/** Fetches new remote events from UsaProxy */
function getEvents_UsaProxy() {
	/** if the partner's session ID not yet defined, defer until available */
	if(partnerSID_UsaProxy != '') {
		xmlreqGET_UsaProxy("/usaproxylolo/getevents?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy + "&last=" + lastLogEntry_UsaProxy, "handleEvents_UsaProxy");
	}
	else { // defer
		window.setTimeout('getEvents_UsaProxy();',500);
	}
}

/* Handles the returned remote events in the form of a XML response.
   Invokes the corresponding event replay function */
function handleEvents_UsaProxy(xmldoc /*XML response*/) {
	try {
		var event_nodes 		= xmldoc.getElementsByTagName("event");
		var n_events 			= event_nodes.length;
		for (var e = 0; e < n_events; e++) {
			var type_node 		= event_nodes[e].getElementsByTagName("type");
			var offset_node 	= event_nodes[e].getElementsByTagName("offset");
			var sd_node 		= event_nodes[e].getElementsByTagName("sd");
			var page_node 		= event_nodes[e].getElementsByTagName("page");
			var size_node 		= event_nodes[e].getElementsByTagName("size");
			var sid_node 		= event_nodes[e].getElementsByTagName("sid");
			var id_node 		= event_nodes[e].getElementsByTagName("id");
			var dom_node 		= event_nodes[e].getElementsByTagName("dom");
			var y_node 			= event_nodes[e].getElementsByTagName("y");
			var x_node 			= event_nodes[e].getElementsByTagName("x");
			var value_node 		= event_nodes[e].getElementsByTagName("value");
			var fieldtype_node 	= event_nodes[e].getElementsByTagName("fieldtype");
			var checked_node	= event_nodes[e].getElementsByTagName("checked");
			var selected_node	= event_nodes[e].getElementsByTagName("selected");
			lastLogEntry_UsaProxy = (event_nodes[e].getAttribute('id'));
			
			/* if event occured in the remote browser (check if different sd/ httptrafficindex)
			 * display remote event/trigger local event */
			if(unescape(sid_node[0].firstChild.nodeValue)!=sessionID_UsaProxy
				/** and if remote events were tracked on the same page which the user is on */
				&& ((type_node[0].firstChild.nodeValue!="load" && unescape(sd_node[0].firstChild.nodeValue)==serverdataId_UsaProxy)
					|| type_node[0].firstChild.nodeValue=="load")) {
					
					
				// mouse move event
				if (type_node[0].firstChild.nodeValue=="mousemove") {
				
					var dom = dom_node[0].firstChild.nodeValue;

					if(id_node.length>0) {
						moveRemoteMouse_UsaProxy(unescape(offset_node[0].firstChild.nodeValue), id_node[0].firstChild.nodeValue, dom);
					} else { // element has no id attribute
						moveRemoteMouse_UsaProxy(unescape(offset_node[0].firstChild.nodeValue), null, dom);
					}
					
				// mouse over event
				} else if (type_node[0].firstChild.nodeValue=="mouseover") {
				
					var dom = dom_node[0].firstChild.nodeValue;

					if(id_node.length>0) {
						remoteMouseover_UsaProxy(id_node[0].firstChild.nodeValue, dom);
					} else { // element has no id attribute
						remoteMouseover_UsaProxy(null, dom);
					}
					
				// mouse out event
				} else if (type_node[0].firstChild.nodeValue=="mouseout") {
					remoteMouseout_UsaProxy();
					
				// mouse down event
				} else if (type_node[0].firstChild.nodeValue=="mousedown") {
					
					var dom = dom_node[0].firstChild.nodeValue;

					if(id_node.length>0) {
						remoteMousedown_UsaProxy(id_node[0].firstChild.nodeValue, dom);
					} else {
						remoteMousedown_UsaProxy(null, dom);
					}
					
				// mouse up event
				} else if (type_node[0].firstChild.nodeValue=="mouseup") {
					
					var dom = dom_node[0].firstChild.nodeValue;

					if(id_node.length>0) {
						remoteMouseup_UsaProxy(id_node[0].firstChild.nodeValue, dom);
					} else {
						remoteMouseup_UsaProxy(null, dom);
					}
					
				// load event
				} else if (type_node[0].firstChild.nodeValue=="load" && sd_node[0].firstChild.nodeValue!=serverdataId_UsaProxy) {
					remoteLoad_UsaProxy(unescape(sd_node[0].firstChild.nodeValue), 
						page_node[0].firstChild.nodeValue, size_node[0].firstChild.nodeValue);
						
				// scroll event
				} else if (type_node[0].firstChild.nodeValue=="scroll") {
					// vertically scrolled
					if (y_node.length>0) {
						remoteScroll_UsaProxy("y", unescape(y_node[0].firstChild.nodeValue));
					// horizontally scrolled
					} else
						remoteScroll_UsaProxy("x", unescape(x_node[0].firstChild.nodeValue));
				}
				
				// change event
				else if (type_node[0].firstChild.nodeValue=="change") {
					value = null;
					selected = 0;
					if (value_node.length>0) {
						value = unescape(value_node[0].firstChild.nodeValue);
					}
					if (selected_node.length>0) {
							selected = Number(unescape(selected_node[0].firstChild.nodeValue));
					}
					
					var dom = dom_node[0].firstChild.nodeValue;					
					
					if(id_node.length>0) {
						remoteChange_UsaProxy(id_node[0].firstChild.nodeValue, dom, value, selected);
					} else { // element has no id attribute
						remoteChange_UsaProxy(null, dom, value, selected);
					}
					
				}
			}
			
		}
		
		/** since status might have changed during method processing,
		* final status check must be performed before getEvents_UsaProxy
		* is re-invoked after a timeout */
		if (onlineUser_UsaProxy=="online")
			window.setTimeout('getEvents_UsaProxy();',500);
			
	/** in case any error occured during the processing
	  * getEvents_UsaProxy() is reinvoked after a timeout */
	} catch( e ) {
	//	alert("bla error2:" + e.description);
		if (onlineUser_UsaProxy=="online")
			window.setTimeout('getEvents_UsaProxy();',500);
	}
}


/* Remote event reconstruction functions */

/** Reconstructs a remote load event.
    The specified page is loaded together with the "usaproxyload" keyword */
function remoteLoad_UsaProxy(sd /*string*/, page /*string*/, size /*string*/) {

	// adapt body size according to remote window size
	var sizeX	= Number(size.substring(0, size.indexOf("x")));
	var sizeY	= Number(size.substring(size.indexOf("x")+1));
	if(window.innerWidth) { // NS 
		window.innerWidth 	= sizeX;
		window.innerHeight  = sizeY;
	} else { // IE (causes a JavaScript exception since body inaccessible at this point)
		//document.body.offsetWidth 	= sizeX;
		//document.body.offsetHeight 	= sizeY;
	}
	// load new page together with usaproxyload indicator
	if (page.indexOf("?")>-1 )
		location.href = page + "&usaproxyload&sd=" + sd + "&sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy;
	else
		location.href = page + "?usaproxyload&sd=" + sd + "&sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy;
}

/** Reconstructs a remote mousemove event.
    The green mouse pointer is assigned the restored coordinates
	relative to the hovered-over DOM element. */
function moveRemoteMouse_UsaProxy(offset /*string*/, id /*string*/, dom /*string*/) {

	if (offset!="") {
		// recompute offset
		var DIV_remoteMouse = document.getElementById("remoteMouse_UsaProxy");
		var offsetX_remoteMouse = Number(offset.substring(0, offset.indexOf(",")));
		var offsetY_remoteMouse = Number(offset.substring(offset.indexOf(",")+1));
		
		/** get hovered-over element */
		var hoveredElement;
		/* first, check if an id attribute exists
		   if true, get element by id, else by means of the dom path */
		if (id!=null) {
			hoveredElement = document.getElementById(id);
		} else {
		/* get dom element
		 * crop first char of dom-String since it represents the HTML-Node/documentElement
		 * instead the dom-String must start with the respective child of the documentElement */
			hoveredElement 		= getDOMElement(dom.substring(1), document.documentElement);
		}
		
		// recompute absolute coordinates
		var posX_remoteMouse = absLeft(hoveredElement) + offsetX_remoteMouse;
		var posY_remoteMouse = absTop(hoveredElement) + offsetY_remoteMouse;

		/** if specified position is lower then 0 assign the minimum value */
		if(posX_remoteMouse<0) posX_remoteMouse=0;
		if(posY_remoteMouse<0) posY_remoteMouse=0;
		
		/** if specified position exceeds the total document height/width
		    assign a maximum value */
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
		if(posX_remoteMouse>scrollWidth_UsaProxy) posX_remoteMouse=scrollWidth_UsaProxy-20;
		if(posY_remoteMouse>scrollHeight_UsaProxy) posY_remoteMouse=scrollHeight_UsaProxy-20;
		
		
		// assign new values
		DIV_remoteMouse.style.top 	= posY_remoteMouse + "px";
		DIV_remoteMouse.style.left 	= posX_remoteMouse + "px";
	}
}

/** Reconstructs a remote mouseover event.
    The green mouse pointer is assigned the hand cursor image and an
	underlining div is displayed. */
function remoteMouseover_UsaProxy(id /*string*/, dom /*string*/) {

	/** first remove any existent underlining divs */
	if(document.getElementById("div_underline_UsaProxy"))
		remoteAppendPoint.removeChild(document.getElementById("div_underline_UsaProxy"));
		
	/** append underlining div to the array of non-loggable elements */
	if(!containsArrayEntry_UsaProxy(UsaProxy_divs, "div_underline_UsaProxy"))
		UsaProxy_divs.push("div_underline_UsaProxy");
	
	/** reset mouse cursor */
	var IMG_remoteMouseCursor 	= document.getElementById("remoteMouseCursor_UsaProxy");
	if(IMG_remoteMouseCursor.src!=IMG_remoteMouseCursorPointer.src)
		IMG_remoteMouseCursor.src	= IMG_remoteMouseCursorPointer.src;
	
	/** get hovered-over element */
		var hoveredElement;
		/* first, check if an id attribute exists
		   if true, get element by id, else by means of the dom path */
		if (id!=null) {
			hoveredElement = document.getElementById(id);
		} else {
		/* get dom element
		 * crop first char of dom-String since it represents the HTML-Node/documentElement
		 * instead the dom-String must start with the respective child of the documentElement */
			hoveredElement 		= getDOMElement(dom.substring(1), document.documentElement);
		}
	
	/** determine the position of the underlining div according
	    to the hovered-over element measurements */
	var hoveredElementWidth	= getElementWidth(hoveredElement);
	var hoveredElementHeight= getElementHeight(hoveredElement);
	var hoveredElementTop	= absTop(hoveredElement);
	var hoveredElementLeft	= absLeft(hoveredElement);
	
	/** create and append underline div */
	var DIV_underline				= document.createElement("div");
	DIV_underline.id 				= "div_underline_UsaProxy";
	
	DIV_underline.style.width 		= hoveredElementWidth + "px";
	DIV_underline.style.height 		= "2px";
	DIV_underline.style.top 		= (hoveredElementTop + hoveredElementHeight - 2)  + "px";
	DIV_underline.style.left 		= hoveredElementLeft + "px";
	DIV_underline.style.background 	= "#006600";
	DIV_underline.style.zIndex		= "31998";
	DIV_underline.style.lineHeight	= "2px";
	DIV_underline.style.fontSize	= "1px";
	DIV_underline.innerHTML			= "&nbsp;";
	DIV_underline.style.position 	= "absolute";
	remoteAppendPoint.appendChild(DIV_underline);
	
	/* display hand cursor */
	var IMG_remoteMouseCursor 	= document.getElementById("remoteMouseCursor_UsaProxy");
	IMG_remoteMouseCursor.src	= IMG_remoteMouseCursorHand.src;
}

/* Resets the existing remote mouseover visualization. */
function remoteMouseout_UsaProxy() {

	/* remove underline div */
	if(document.getElementById("div_underline_UsaProxy"))
		remoteAppendPoint.removeChild(document.getElementById("div_underline_UsaProxy"));
	
	/* display regular pointer cursor */
	var IMG_remoteMouseCursor 	= document.getElementById("remoteMouseCursor_UsaProxy");
	IMG_remoteMouseCursor.src	= IMG_remoteMouseCursorPointer.src;
}

/** Reconstructs a remote mousedown event.
    Invokes the appropriate local event handlers
	which were assigned by the web page editor. */
function remoteMousedown_UsaProxy(id /*string*/, dom /*string*/) {
	
	/** get clicked element */
	var clickedElement;
	/* first, check if an id attribute exists
	   if true, get element by id, else by means of the dom path */
	if (id!=null) {
		clickedElement = document.getElementById(id);
	} else {
	/* get dom element
	 * crop first char of dom-String since it represents the HTML-Node/documentElement
	 * instead the dom-String must start with the respective child of the documentElement */
		clickedElement 		= getDOMElement(dom.substring(1), document.documentElement);
	}
	
	/** invoke local handlers. */
	callFunction_UsaProxy(clickedElement.onmousedown);
	callFunction_UsaProxy(clickedElement.onmouseup);
	callFunction_UsaProxy(clickedElement.onclick);
}

/** Reconstructs a remote mouseup event.
    Processes remote radio button click events.
    Invokes the appropriate local event handlers
	which were assigned by the web page editor. */
function remoteMouseup_UsaProxy(id /*string*/, dom /*string*/) {
	
	/** get clicked element */
	var clickedElement;
	/* first, check if an id attribute exists
	   if true, get element by id, else by means of the dom path */
	if (id!=null) {
		clickedElement = document.getElementById(id);
	} else {
	/* get dom element
	 * crop first char of dom-String since it represents the HTML-Node/documentElement
	 * instead the dom-String must start with the respective child of the documentElement */
		clickedElement 		= getDOMElement(dom.substring(1), document.documentElement);
	}
	
	/** in case a radio button or a checkbox was clicked, 
	perform this also in this browser. */
	switch(clickedElement.type)
	{
		// radio button
		case "radio":		
			clickedElement.click();
			//alert(changedElement.id);
		break;
		
		// checkbox
		case "checkbox":		
			clickedElement.click();
		break;
	}
	
	/** invoke local handlers. */
	callFunction_UsaProxy(clickedElement.onmousedown);
	callFunction_UsaProxy(clickedElement.onmouseup);
	callFunction_UsaProxy(clickedElement.onclick);
}

/** Reconstructs a remote scroll event.
    Computes the new page offset according to the specified percentage offset
	and assigns it to the web page. */
function remoteScroll_UsaProxy(axis /*string*/, offset /*string*/) {
		
		/** Determine the total HTML document height */
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
		
		/* compute the new offset value */
		// vertical scrolling
		if(axis=="y") {
			/** e.g. 100, 80 , 6, 0 */
			var percentOfHeight = Number(offset.substring(0,1) + offset.substring(2));
			var newOffset = Math.round((scrollHeight_UsaProxy * percentOfHeight) / 100);
			// assign new value to the global lastScrollPos variable
			lastScrollPosY_UsaProxy = newOffset;
		}
		// horizontal scrolling
		else {
			/** e.g. 100, 80 , 6, 0 */
			var percentOfWidth = Number(offset.substring(0,1) + offset.substring(2));
			var newOffset = Math.round((scrollWidth_UsaProxy * percentOfWidth) / 100);
			// assign new value to the global lastScrollPos variable
			lastScrollPosX_UsaProxy = newOffset;
		}
		
		// scroll the page to the new position
		window.scrollTo(lastScrollPosX_UsaProxy, lastScrollPosY_UsaProxy);
}

/** Reconstructs a remote change event.
    Assigns the specified value to the changed element.
	Invokes any local related event handlers. */
function remoteChange_UsaProxy(id /*string*/, dom /*string*/, value /*string*/, selected /*number*/) {
	
	/** get changed element */
	var changedElement;
	/* first, check if an id attribute exists
	   if true, get element by id, else by means of the dom path */
	if (id!=null) {
		changedElement = document.getElementById(id);
	} else {
	/* get dom element
	 * crop first char of dom-String since it represents the HTML-Node/documentElement
	 * instead the dom-String must start with the respective child of the documentElement */
		changedElement 		= getDOMElement(dom.substring(1), document.documentElement);
	}
	
	// perform changes in text fields and dropdown menus
	/* (changes of radio buttons or checkboxes are performed onmouseup;
	    this is since IE releases change event not immediately but 
		after a checkbox or radio button lost focus) */
	switch(changedElement.type)
	{
		// text field
		case "text":		
			changedElement.value = value;
		break;
		
		// file field
		case "file":		
			changedElement.value = value;
		break;
		
		// textarea
		case "textarea":		
			changedElement.value = value;
		break;
		
		// dropdown menu
		case "select-one":		
			changedElement.selectedIndex = selected;
		break;
	}
	
	/** invoke local handlers. */
	callFunction_UsaProxy(changedElement.onmousedown);
	callFunction_UsaProxy(changedElement.onmouseup);
	callFunction_UsaProxy(changedElement.onchange);
	callFunction_UsaProxy(changedElement.onclick);
}

/** Executes the function body of the specified function 
    in the case that it is available */
function callFunction_UsaProxy(fun) {
	if (fun!=null) {
		var funString = fun.toString();
		if(funString.indexOf("{")==-1) {
			/** execute */
			eval(funString);
		}
		// handler e.g. of the form "function anonymous() { <body> }"
		else {
			// retrieve function body (all within "{" and "}"
			funString = funString.substring(funString.indexOf("{")+1, funString.indexOf("}"));
			/** execute */
			eval(funString);
		}
	}
}

/* Returns true if string is a number, otherwise false. */
function isNumber(string /*string*/) {
	var isNum = true;
	for(i=0; i<string.length; ++i)
		if(string.charAt(i) < "0" || string.charAt(i) > "9") isNum = false;
	if(isNum) return true;
	else return false;
}

/* Returns the node's DOM path beginning with the first
 * corresponding child node of the document node (i.e. HTML)*/
function getDOMElement(dom, node) {

	var DOMElementPrefixStg;	// contains prefix number (if the elements position exceeds the number of available characters)
	var DOMElementNum;			// total index of character (or number+character pair)
	var DOMElement;
	var DOMElementPrefix;		// numeric prefix
	var DOMElementPostfix;		// the character
	var elementChildNodes;
	
	while (dom.length>0) {

		DOMElementPrefixStg = "";
		// if dom begins with number
		while (dom.length>1 && isNumber(dom.substring(0,1))) {
			// assign prefix number
			DOMElementPrefixStg += Number(dom.substring(0,1));
			dom = dom.substring(1,dom.length); // crop number
		}
		
		/* retrieve childNode index of current element */
		if (DOMElementPrefixStg!="") {	// with prefix
			DOMElementPrefix = Number(DOMElementPrefixStg); // number
			DOMElementPostfix = mapToNum(dom.substring(0,1));	// retrieve index from character
			// compute total index
			DOMElementNum = (DOMElementPrefix*alphArray.length) + DOMElementPostfix;
		// single character
		} else {
			// retrieve index from character
			DOMElementNum = mapToNum(dom.substring(0,1));
		}
		// retrieve the childNodes array
		elementChildNodes = getElementChildNodes(node);
		// retrieve the DOM element according to the retrieved index
		DOMElement = elementChildNodes[DOMElementNum];
		
		if (dom.length>1)
			dom = dom.substring(1,dom.length);
		else dom = "";
		
		// use the retrieved element as the next node to be examined during the next loop
		node = DOMElement;

	}
	return node;
}

/* Returns the element-type childNodes array of the specified node. */
function getElementChildNodes(node /*DOM element*/) {
	var elementChildNodes = new Array();
	for (i=0; i<node.childNodes.length; i++)
		if (node.childNodes[i].nodeType==1) elementChildNodes.push(node.childNodes[i]);
	return elementChildNodes;
}

/* Maps specified character to its position in the alphabet array */
function mapToNum(alph /*string*/) {
	var iNumber = 0;
	while (alphArray[iNumber]!=alph) iNumber++;
	return iNumber;
}

/* Returns true if the specified array contains the value. */
function containsArrayEntry_UsaProxy(array /*Array*/, value /*string*/){
    var exists = false;
    for (var i in array) {
        if (array[i] == value && array[i] != null) {
            exists = true;
            break;
        }
    }
    return exists;
}

/** Removes the specified value from the specified array */
function removeArrayEntry_UsaProxy(array /*Array*/, value  /*string*/) {
    var indexV = getIndexArray(array, value);
	array = array.slice(0,indexV).concat(array.slice(indexV+1,array.length));
	return(array);
}

/* Returns the index of the entry in the specified list. */
function getIndexArray(list /*DOM element*/, value /*string*/){
  	result = -1;
  	index = 0;
  	while(index < list.length && result == -1) {
    	if(list[index] == value)
      		result = index;
    	else index++;
	}
  	return result;
}

/** Appends element (i.e. session ID) with a specified color to div */
function appendToDIV_UsaProxy(div /*DOM element*/, element /*string*/, color /*string*/) {
	var ptag 				= document.createElement("p");
	ptag.id					= element;
	ptag.style.margin		= "0px";
	ptag.style.color		= color;
	ptag.style.paddingBottom= "0px";
	ptag.innerHTML			= element;
	div.appendChild(ptag);
}

/** Returns the specified element's height */
function getElementHeight(element) {
	// NS
	if (element.clip) {
		return element.clip.height;
	}
	else if (element.style.pixelHeight) {
		return element.style.pixelHeight;
	}
	else {
		return element.offsetHeight;
	}
}

/** Returns the specified element's width */
function getElementWidth(element) {
	// NS
	if (element.clip) {
		return element.clip.width;
	}
	else if (element.style.pixelWidth) {
		return element.style.pixelWidth;
	}
	else {
		return element.offsetWidth;
	}
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

/* Returns the DOM path of the specified DOM node beginning with the first
 * corresponding child node of the document node (i.e. HTML) */
function getDOMPath(node /*DOM element*/) {
	if(node.parentNode.nodeType==9) return getDOMIndex(node);
	else return getDOMPath(node.parentNode) + getDOMIndex(node);
}

/** Returns the position of the specified node 
    in its parent node's childNodes array */
function getDOMIndex(node /*DOM element*/) {
	var parent = node.parentNode;
	var children = parent.childNodes;
	var length = children.length;
	var position = 0;
	for (var i = 0; i < length; i++) {
		if (children[i].nodeType==1) { // count only element nodes
			position += 1;
			if (children[i] == node) {
				return mapToAlph(position);
			}
		} 
	}
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
function mapToAlph(position) {
	var amountAlphs = 0;
	var alphRemain = "";
	if(position>alphArray.length) { // if position > available indexes
		amountAlphs = Math.floor(position/alphArray.length);
		alphRemain = alphArray[(position % alphArray.length)-1];
	} 
	if(amountAlphs>0) return (amountAlphs + alphRemain);
	return (alphArray[position-1]);
}

 
 /* ]]> */
