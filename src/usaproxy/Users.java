package usaproxy;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Map.Entry;

/** Class <code>Users</code> is responsible for the management of collaboration sessions.
 *  It holds all clients together with their status (offline: not in a session/online:
 *  in a shared session), a couple of corresponding session information, an index structure
 *  for the management of session proposals, and the further.<br><br>
 *  In addition, it provides methods for the session initiation, management, and
 *  termination. */

public class Users {
	
	/** Holds for all users an array which contains the user's status
	  * and a timestamp which indicates the last request for the status information 
	  * (neccessary for user availability
	  * check) and a flag which indicates if a shared session window
	  * was defined. */
	private Hashtable 		users;		
	/** Necessary for remote monitoring mode: holds all admins (i.e. those 
	 *  users which are registered as support assistant resp. as the monitoring party) */
	private ArrayList 		admins;		
	
	/** Holds all session proposals for a user in the
	 * form of a list containing the proposers' session IDs */
	private Hashtable		proposals;		
	
	/** Holds for each online user the current partner 
	 * array: the partner's session ID; an acknowledgement flag which indicates the partner's
	 * session acceptance; the httptrafficindex which refers to the txt-file which
	   the web page, originally requested by the partner, was stored to; the name of the respective chat/events
	   <code>ArrayList</code> (in the form of the session initiators's session ID which is also in order to distinguish
	   between regular user and monitorer in remote
	   monitoring mode) */
	private Hashtable		partners;		
	
	/** Constructor: creates a <code>Users</code> instance together with the global
	 *  <code>Hashtable</code> structures users, proposals, partners, and admins. Furthermore,
	 *  a periodial timer check is started which examines whether a client
	 *  is still available.
	 */
	public Users() {
		users 		= new Hashtable();
		proposals 	= new Hashtable();
		partners 	= new Hashtable();
		admins	 	= new ArrayList();
		
		/** check periodically if users are still available */
		Timer timer = new Timer();
	    timer.schedule  ( new UserCheck(), 20000, 40000 );
	}
	
	/** Task <code>UserCheck</code> examines if the users' timestamp
	 *  was updated within the last 120 seconds. Otherwise, the client is 
	 *  removed from the users <code>Hashtable</code>.
	 */
	class UserCheck extends TimerTask {
		public void run() {
			/** current timestamp */
			Calendar now = Calendar.getInstance();
			int msNow = (int) now.getTime().getTime();
			
			/** check for each user */
			for (Iterator e = users.entrySet().iterator(); e.hasNext();) {
				
		        Entry me 			= (Entry) e.next();
		        String user 	= (String) me.getKey();
		        if (null == user) continue;
		        int ms 		= Integer.parseInt(((String[]) me.getValue()) [1]);
		        
		        /** if user didn't update his timestamp for at least 120 seconds
		         *  remove him from users and admins Hashtable */
		        if ((msNow-ms)>120000) {
		        	users.remove(user);
		        	if (admins.contains(user)) admins.remove(user);
		        }
		    }
		}
	}
	
