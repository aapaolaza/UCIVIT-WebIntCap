/** sharedbrowsing.htm page-specific JavaScript which provides methods
    for custimizing the page and for filling it with the fetched UsaProxy data (e.g. online users) */

var sharedBrowsingPage_UsaProxy = true;	/* when this variable is detected by the core UsaProxy JavaScript
										   it is sure that the sharedbrowsing.htm is loaded */

var IVL_getUsers_UsaProxy;				// interval variable: timer for poll function getUsers_UsaProxy()

var onlinesArray;						// array containing all online users (those users who participate in a shared session)
var partnersArray;						// array containing all offline users (potential shared browsing partners)


window.onerror = handleError_UsaProxy;

/** captures a JavaScript exception (e.g. for debugging) */
function handleError_UsaProxy(message, file, line) {
	error = "error message:\n" + message + "\n" + file + "\n" + line;
  	alert(error);
  	return true;
}

/** Displays a customized user interface according to the sharing mode and the user status.
    In the case that the shared browsing mode is disabled, dummy contents are displayed */
function init() {
	/** check if proxyscript.js available;
	  * yes: since proxyscript is attached to document after HEAD tag
		field onlineUser_UsaProxy is available at this point.
		Action is only performed if 1. shared browsing mode
		2. if script is executed in the shared session window */
	if (window.onlineUser_UsaProxy && !FLG_RemoteMonitoring && FLG_isSharedSessionWindow) {
	
		/* create empty arrays */
		onlinesArray 	= new Array();
		partnersArray 	= new Array();
		
		/** welcome user */
		document.getElementById("hello").innerHTML = "<b>Hello " + sessionID_UsaProxy + "</b>";
		
		/** depending on the user status the interface is either reset 
		(offline) or assigned the session-dependent data (online) */
		if(onlineUser_UsaProxy=="offline")
			rebuildOfflinePage()
		else 
			buildOnlinePage();
			
		/** attach mousedown event listener to button "terminate session" */
		document.getElementById("statusbut").onmousedown = endSession_UsaProxy;
		
		/** poll for other users */
		getUsers_UsaProxy();
			
	/* otherwise, hide session specific contents and display dummy text */
	} else {
		document.getElementById("statusTXT").innerHTML = "Your status: -";
		if(!FLG_isSharedSessionWindow)
			document.getElementById("notificationTXT").innerHTML
				= "Note: shared browsing panel not available since you're not in your shared session window !";
		else
			document.getElementById("notificationTXT").innerHTML = "Note: Shared Browsing not available !";
		document.getElementById("statusbut").style.display = "none";
		document.getElementById("DIV_partners").style.display = "none";
		document.getElementById("DIV_onlines").style.display = "none";
	}
}

/** Polls for other users */
function getUsers_UsaProxy() {
	/* request all users and their status from UsaProxy */
	xmlreqGET_UsaProxy( "/usaproxylolo/getusers?sid=" + sessionID_UsaProxy, "handleUsers_UsaProxy");
}

/** Handles the XML response which contains the other users' session IDs and status.
    The potential partners list on the left (offline users) and the online users list 
	on the right are updated:
    New online users are appended to the online list. If a user
	left a session or isn't available anymore, he is removed from this list and
	inserted into the potential partners list. */
