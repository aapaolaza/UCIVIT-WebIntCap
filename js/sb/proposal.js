/* <![CDATA[ */

/** Shared browsing session proposal handling */

var IVL_getProposals_UsaProxy;	// Interval variable: timer for poll function getProposals_UsaProxy()

var proposalsArray_UsaProxy;	// contains all fetched proposals (i.e. proposer session IDs) for this client

/* Polls UsaProxy for the current proposals for this client */
function getProposals_UsaProxy() {
	xmlreqGET_UsaProxy("/usaproxylolo/getproposals?sid=" + sessionID_UsaProxy, "handleProposals_UsaProxy");
}

/* Handles proposals XML response: displays new
   proposals as div popup and removes expired proposals */
function handleProposals_UsaProxy(xmldoc /*XML response*/) {
		
	// if proposals array not defined yet, create empty array
	if (proposalsArray_UsaProxy==null) proposalsArray_UsaProxy = new Array();
	
	var proposalsArrayTmp = new Array();	// temp array used for collecting the fetched proposals
	
	/* collect all proposals in proposalsArrayTmp */
	var prop_nodes 		= xmldoc.getElementsByTagName("proposal");
	for (var p = 0; p < prop_nodes.length; p++) {
		var sid_node 		= prop_nodes[p].getElementsByTagName("sid");
		
		proposalsArrayTmp.push(sid_node[0].firstChild.nodeValue);
	}
	
	/* display of new proposals:
	   compare global and temp array:
	 * if temp contains x whereas global does not, create a div popup for x and append x to global array 
	  */
	for (var a in proposalsArrayTmp) {
		// if tmp proposal not in global proposalsArray
		if (!containsArrayEntry_UsaProxy(proposalsArray_UsaProxy, proposalsArrayTmp[a])) {
			
			// create and display proposal div
			/* create proposal layer and append it after the body tag */
			var DIV_proposals_UsaProxy 	= createDIV_UsaProxy("200px", "auto", proposalsArray_UsaProxy.length*10 + "px", 
						proposalsArray_UsaProxy.length*10 + "px", "proposalDiv" + proposalsArrayTmp[a], true);
			remoteAppendPoint.appendChild(DIV_proposals_UsaProxy);
			
			// create hidden session ID field
			var proposalSid				= document.createElement("input");
			//proposalSid.name 			= "proposalSid";
			proposalSid.id 				= "proposal" + proposalsArrayTmp[a];
			proposalSid.type			= "hidden";
			proposalSid.value 			= proposalsArrayTmp[a];
			DIV_proposals_UsaProxy.appendChild(proposalSid);
			
			// create proposal statement and append it to DIV
			var proposal_statement 		= document.createElement("p");
			proposal_statement.innerHTML = "User " + proposalsArrayTmp[a] 
												+ " proposed you a shared browse !\nDo you accept ?";
			DIV_proposals_UsaProxy.appendChild(proposal_statement);
			
			// create accept button which fires acceptProposal function
			var accept_but				= createBut("acceptBut_UsaProxy", "button", 80, "accept");
			accept_but.style.marginTop 	= "10px";
			if (accept_but.style.cssFloat) accept_but.style.cssFloat 	= "left";	// FF
			if (accept_but.style.styleFloat) accept_but.style.styleFloat = "left";  // IE
			accept_but.onmousedown		= acceptProposal;
			DIV_proposals_UsaProxy.appendChild(accept_but);
			
			// create reject button which fires rejectProposal function
			var reject_but				= createBut("rejectBut_UsaProxy", "button", 80, "reject");
			reject_but.style.marginTop 	= "10px";
			reject_but.onmousedown		= rejectProposal;
			DIV_proposals_UsaProxy.appendChild(reject_but);
			
			// append to global proposals array
			proposalsArray_UsaProxy.push(proposalsArrayTmp[a]);
		}
	}
	
	/* removal of expired proposals:
	   if temp doesn't contain y whereas global does, delete the y popup and y from global array */
	for (var b in proposalsArray_UsaProxy) {
		// if global proposal not in temp proposalsArray
		if (!containsArrayEntry_UsaProxy(proposalsArrayTmp, proposalsArray_UsaProxy[b])) {
			// delete proposal div
			var proposalDiv = document.getElementById("proposalDiv" + proposalsArray_UsaProxy[b]);
			remoteAppendPoint.removeChild(proposalDiv);
			
			// remove from global proposals array
			proposalsArray_UsaProxy = removeArrayEntry_UsaProxy(proposalsArray_UsaProxy, proposalsArray_UsaProxy[b]);
		}
	}

	/** since status might have changed during method processing
	  * final status check must be performed before fetching
	  * is restarted again after a timeout */
	if (onlineUser_UsaProxy=="offline")
		IVL_getProposals_UsaProxy = window.setTimeout('getProposals_UsaProxy();',1000);
}