	/** Adds or removes the clients session ID (i.e. sid) to or from the admins <code>ArrayList</code> 
	 *  and sends a notification for this action.
	 * 
	 * @param out is the client's <code>OutputStream</code>
	 * @param sid is the user's session ID
	 * @param mode is the direction of the setting (e.g. "set", "reset")
	 */
	public void setAdmin(OutputStream out, String sid, String mode) throws IOException {
		
		/** header part */
		
		StringBuffer headers = new StringBuffer();
		
		/** generate response headers,
		 *  add Cache-Control header so that the response won't be cached by the client,
		 *  assign a XML content type since the acknowledgement is sent as XML document */
		
		headers.append("HTTP/1.1 200").append(HTTPData.CRLF);
		headers.append("Expires: Mon, 26 Jul 1997 05:00:00 GMT").append(HTTPData.CRLF);
		headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
		headers.append("Pragma: no-cache").append(HTTPData.CRLF);
		headers.append("Content-Type: text/xml; charset=utf-8").append(HTTPData.CRLF + HTTPData.CRLF);
		
		/** data part */
		out = new DataOutputStream(out);
		
		/** send headers */
		out.write(headers.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
		//out.flush();
		
		/** generate XML document */
		StringBuffer XMLResponse = new StringBuffer();
		XMLResponse.append("<?xml version=\"1.0\" ?><root>").append(HTTPData.CRLF);
		
		try {
			if(mode.equals("set") && !admins.contains(sid)) {
				admins.add(sid);
				XMLResponse.append("<ack>set</ack>").append(HTTPData.CRLF);
			}
			else if (mode.equals("reset") && admins.contains(sid)) {
				admins.remove(sid);
				XMLResponse.append("<ack>reset</ack>").append(HTTPData.CRLF);
			}
		} catch (Exception e) {
			XMLResponse.append("<ack>failed</ack>").append(HTTPData.CRLF);
		}
		
		XMLResponse.append("</root>");
		
		/** send XML response */
		out.write(XMLResponse.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING) );/** Write it to client output stream */
		out.flush();      /** Remember to flush output buffer */
		//System.err.println(XMLResponse.toString());
	}

	/**
     *  Sends all entries in users or proposals <code>Hashtable</code> to the client or,
     *  in the case a client requested the status information, his status entry in the users <code>Hashtable</code>,
     *  all in the form of a XML document.
     *  
     *  @param out is the client's <code>OutputStream</code>
     *  @param topic is the kind of information to be sent
     *  @param sid is the client's session ID
     */
	public void send (OutputStream out, String topic, String sid) throws IOException {
    	
		/** header part */
		
		StringBuffer headers = new StringBuffer();
		
		/** generate response headers,
		 *  add Cache-Control header so that the response won't be cached by the client,
		 *  assign a XML content type since the data is sent as XML document */
		
		headers.append("HTTP/1.1 200").append(HTTPData.CRLF);
		headers.append("Expires: Mon, 26 Jul 1997 05:00:00 GMT").append(HTTPData.CRLF);
		headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
		headers.append("Pragma: no-cache").append(HTTPData.CRLF);
		headers.append("Content-Type: text/xml; charset=utf-8").append(HTTPData.CRLF + HTTPData.CRLF);
		
		out = new DataOutputStream(out);
		
		/** send headers */
		out.write(headers.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
		//out.flush();
		
		/** generate XML document */
		StringBuffer XMLResponse = new StringBuffer();
		XMLResponse.append("<?xml version=\"1.0\" ?><root>").append(HTTPData.CRLF);
		
		/** if user request send all registered users 
		 *  together with their session ID and status */
		if (topic.equals("users")) {
			for (Iterator e = users.entrySet().iterator(); e.hasNext();) {
		
		        Entry me 			= (Entry) e.next();
		        String identifier 	= (String) me.getKey();
		        if (null == identifier) continue;
		        String status 		= ((String[]) me.getValue()) [0];
		        XMLResponse.append("<user>").append(HTTPData.CRLF);
		        XMLResponse.append("<sid>" + identifier + "</sid>").append(HTTPData.CRLF);
		        XMLResponse.append("<status>" + status + "</status>").append(HTTPData.CRLF);
		        XMLResponse.append("</user>").append(HTTPData.CRLF);
		    }
		}
		/** if proposal request send all proposals made to the client
		 *  referenced by the proposer's session ID */
		else if (topic.equals("proposals")) {
			/** retrieve the user's proposals ArrayList
			 *  create a new one if not available */
			ArrayList pproposals;
			if (proposals.containsKey(sid))
				pproposals = (ArrayList) proposals.get(sid);
			else
				pproposals = new ArrayList(); 
			
			/** for each entry in pproposals ArrayList create proposal element */
			for (int i=0; i<pproposals.size(); i++) {
				XMLResponse.append("<proposal>").append(HTTPData.CRLF);
	        	XMLResponse.append("<sid>" + pproposals.get(i) + "</sid>").append(HTTPData.CRLF);
	        	XMLResponse.append("</proposal>").append(HTTPData.CRLF);
			}
		}
		/** if status request send the client's status and, in the case
		 *  the user is participating in a shared session, his partner's session ID */
		else if (topic.equals("status")) {
			XMLResponse.append("<status>" + ((String[])users.get(sid))[0] + "</status>").append(HTTPData.CRLF);
			if (((String[])users.get(sid))[0].equals("online")) {
				String psid = ((String[]) partners.get(sid)) [0];
				XMLResponse.append("<psid>" + psid + "</psid>").append(HTTPData.CRLF);
			} else
				XMLResponse.append("<psid/>").append(HTTPData.CRLF);
				
		}
		
		XMLResponse.append("</root>");
		
		/** send XML response */
		out.write(XMLResponse.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING) );/** Write it to client output stream */
		out.flush();      /** Remember to flush output buffer */
		//if (topic.equals("status")) System.err.println(XMLResponse.toString());
    }
	
