/** Remote monitoring session proposing functionality. */

var FLG_proposed_UsaProxy = false;		/* flag indicating whether this user 
						   has just proposed a shared session */

var IVL_getProposalAck_UsaProxy;		// interval variable: timer for poll function getProposalAck_UsaProxy()

/* Is invoked when the "Live Support" button is clicked by this user.
   Informs UsaProxy about the intention of this user to have his interactions monitored by
   another user. In addition a proposal status div popup is created.
*/
function propose_UsaProxy() {
	
	// only an offline user may propose
	if (onlineUser_UsaProxy=="offline") {
	
		// check if user does not currently propose/expect a proposal acknowledgement
		if (!FLG_proposed_UsaProxy) {
			
			// set propose flag
			FLG_proposed_UsaProxy = true;
			
			// create status div
			
			// create status layer and append it after the body tag
			var DIV_status_UsaProxy 	= createDIV_UsaProxy("154px", "auto", "10px", "10px", "DIV_statusbar_UsaProxy", true);
			remoteAppendPoint.appendChild(DIV_status_UsaProxy);
			
			// create status statement and append it to div
			var status_statement 		= document.createElement("p");
			status_statement.innerHTML = "Waiting for Live Support acknowledgement...";
			DIV_status_UsaProxy.appendChild(status_statement);
			
			// create status bar and append it to div
			var statusbar 		= OBJ_statusbar.createBar(30, 145, 4, "...");
			DIV_status_UsaProxy.appendChild(statusbar);
		
			OBJ_statusbar.loading();
			
			// insert <br>
			DIV_status_UsaProxy.appendChild(document.createElement("br"));
			
			// create cancel button which invokes the cancelProposal function when clicked
			var cancel_but				= createBut("cancelBut_UsaProxy", "button", 80, "cancel");
			cancel_but.style.marginTop 	= "10px";
			if (cancel_but.style.cssFloat) cancel_but.style.cssFloat 	= "left";	// FF
			if (cancel_but.style.styleFloat) cancel_but.style.styleFloat = "left";  // IE
			cancel_but.onmousedown		= cancelProposal_UsaProxy;
			DIV_status_UsaProxy.appendChild(cancel_but);
			
			
			/** send proposal to UsaProxy.
			    In remote monitoring mode no partner is specified since
			    proposal is handed over to all registered support assistants */
			xmlreqGET_UsaProxy( "/usaproxylolo/propose?sid=" + sessionID_UsaProxy, "");
				
			// poll for the acceptance notification after a timeout
			window.setTimeout("getProposalAck_UsaProxy()",200);
			
		// if user has just proposed and is waiting for session start/acknowledgment
		} else {
				// notification
				alert("Note: You are currently expecting an acknowledgement to a proposal !<br>You may not propose another time !");
		}
	
	// if user is already online/participating in a shared session
	} else {
		// notification
		alert("Note: You may not propose a shared browse if your status is \"offline\" !");
	}
}

/** Notifies UsaProxy about the withdrawal of a made proposal */
function cancelProposal_UsaProxy(e) {

	// only an offline user may withdraw his proposal
	if (onlineUser_UsaProxy=="offline") {
			
			// reset propose flag
			FLG_proposed_UsaProxy = false;
			
			/** stop polling for the proposal acknowledgement will be sufficient
			  * to let the partner know, that the proposal was cancelled.
			  * By this, the final acknowledgement flag won't be set in time
			    on the proxy which indicates a withdrawal */
			clearInterval(IVL_getProposalAck_UsaProxy);
			
			/* get target button
			 * NS: first case (window.Event available); IE: second case */
			var ev 		= (window.Event) ? e : window.event;
			var target 	= (window.Event) ? ev.target : ev.srcElement;
			
			var targetParent = target.parentNode;
			// close status div
			remoteAppendPoint.removeChild(targetParent);
		
	} else {
		// notification
		//document.getElementById("notificationTXT").innerHTML = "Note: You may not accept a proposal if your status is \"online\" !";
		alert ("Error: user is already online");
	}
}

/** Fetches the status of this user's proposal */
function getProposalAck_UsaProxy() {
	/* In remote monitoring mode no partner is specified since
	   proposal was handed over to all registered support assistants */
	xmlreqGET_UsaProxy( "/usaproxylolo/getproposalAck?sid=" + sessionID_UsaProxy, "handleProposalAck_UsaProxy");
}

/* Handles the proposal status response. If positive, shared session is instantiated */
function handleProposalAck_UsaProxy(xmldoc /*XML response*/) {
	var ack_node 		= xmldoc.getElementsByTagName("ack");
	var partner_node 	= xmldoc.getElementsByTagName("partner");
		
	/* if ack = positive begin session by initializing the tracking/steering code */
	if(ack_node[0].firstChild.nodeValue=="positive") {

		// remove status div
		var DIV_statusbar = document.getElementById("DIV_statusbar_UsaProxy");
		remoteAppendPoint.removeChild(DIV_statusbar);
		
		// in remote monitoring mode the proposer is assigned the monitored role
		remoteMonitorer="false";
		
		/** start logging and trigger load event (i.e. "true" parameter)
		  * in order to redirect the proposal accepter to this page */
		startLogging_UsaProxy(true);
		
		// reset propose flag
		FLG_proposed_UsaProxy = false;
		
	}
	/* if not yet accepted */
	else if (ack_node[0].firstChild.nodeValue=="idle") {
		/* poll for acknowledgement every 1000 ms, if this user is 
		   still proposing (has not withdrawn his proposal in the meantime) */
		if (FLG_proposed_UsaProxy)
			IVL_getProposalAck_UsaProxy = window.setTimeout('getProposalAck_UsaProxy();',1000);
	}
	/* if proposal was rejected */
	else {
		// reset propose flag
		FLG_proposed_UsaProxy = false;

		// remove status div
		var DIV_statusbar = document.getElementById("DIV_statusbar_UsaProxy");
		remoteAppendPoint.removeChild(DIV_statusbar);

		// notification
		alert("Note: Live Support currently not available (no supporter available) !");
	}
}
