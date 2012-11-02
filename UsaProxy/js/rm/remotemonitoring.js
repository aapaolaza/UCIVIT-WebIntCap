/** remotemonitoring.htm page-specific JavaScript which provides methods
    for custimizing the page and for filling it with the fetched UsaProxy data (e.g. online users) */

var remoteMonitoringPage_UsaProxy = true;	/* when this variable is detected by the core UsaProxy JavaScript
											   it is sure that the remotemonitoring.htm is loaded */

var IVL_getUsers_UsaProxy;				// interval variable: timer for poll function getUsers_UsaProxy()

var onlinesArray;						// array containing all online users (those users who participate in a shared session)


window.onerror = handleError_UsaProxy;

/** captures a JavaScript exception (e.g. for debugging) */
function handleError_UsaProxy(message, file, line) {
	error = "error message:\n" + message + "\n" + file + "\n" + line;
  	//alert(error);
  	return true;
}

/** Displays a customized user interface according to the sharing mode and the user status. */
function init() {
	/** check if proxyscript.js available;
	  * yes: since proxyscript is attached to document after HEAD tag
		field onlineUser_UsaProxy is available at this point.
		Action is only performed if 1. remote monitoring mode
		2. if script is executed in the shared session window */
	if (window.onlineUser_UsaProxy && FLG_RemoteMonitoring && FLG_isSharedSessionWindow) {
	
		/* create empty array */
		onlinesArray = new Array();
		
		/** welcome user */
		document.getElementById("hello").innerHTML = "<b>Hello " + sessionID_UsaProxy + "</b>";
		
		/** depending on the user status the interface is either reset 
		(offline) or assigned the session-dependent data (online) */
		if(onlineUser_UsaProxy=="offline")
			rebuildOfflinePage();
		else 
			buildOnlinePage();
		
		/** add mousedown event listener to "set online" button */
		document.getElementById("statusbut").onmousedown 	= endSession_UsaProxy;
		/** add mousedown event listener to "set admin" button */
		document.getElementById("adminbut").onmousedown 	= setAdmin_UsaProxy;
		
		/** attach mousedown event listener to button "accept" */
		document.getElementById("acceptbut").onmousedown 	= acceptProposal;
		/** attach mousedown event listener to button "reject" */
		document.getElementById("rejectbut").onmousedown 	= rejectProposal;
		
		/** if user is registered as support assistant 
		the page is set up with the corresponding data, otherwise, it is reset */
		if (FLG_isAdmin_UsaProxy) buildAdminPage();
		else resetAdminPage();
			
		/** poll for other users */
		getUsers_UsaProxy();
			
	/* otherwise, hide session specific contents and display dummy text */
	} else {
		document.getElementById("statusTXT").innerHTML 				= "Your status: -";
		document.getElementById("adminStatusTXT").innerHTML			= "-";
		if(!FLG_isSharedSessionWindow) {
			document.getElementById("notificationTXT").innerHTML 
				= "Note: remote monitoring panel not available since you're not in your shared session window !";
		} else {
			document.getElementById("notificationTXT").innerHTML 	= "Note: Remote Monitoring not available !";
		}
		document.getElementById("statusbut").style.display 			= "none";
		document.getElementById("adminbut").style.display 			= "none";
		document.getElementById("DIV_proposals").style.display 		= "none";
		document.getElementById("DIV_onlines").style.display 		= "none";
	}
}

/** Depending on the admin status of the user, UsaProxy is either requested to register this user
    as support assistant (potential remote monitorer), or to reset his admin status */
function setAdmin_UsaProxy() {
	if(FLG_RemoteMonitoring) {
	
		if(onlineUser_UsaProxy=="offline") {
		
			/** request for admin status change */
			
			// if admin flag, reset admin status
			if (FLG_isAdmin_UsaProxy) { 
				xmlreqGET_UsaProxy( "/usaproxylolo/setadmin?sid=" + sessionID_UsaProxy + "&id=" + id_UsaProxy + "&mode=reset", "handleAdminAck_UsaProxy");
			}
			// otherwise, set admin status
			else { // set admin status
				xmlreqGET_UsaProxy( "/usaproxylolo/setadmin?sid=" + sessionID_UsaProxy + "&id=" + id_UsaProxy + "&mode=set", "handleAdminAck_UsaProxy");
			}
		}
		else {
			document.getElementById("notificationTXT").innerHTML 	= "You're currently in a shared session ! You may not revoke your assistance status !";
		}
	}
}