	/** Terminator function: terminates a session by setting the participating
	 *  clients offline and by removing them from partners <code>Hashtable</code>.
	 * 
	 *  @param out is the client's/terminator's <code>OutputStream</code>
	 * 	@param terminator is the user terminating the current session 
	 */
	public void endSession(OutputStream out, String terminator) throws IOException {
		
		/** retrieve the terminator's partner.
		 *  The partner is specified by the first entry 
		 *  in the teminator's partners array */
		String partner = ((String[]) partners.get(terminator)) [0];
		
		/** first, set both offline */
		setUserStatus(terminator, "offline");
		setUserStatus(partner, "offline");
		
		/** remove both from partners Hashtable */
		partners.remove(terminator);
		partners.remove(partner);
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
		
	}
	
	/** Registers that a shared session window was determined by a client's JavaScript.
	 * 
	 * @param out is the client's <code>OutputStream</code>
	 * @param user is the client's session ID
	 * @throws <code>IOException</code>
	 */
	public void setWindowNameSet(OutputStream out, String user) throws IOException {
		/** get the user's array from users Hashtable */
		String[] userArray = (String[])users.get(user);
		/** set flag */
		userArray[2] = "true";
		/** put array back into users Hashtable */
		users.put(user, userArray);
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
	}
	
	/** Sets a user's status.
	 * 
	 * @param sid is the user's session ID
	 * @param status is the new status
	 */
	private void setUserStatus(String sid, String status) {
		String[] userArray = (String[])users.get(sid);
		userArray[0] = status;
		users.put(sid, userArray);
	}
	
	/** Updates a user's "last accessed"-timestamp.
	 * 
	 * @param sid is the user's session ID
	 * @param ms is the new timestamp
	 */
	public void updateUserTS(String sid, String ms) {
		String[] userArray = (String[])users.get(sid);
		userArray[1] = ms;
		users.put(sid, userArray);
	}
	