/** Notifies the proxy about the user's acceptance of a proposal */
function acceptProposal(e) {
	
	// stop polling for proposals
	clearInterval(IVL_getProposals_UsaProxy);
	
	// if on shared browsing page, pause polling for users
	if(window.sharedBrowsingPage_UsaProxy) clearInterval(IVL_getUsers_UsaProxy);
	
	/* get target button
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
	var targetParent = target.parentNode;
	// get the partners Session ID from hidden field
	partnerSID_UsaProxy		= targetParent.getElementsByTagName("input") [0].value;
	
	/** send notification to UsaProxy */
	xmlreqGET_UsaProxy( "/usaproxylolo/acceptproposal?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "handleProposalAccept_UsaProxy");
}

/* Handles the proxy acknowledgement for a successful session initiation.
  In the case that a shared session is confirmed, the main tracking/steering 
  code is started */
function handleProposalAccept_UsaProxy(xmldoc /*XML response*/) {
	var ack_node 		= xmldoc.getElementsByTagName("ack");
	var partner_node 	= xmldoc.getElementsByTagName("partner");
	
	// remove proposal from proposals array
	proposalsArray_UsaProxy = removeArrayEntry_UsaProxy(proposalsArray_UsaProxy, partner_node[0].firstChild.nodeValue);
	
	/* if ack = positive begin session by initializing the tracking/steering code */
	if(ack_node[0].firstChild.nodeValue=="positive") {

		/* get respective proposal div and remove it */
		var proposalDIV = document.getElementById("proposalDiv" + partnerSID_UsaProxy);
		remoteAppendPoint.removeChild(proposalDIV);
		
		// if on shared browsing page, restart polling for users
		//if(window.sharedBrowsingPage_UsaProxy) 
			//getUsers_UsaProxy();
		
		// start tracking/steering but do not trigger a load event (i.e. "false" parameter)
		startLogging_UsaProxy(false);
		
		// delete all other proposal divs
		for (var b in proposalsArray_UsaProxy) {
			// delete proposal div
			var proposalDiv = document.getElementById("proposalDiv" + proposalsArray_UsaProxy[b]);
			remoteAppendPoint.removeChild(proposalDiv);
			
			// remove from global proposals list
			proposalsArray_UsaProxy = removeArrayEntry_UsaProxy(proposalsArray_UsaProxy, proposalsArray_UsaProxy[b]);
		}

	}
	/** negative acknowledgement (maybe proposer has withdrawn his proposal) */
	else {
		/* replace proposal div content with notification message */
		// get related proposal div
		var proposalDIV = document.getElementById("proposalDiv" + partnerSID_UsaProxy);
		removeChildrenFromNode_UsaProxy(proposalDIV);
		// create notification and append it to div
		var notification 		= document.createElement("p");
		notification.innerHTML = "The user that proposed you a shared browse isn't available !"
										+ "\nPlease choose another proposal !";
		proposalDIV.appendChild(notification);
		
		// create ok button which closes the div on click
		var close_but				= createBut("close_UsaProxy", "button", 80, "ok");
		close_but.style.marginTop 	= "10px";
		close_but.onmousedown		= function (e) {  
										// restart polling for proposals
										getProposals_UsaProxy();
										// if on shared browsing page, restart polling for users
										if(window.sharedBrowsingPage_UsaProxy)
											getUsers_UsaProxy();
										var closeDiv = document.getElementById("proposalDiv" + partnerSID_UsaProxy);
										remoteAppendPoint.removeChild(closeDiv);
									  }
		proposalDIV.appendChild(close_but);

	}
}

/** Notifies the proxy about the user's rejection of a proposal */
function rejectProposal(e /*Event*/) {
	
	// stop polling for proposals
	clearInterval(IVL_getProposals_UsaProxy);
	
	/* get target button
	 * NS: first case (window.Event available); IE: second case */
	var ev 		= (window.Event) ? e : window.event;
	var target 	= (window.Event) ? ev.target : ev.srcElement;
	
	var targetParent = target.parentNode;
	// get the partners Session ID from hidden field
	partnerSID_UsaProxy		= targetParent.getElementsByTagName("input") [0].value;
	
	// remove proposal from proposals array
	proposalsArray_UsaProxy = removeArrayEntry_UsaProxy(proposalsArray_UsaProxy, partnerSID_UsaProxy);
	
	/** send notification to UsaProxy */
	xmlreqGET_UsaProxy( "/usaproxylolo/rejectproposal?sid=" + sessionID_UsaProxy + "&psid=" + partnerSID_UsaProxy, "");
	
	// close proposal div
	remoteAppendPoint.removeChild(targetParent);

	// restart polling for proposals after a timeout
	IVL_getProposals_UsaProxy = window.setTimeout('getProposals_UsaProxy();',1000);

}

/* ]]> */