function handleUsers_UsaProxy(xmldoc /*XML response*/) {

	/** retrieve the div layer which represents the list with online users */
	var onlines_div 	= document.getElementById("onlines");
	/** retrieve the select list which holds the offline users (potential shared session partners) */
	var partners 		= document.getElementById("partners");
	
	var onlinesArrayTmp 	= new Array();	// temp array used for collecting the fetched online users
	var partnersArrayTmp 	= new Array();	// temp array used for collecting the fetched offline users
	
	/* collect all online users in onlinesArrayTmp and
	 * all offline users in partnersArrayTmp */
	var user_nodes = xmldoc.getElementsByTagName("user");
	var n_users = user_nodes.length;
	for (var u = 0; u < n_users; u++) {
		var sid_node 	= user_nodes[u].getElementsByTagName("sid");
		var status_node = user_nodes[u].getElementsByTagName("status");
		
		/* if online user append him to onlinesArrayTmp */
		if(status_node[0].firstChild.nodeValue=="online") {
			onlinesArrayTmp.push(sid_node[0].firstChild.nodeValue);
		}
		/* if offline user append him to partnersArrayTmp */
		else {
			if(unescape(sid_node[0].firstChild.nodeValue)!=sessionID_UsaProxy) {
				partnersArrayTmp.push(sid_node[0].firstChild.nodeValue);
			}
		}
	}
	
	/* display new online users:
	   compare global and temp array:
	 * if temp contains x whereas global does not, append x to div and also to global array */
	for (var a in onlinesArrayTmp) {
		// if temp user not in global onlinesArray
		if (!containsArrayEntry_UsaProxy(onlinesArray, onlinesArrayTmp[a])) {
			// append to onlines div
			if(onlinesArrayTmp[a]!=sessionID_UsaProxy) appendToDIV_UsaProxy(onlines_div, onlinesArrayTmp[a], "black");
			else appendToDIV_UsaProxy(onlines_div, onlinesArrayTmp[a], "#006600");
			// append to global onlines array
			onlinesArray.push(onlinesArrayTmp[a]);
		}
	}
	
	/* display new offline users (potential partners):
	   compare global and temp array:
	 * if temp contains x whereas global does not, append x to select list and also to global array */
	for (var b in partnersArrayTmp) {
		// if tmp user not in global partnersArray
		if (!containsArrayEntry_UsaProxy(partnersArray, partnersArrayTmp[b])) {
			// append to partners list
			addOption_UsaProxy(partners, partnersArrayTmp[b]);
			// append to global partners array
			partnersArray.push(partnersArrayTmp[b]);
		}
	}

	/* removal of online users:
	   if temp doesn't contain y whereas global does, delete y from div and also from global array */
	for (var c in onlinesArray) {
		// if global user not in tmp onlinesArray
		if (!containsArrayEntry_UsaProxy(onlinesArrayTmp, onlinesArray[c])) {
			// remove from onlines div
			removeFromDIV_UsaProxy(onlines_div, onlinesArray[c]);
			// remove from global onlines array
			onlinesArray = removeArrayEntry_UsaProxy(onlinesArray, onlinesArray[c]);
		}
	}
	
	/* removal of offline users:
	   if temp doesn't contain y whereas global does, delete y from select list and also from global array */
	var renew = false;
	for (var d in partnersArray) {
		// if global user not in temp partnersArray
		if (!containsArrayEntry_UsaProxy(partnersArrayTmp, partnersArray[d])) {
			renew = true;
			// remove from global partners array
			partnersArray = removeArrayEntry_UsaProxy(partnersArray, partnersArray[d]);
		}
	}
	
	/** generate new partners list */
	if(renew) {
		// remove all entries from partners list 
		partners.options.length = 0;
		// add all new options
		for (var p in partnersArray) {
			// append to partners list
			addOption_UsaProxy(partners, partnersArray[p]);
		}
	}
	
	/** fetch again after 1000 ms */
	IVL_getUsers_UsaProxy = window.setTimeout('getUsers_UsaProxy();',1000);
}

/** Removes specified element from div */
function removeFromDIV_UsaProxy(div /*DOM element*/, element /*string*/) {
	var ptag = document.getElementById(element);
	if(ptag!= null)
		div.removeChild(ptag);
}

/** Adds specified element to the specified select list */
function addOption_UsaProxy(list /*DOM element*/, element /*string*/) {
	var index = list.options.length;
    list.options[index] = new Option(element, element, false, false);
    //element.selectedIndex = element.options[index].index;
}

/** Removes specified element from select list */
function removeOption_UsaProxy(list /*DOM element*/, element /*string*/) {
	var index = getIndex(list, element);
	if(list.options.length > index && list.options[index]!= null) {
		list.removeChild(list.options[0]);
	}
}

/* Returns index of the specified option (i.e. value) in select list */
function getIndex(list /*DOM element*/, value /*string*/) {
  	result = -1;
  	index = 0;
  	while(index < list.length && result == -1) {
    	if(list[index].value == value)
      		result = index;
    	else index++;
	}
  	return result;
}

/** Displays default contents, which relate to an offline user status, e.g. hide "terminate" button */
function rebuildOfflinePage() {

	// clear notification
	document.getElementById("notificationTXT").innerHTML 	= "&nbsp;";
	
	/** hide status button */
	document.getElementById("statusbut").style.display 		= "none";
	
	// display partners div
	document.getElementById("DIV_partners").style.display 	= "inline";

	/** set status text to "offline" */
	document.getElementById("statusTXT").innerHTML 			= "You're not participating in any shared session !";
}

/** Displays contents, which relate to an online user status such as a displayed "terminate" button */
function buildOnlinePage() {
	
	// clear notification
	document.getElementById("notificationTXT").innerHTML 	= "&nbsp;";
	
	if(partnerSID_UsaProxy != "")
		document.getElementById("statusTXT").innerHTML 			= "You are online and share your browse with <b>" + partnerSID_UsaProxy + "</b>.";
	else
		document.getElementById("statusTXT").innerHTML 			= "";
	
	document.getElementById("statusbut").value 				= "terminate";
	document.getElementById("statusbut").style.display 		= "inline";
	
	// hide partners block
	document.getElementById("DIV_partners").style.display 	= "none";
}