	/** Accepter function: sets the proposer's and the accepter's status in <code>Hashtable</code>
	 *  users "online" and creates shared browsing partner entries in the partners <code>Hashtable</code>.
	 *  For each participating user an array is stored with his partner's session ID and a flag 
	 *  which indicates whether the partner finally confirmed to participate in the session.
	 *  Finally, the method hands over the confirmation process to function <code>checkFinalAck</code>.
	 * 
	 * @param out is the accepter's/client's <code>OutputStream</code>
	 * @param accepter is the client which was proposed a shared session
	 * @param proposer is the user which proposed a shared session
	 * @throws <code>IOException</code>
	 */
	public void acceptProposal(OutputStream out, String accepter, String proposer) throws IOException {
		
		/** rm) delete this proposal from all admins' proposals ArrayLists
		 *  except the accepter's one */
		for (int i = 0; i < admins.size(); i++) {
			/** retrieve the admin's proposals ArrayList */
			if (!admins.get(i).equals(accepter) && proposals.containsKey(admins.get(i))) {
				ArrayList pproposals = (ArrayList) proposals.get(admins.get(i));
				if (pproposals!=null && pproposals.contains(proposer)) {
					pproposals.remove(proposer);
					
					if (pproposals.isEmpty())
						proposals.remove(admins.get(i));
					else
						proposals.put(admins.get(i), pproposals);
				}
			}
		}
		
		/** for each user put his partner into partners Hashtable and set
		 *  the user's ack-flag true,
		 *  leave sd empty, define name of events/messages ArrayList as the proposer's session ID */
		String[] proposerArray	= {accepter,"true","", proposer};
		partners.put(proposer, proposerArray);
		/** leave partner-flag in accepter array false, since 
		 *  thread is waiting for final ack from proposer */
		String[] accepterArray	= {proposer,"false","", proposer};
		partners.put(accepter, accepterArray);
		
		/** wait and check if proposer is still available */
		checkFinalAck(out, accepter, proposer, 0);
		
	}
	
	/** Accepter function: periodically performs a confirmation check whether proposer
	 *  is still interested in participating in a shared session with the accepter. If the final confirmation
	 *  flag is set "true" in the accepter's partners array in time (according to
	 *  timeout index) by the proposer, a positive acknowledgement is triggered
	 *  (function sendAck), otherwise a negative one. 
	 * 
	 * @param out is the accepter's/client's <code>OutputStream</code>
	 * @param accepter is the client which was proposed a shared browse
	 * @param proposer is the user which proposed a shared browse
	 * @param timeouts is the amount of performed timeouts during the confirmation process
	 * @throws <code>IOException</code>
	 */
	private void checkFinalAck(OutputStream out, String accepter, String proposer, int timeouts) throws IOException {
		
		String[] accepterArray = (String[]) partners.get(accepter);
		
		/** if proposer didn't respond yet */
		if(accepterArray[1].equals("false")) {
			/** periodical check */
			if(timeouts<2) {
				//System.err.print(timeouts);
				try {
					Thread.sleep(1000);
				} catch (InterruptedException e) {}
				checkFinalAck(out, accepter, proposer, ++timeouts);
			} 
			/** if proposer isn't available anymore */
			else {
				
				/** remove both users from partners Hashtable */
				partners.remove(proposer);
				partners.remove(accepter);
				
				/** remove proposal */
				
				/** retrieve the accepter's proposals ArrayList */
				ArrayList pproposals = (ArrayList) proposals.get(accepter);
				
				/** remove the proposal from accepter's proposals ArrayList */
				if(pproposals!=null && pproposals.contains(proposer))
						pproposals.remove(proposer);
				
				/** if proposals ArrayList is empty remove accepter from proposals Hashtable,
				 *  otherwise re-insert decreased proposals ArrayList as value in proposals Hashtable */
				if (pproposals.isEmpty())
					proposals.remove(accepter);
				else
					proposals.put(accepter, pproposals);
				
				/** send accepter a negative acknowledgement */
				sendAck(out, accepter, proposer, "negative");
			}
		} else {
			
			/** sb) remove accepter from proposals Hashtable
			 *  (i.e. remove all proposals in order to let all other
			 *  proposers know that he's already occupied/ reject all other)
			 *  rm) do not remove accepter's pproposals since this is not neccessary */
			if(!admins.contains(accepter)) proposals.remove(accepter);
			/** rm) only remove proposal from list */
			else {
				/** retrieve the accepter's proposals ArrayList */
				ArrayList pproposals = (ArrayList) proposals.get(accepter);
				
				/** remove proposal from accepter's proposals ArrayList */
				pproposals.remove(proposer);
				
				/** if proposals ArrayList is empty remove accepter from proposals Hashtable,
				 *  otherwise re-insert decreased proposals ArrayList as value in proposals Hashtable */
				if (pproposals.isEmpty())
					proposals.remove(accepter);
				else
					proposals.put(accepter, pproposals);
			}
			
			/** send accepter a positive acknowledgement */
			sendAck(out, accepter, proposer, "positive");
		}
	}
	