/* Handles the UsaProxy acknowledgement concerning the 
   setting/ resetting of a user's admin status */
function handleAdminAck_UsaProxy(xmldoc /*XML response*/) {
	var ack_node 		= xmldoc.getElementsByTagName("ack");
	
	/* if ack = positive change local admin status,
	   start polling for proposals, and display the corresponding contents */
	if(ack_node[0].firstChild.nodeValue=="set") {
		FLG_isAdmin_UsaProxy = true;
		getProposals_UsaProxy();
		buildAdminPage();
	}
	/* otherwise, change local admin status,
	   and display the default contents */
	else if (ack_node[0].firstChild.nodeValue=="reset") {
		FLG_isAdmin_UsaProxy = false;
		resetAdminPage();
	}
	else  // failed
		document.getElementById("notificationTXT").innerHTML = "Registering you as <b>support assistant</b> failed !";
}

/** Displays admin contents, such as the admin button description "sign off" */
function buildAdminPage() {

	document.getElementById("notificationTXT").innerHTML 	= "&nbsp;";
	
	document.getElementById("adminStatusTXT").innerHTML 	= "You are registered as <b>support assistant</b> !";
	
	document.getElementById("adminbut").value 				= "sign off";
}

/** Displays default contents, such as the admin button description "register" */
function resetAdminPage() {

	document.getElementById("notificationTXT").innerHTML 	= "&nbsp;";
	
	document.getElementById("adminStatusTXT").innerHTML 	= "You are <b>not</b> registered for support assistance !";
	
	document.getElementById("adminbut").value 				= "register";
}

/** Polls for other users */
function getUsers_UsaProxy() {
	/* request all users and their status from UsaProxy */
	xmlreqGET_UsaProxy( "/usaproxylolo/getusers?sid=" + sessionID_UsaProxy, "handleUsers_UsaProxy");
}

/** Handles the XML response which contains the other users' session IDs and status.
    The online users list on the right is updated:
    New online users are appended to the list. If a user
	left a session or isn't available anymore, he is removed from this list. */
function handleUsers_UsaProxy(xmldoc /*XML response*/) {
	
	/** retrieve the div layer which represents the list of online users */
	var onlines_div 	= document.getElementById("onlines");
	
	var onlinesArrayTmp = new Array();	// temp array used for collecting the fetched online users
	
	/* collect all online users in onlinesArrayTmp */
	var user_nodes = xmldoc.getElementsByTagName("user");
	var n_users = user_nodes.length;
	for (var u = 0; u < n_users; u++) {
		var sid_node 	= user_nodes[u].getElementsByTagName("sid");
		var status_node = user_nodes[u].getElementsByTagName("status");
		
		/* if online user append him to onlinesArrayTmp */
		if(status_node[0].firstChild.nodeValue=="online") {
			onlinesArrayTmp.push(sid_node[0].firstChild.nodeValue);
		}
	}
	
	/* display new online users:
	   compare global and temp array:
	 * if temp contains x whereas global does not, append x to list and also to global array */
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

	/* removal of users:
	   if temp doesn't contain y whereas global does, delete y from list and also from global array */
	for (var c in onlinesArray) {
		// if global user not in temp onlinesArray
		if (!containsArrayEntry_UsaProxy(onlinesArrayTmp, onlinesArray[c])) {
			// remove from onlines div
			removeFromDIV_UsaProxy(onlines_div, onlinesArray[c]);
			// remove from global onlines array
			onlinesArray = removeArrayEntry_UsaProxy(onlinesArray, onlinesArray[c]);
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

	/** set status text to "offline" */
	document.getElementById("statusTXT").innerHTML 			= "You're not participating in any shared session !";
}

/** Displays contents, which relate to an online user status such as a displayed "terminate" button */
function buildOnlinePage() {
	
	// clear notification
	document.getElementById("notificationTXT").innerHTML 	= "&nbsp;";
	
	if(partnerSID_UsaProxy != "")
		document.getElementById("statusTXT").innerHTML 		= "You are online and monitor the browse of <b>" + partnerSID_UsaProxy + "</b>.";
	else
		document.getElementById("statusTXT").innerHTML		= "";
	
	document.getElementById("statusbut").value 				= "terminate";
	document.getElementById("statusbut").style.display 		= "inline";
}