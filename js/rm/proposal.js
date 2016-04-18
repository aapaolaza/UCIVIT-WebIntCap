/** Remote monitoring session proposal handling
    function getProposals_UsaProxy is invoked only on remote monitoring page */

var proposalsArray_UsaProxy = new Array();	// contains all fetched proposals (i.e. proposer session IDs) for this client

var IVL_getProposals_UsaProxy;	// interval variable: timer for poll function getProposals_UsaProxy()

/* Polls UsaProxy for the current proposals for this client */
function getProposals_UsaProxy() {
	/** only performed for registered admins (support assistants) */
	if(FLG_isAdmin_UsaProxy)
		xmlreqGET_UsaProxy( "/usaproxylolo/getproposals?sid=" + sessionID_UsaProxy, "handleProposals_UsaProxy");
}

/* Handles proposals XML response: displays new
   proposals in the proposals select list and removes expired proposals
 */
function handleProposals_UsaProxy(xmldoc /*XML response*/) {
	
	var proposals 		= document.getElementById("proposals"); // get proposals select list
	
	var proposalsArrayTmp = new Array();		// temp array used for collecting the fetched proposals
	
	/* collect all proposals in proposalsArrayTmp */
	var prop_nodes = xmldoc.getElementsByTagName("proposal");
	var n_props = prop_nodes.length;
	for (var p = 0; p < n_props; p++) {
		var sid_node 	= prop_nodes[p].getElementsByTagName("sid");
		
		/* append proposal to proposalsArrayTmp */
		if(unescape(sid_node[0].firstChild.nodeValue)!=sessionID_UsaProxy) {
			proposalsArrayTmp.push(sid_node[0].firstChild.nodeValue);
		}
	}
	
	/* display new proposals:
	   compare global and temp array:
	 * if temp contains x whereas global does not, append x to list and also to global array */
	for (var b in proposalsArrayTmp) {
		// if tmp user not in global proposalsArray
		if (!containsArrayEntry_UsaProxy(proposalsArray_UsaProxy, proposalsArrayTmp[b])) {
			// append to proposals list
			addOption_UsaProxy(proposals, proposalsArrayTmp[b]);
			// append to global proposals array
			proposalsArray_UsaProxy.push(proposalsArrayTmp[b]);
		}
	}

	/* removal of expired proposals:
	   if temp doesn't contain y whereas global does, delete y from list and also from global array */
	var renew = false;
	for (var d in proposalsArray_UsaProxy) {
		// if global proposal not in tmp proposalsArray
		if (!containsArrayEntry_UsaProxy(proposalsArrayTmp, proposalsArray_UsaProxy[d])) {
			renew = true;
			// remove from global proposals array
			proposalsArray_UsaProxy = removeArrayEntry_UsaProxy(proposalsArray_UsaProxy, proposalsArray_UsaProxy[d]);
		}
	}
	
	/** generate new proposals list */
	if(renew) {
		// remove all entries from proposals list 
		proposals.options.length = 0;
		// add all new proposals
		for (var p in proposalsArray_UsaProxy) {
			// append to proposals list
			addOption_UsaProxy(proposals, proposalsArray_UsaProxy[p]);
		}
	}

	/** fetch again after 1000 ms */
	IVL_getProposals_UsaProxy = window.setTimeout('getProposals_UsaProxy();',1000);
}

/** Notifies the proxy about the user's acceptance of a proposal */
function acceptProposal(e) {

	// if the proposal to be accepted was selected
	if(document.getElementById("proposals").selectedIndex!=-1) {
	
		// clear notification
		document.getElementById("notificationTXT").innerHTML = "&nbsp;";
		
		// pause polling for users
		//clearInterval(IVL_getUsers_UsaProxy);
		
		// accepter will be the monitorer
		remoteMonitorer="true";
		
		// get the partners Session ID
		partnerSID_UsaProxy = document.getElementById("proposals").options[document.getElementById("proposals").selectedIndex].value;
		
		/** send notification to UsaProxy */
		xmlreqGET_UsaProxy( "/usaproxylolo/acceptproposal?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "handleProposalAccept_UsaProxy");
		
	} else {
		// notification
		document.getElementById("notificationTXT").innerHTML = "Note: No proposal selected !\nPlease choose one !";
	}
}

/*Handles the proxy acknowledgement for a successful session initiation.
  In the case that a shared session is confirmed, the main tracking/steering 
  code is started */
function handleProposalAccept_UsaProxy(xmldoc /*XML response*/) {
	var ack_node 		= xmldoc.getElementsByTagName("ack");
	var partner_node 	= xmldoc.getElementsByTagName("partner");
	
	/* if ack = positive begin session by initializing the tracking/steering code */
	if(ack_node[0].firstChild.nodeValue=="positive") {
		
		// restart polling for users
		// getUsers_UsaProxy();
		
		// start tracking/steering but do not trigger a load event (i.e. "false" parameter)
		startLogging_UsaProxy(false);
	}
	else {
		// notification
		document.getElementById("notificationTXT").innerHTML = "The user that requested Live Support isn't available !"
															+ "\n Please choose another proposal !";
	}
}

/** Notifies the proxy about the user's rejection of a proposal */
function rejectProposal(e) {

	// if the proposal to be rejected was selected
	if(document.getElementById("proposals").selectedIndex!=-1) {

		// clear notification
		document.getElementById("notificationTXT").innerHTML = "&nbsp;";
		
		// get the partners Session ID
		partnerSID_UsaProxy = document.getElementById("proposals").options[document.getElementById("proposals").selectedIndex].value;
		
		/** send reject request to UsaProxy */
		xmlreqGET_UsaProxy( "/usaproxylolo/rejectproposal?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "");
		
	} else {
		// notification
		document.getElementById("notificationTXT").innerHTML = "Note: No proposal selected !\nPlease choose one !";
	}
}