	/** Accepter function: removes a proposal from the accepter's proposals <code>ArrayList</code>.
	 *  In the case of remote monitoring mode, the proposal must be deleted from each admin's proposals list.
	 *  Otherwise (sb mode) it is removed from the accepter's list.
	 * 
	 * @param accepter is the client which was proposed a shared session, in the case of 
	 * remote monitoring mode, accepter is null
	 * @param proposer is the user which proposed a shared session and at the same time the proposal identifier
	 */
	public void rejectProposal(OutputStream out, String accepter, String proposer) throws IOException {
		
		/** rm) if accepter is null, remove proposal from each admin user's proposals list */
		if (accepter==null) {
			for (int i = 0; i < admins.size(); i++) {
				/** retrieve the admin's proposals ArrayList */
				ArrayList pproposals;
				if (proposals.containsKey(admins.get(i))) {
					pproposals = (ArrayList) proposals.get(admins.get(i));
					if(pproposals.contains(proposer)) {
						/** remove proposer from pproposals ArrayList */
						pproposals.remove(proposer);
						/** if proposals ArrayList is empty remove admin from proposals Hashtable,
						 *  otherwise re-insert proposals ArrayList as value in proposals Hashtable */
						if (pproposals.isEmpty())
							proposals.remove(admins.get(i));
						else
							proposals.put(admins.get(i), pproposals);
					}
				}
			}
		}
		/** sb) remove proposal from accepter's ArrayList */
		else {
		
			/** retrieve the accepter's proposals ArrayList */
			ArrayList pproposals = (ArrayList) proposals.get(accepter);
			
			/** remove proposal from proposals ArrayList */
			pproposals.remove(proposer);
			
			/** if proposals ArrayList is empty remove accepter from proposals Hashtable,
			 *  otherwise re-insert decreased proposals ArrayList as value in proposals Hashtable */
			if (pproposals.isEmpty())
				proposals.remove(accepter);
			else
				proposals.put(accepter, pproposals);
		}
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
	}
	
	/**
	 * Proposer function: examines if a proposal was accepted/rejected. Sends a notification which
	 * indicates the proposal status ("idle", "negative", "positive").
	 * 
	 * @param out is the proposer's/client's <code>OutputStream</code>
	 * @param proposer is the client which proposed a shared session
	 * @param accepter is the user which was proposed a shared session
	 * @throws <code>IOException</code>
	 */
	public void isProposalAccepted(OutputStream out, String proposer, String accepter) throws IOException {
		
		/** rm) retrieve accepter */
		if (accepter==null) {
			for (int i = 0; i < admins.size(); i++) {
				/** retrieve the admin's proposals ArrayList */
				ArrayList pproposals;
				if (proposals.containsKey(admins.get(i))) {
					pproposals = (ArrayList) proposals.get(admins.get(i));
					if(pproposals.contains(proposer)) {
						accepter = (String) admins.get(i);
						break;
					}
				}
			}
		}
		
		if (accepter!=null) {
		
			/** check if proposal was accepted:
			 *  1. if proposer was added to partners Hashtable
			 *  2. if proposal is still available in the accepter's proposal list (if not,
			 *  accepter rejected) */
			if (partners.containsKey(proposer) 
				/** if accepter's proposal list still available */
				&& proposals.containsKey(accepter)	
				/** in particular, if proposal still available in accepter's proposal list */ 
				&& ((ArrayList) proposals.get(accepter)).contains(proposer)) {
				
				String[] proposerArray = (String[]) partners.get(proposer);
				/** if accepter accepted */
				if(proposerArray[1].equals("true")) {
					/** set flag in the partner's partners Array "true" */
					String[] accepterArray = (String[]) partners.get(accepter);
					accepterArray[1] = "true";
					partners.put(accepter, accepterArray);
					
					/** put both online */
					setUserStatus(proposer, "online");
					setUserStatus(accepter, "online");
					
					/** send proposer a positive acknowledgement */
					sendAck(out, proposer, accepter, "positive");
				}
				else { /* not applicable */
					/** send proposer a negative acknowledgement */
					sendAck(out, proposer, accepter, "negative");
				}
			}
			/** proposal was rejected */
			else if (!proposals.containsKey(accepter) /** no proposals list left */	
				/** or proposal not available anymore in the accepter's proposal list */ 
				|| ( proposals.containsKey(accepter)
					&& !(((ArrayList) proposals.get(accepter)).contains(proposer)) ) ){
				
				//System.err.println("da hat was nicht geklappt");
				/** send proposer a negative acknowledgement */
				sendAck(out, proposer, accepter, "negative");
			}
			/** not yet accepted */
			else {
				/** send proposer an "idle" acknowledgement */
				sendAck(out, proposer, accepter, "idle");
			}
		}
		/** accepter is null */
		else {
			/** send proposer a negative acknowledgement */
			sendAck(out, proposer, accepter, "negative");
		}
	}
	
	/**
	 * Sends the client an acknowledgement in the form of a XML document which contains 
	 * the flag and the (potential) partner's session ID.
	 * 
	 * @param out is the client's <code>OutputStream</code>
	 * @param user is the requesting client
	 * @param partner is the client's (potential) shared browsing partner
	 * @param ack is the flag to be sent, either "positive", "negative", or "idle"
	 * @throws <code>IOException</code>
	 */
	public void sendAck(OutputStream out, String user, String partner, String ack) throws IOException {
		
		/** header part */
		
		StringBuffer headers = new StringBuffer();
		
		/** generate response headers,
		 *  add Cache-Control header so that the response won't be cached by the client,
		 *  assign a XML content type since the data is sent as XML document */
		
		headers.append("HTTP/1.1 200").append(HTTPData.CRLF);
		headers.append("Expires: Mon, 26 Jul 1997 05:00:00 GMT").append(HTTPData.CRLF);
		headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
		headers.append("Pragma: no-cache").append(HTTPData.CRLF);
		headers.append("Content-Type: text/xml; charset=utf-8").append(HTTPData.CRLF + HTTPData.CRLF);
		
		/** data part */
		out = new DataOutputStream(out);
		
		/** send headers */
		out.write(headers.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
		//out.flush();
		
		/** generate XML document */
		StringBuffer XMLResponse = new StringBuffer();
		XMLResponse.append("<?xml version=\"1.0\" ?><root>").append(HTTPData.CRLF);
		XMLResponse.append("<ack>" + ack + "</ack>").append(HTTPData.CRLF);
	    XMLResponse.append("<partner>" + partner + "</partner>").append(HTTPData.CRLF);
		XMLResponse.append("</root>");
		
		/** send XML data */
		out.write(XMLResponse.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING) );/** Write it to client output stream */
		out.flush();      /** Remember to flush output buffer */
		//System.err.println(XMLResponse.toString());
	}
	
	/**
	 *  Proposer function: generates a new proposal entry.
	 *  In the case of shared browsing mode the method appends it to the proposals 
	 *  ArrayList of the potential partner.
	 *  Otherwise (i.e. rm mode) it is assigned to the proposals <code>ArrayList</code> structures of all admins.
	 *  
	 *  @param proposer is the session ID of the proposal initiator and at the same 
	 *  time the proposal identifier in the accepter's proposals <code>ArrayList</code>
	 *  @param accepter is the session ID of the potential shared browsing partner; null in remote monitoring mode
	 */
	public void generateProposal(OutputStream out, String proposer, String accepter) throws IOException {
		/** first, check if accepter not already in proposals Hashtable
		 *  (referencing a proposal in the proposals Arraylist of another user)
		 *  (rm) not desired since admins shall not propose) */
		if (!containsValueInArraylists(proposals, accepter)) {
			
			/** if proposer was proposed himself a shared session
			 *  while he handled his own proposal, remove other proposal(s) first */
			if (proposals.containsKey(proposer)) {
				proposals.remove(proposer);
			}
			
			/** rm) if accepter null, add proposal to each admin user's proposals list */
			if (accepter==null) {
				for (int i = 0; i < admins.size(); i++) {
					/** retrieve the admin's proposals ArrayList
					 *  create a new one if not available */
					ArrayList pproposals;
					if (proposals.containsKey(admins.get(i)))
						pproposals = (ArrayList) proposals.get(admins.get(i));
					else
						pproposals = new ArrayList();
					
					/** if proposal not yet available */
					if(!pproposals.contains(proposer)) {
						/** append proposer to proposals ArrayList */
						pproposals.add(proposer);
						/** re-insert proposals ArrayList into proposals Hashtable */
						proposals.put(admins.get(i), pproposals);
					}
				}
			}
			/** sb) accepter specified */
			else {
				/** retrieve the accepter's proposals ArrayList
				 *  create a new one if not available */
				ArrayList pproposals;
				if (proposals.containsKey(accepter))
					pproposals = (ArrayList) proposals.get(accepter);
				else
					pproposals = new ArrayList();
				
				/** if proposal not yet available */
				if(!pproposals.contains(proposer)) {
					/** append proposer to proposals ArrayList */
					pproposals.add(proposer);
					/** re-insert proposals ArrayList into proposals Hashtable */
					proposals.put(accepter, pproposals);
				}
				
				/*for(int j=0; j<((ArrayList) proposals.get(accepter)).size();j++) {
					System.err.println(((ArrayList) proposals.get(accepter)).get(j));
				}*/
			}
		}
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
	}
	
	/** Examines if the specified value exists in any <code>ArrayList</code> contained by the
	 *  specified <code>Hashtable</code>.
	 *  
	 *  @param hashtable is the <code>Hashtable</code> to be examined
	 *  @param value is the string to be searched for
	 *  @return true if value exists, otherwise false
	 */
	protected boolean containsValueInArraylists(Hashtable hashtable, String value) {
		
		for (Iterator e = hashtable.entrySet().iterator(); e.hasNext();) {
			
	        Entry me 		= (Entry) e.next();
	        String user 	= (String) me.getKey();
	        if (null == user) continue;
	        ArrayList arraylist = (ArrayList) me.getValue();
	        if (arraylist.contains(value)) return true;
	    }
		
		return false;
	}
	
	/**
	 *  Prints the users <code>Hashtable</code> entries.
	 */
	public void printUsers() {
	    StringBuffer usersToPrint = new StringBuffer();
		
		for (Iterator e = users.entrySet().iterator(); e.hasNext();) {
	
	        Entry me 		= (Entry) e.next();
	        String user 	= (String) me.getKey();
	        if (null == user) continue;
	        String status 	= ((String[]) me.getValue()) [0];
	        usersToPrint.append(user).append(": ").append(status).append(HTTPData.CRLF);
	    }
		System.out.println("\nUsers in 'users' Hashtable with current status: ");
		System.out.println(usersToPrint);
	}
	
	/** Returns the users <code>Hashtable</code>.
	 * 
	 * @return the users <code>Hashtable</code>
	 */
	public Hashtable getUsers() {
		return users;
	}
	
	/** Returns the partners <code>Hashtable</code>.
	 * 
	 * @return the partners <code>Hashtable</code>
	 */
	public Hashtable getPartners() {
		return partners;
	}

	/** Returns the proposals <code>Hashtable</code>.
	 * 
	 * @return the proposals <code>Hashtable</code>
	 */
	public Hashtable getProposals() {
		return proposals;
	}
	
	/** Returns the admins <code>ArrayList</code>.
	 * 
	 * @return the admins <code>ArrayList</code>
	 */
	public ArrayList getAdmins() {
		return admins;
	}
}