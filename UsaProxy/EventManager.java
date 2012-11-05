import java.io.*;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Hashtable;

/** 
 *  Class EventManager manages the exchange of interactions occured in one of the
 *  collaborating browsers.
 *  <br><br>
 *  In the case of incoming events, they are appended to the corresponding 
 *  events list. If a client requests new events, those are forwarded.
 *  <br><br>
 *  In addition, it stores events to a log file.
 */
public class EventManager {
	
	/** Contains the events lists of all online pairs of users.
	  * An events <code>ArrayList</code> is addressed by
	  * the proposer's session ID. */
	private Hashtable	events;	
	
	/** UsaProxy parent instance which is neccessary 
	 *  for accessing the corresponding partners list. */
	private UsaProxy	usaProxy;		
	
	/** Constructor: creates an <code>EventManager</code> instance and a
	 *  new overall events <code>Hashtable</code>, which will be filled with the
	 *  individual event lists.
	 */
	public EventManager(UsaProxy usaProxy) {
		events 			= new Hashtable();
		this.usaProxy = usaProxy;
	}
	
	/**
     *  Adds events to the corresponding events <code>ArrayList</code>.
     *  
     *  @param out is the client's <code>OutputStream</code>.
     *  @param events contains the events to be appended.
     *  @param list specifies the common events list of the client and his shared session partner 
     *  (i.e. list is specified by the client's session ID who initiated the shared session)
     */
	public void append (OutputStream out, String events, String list) throws IOException {
		if (!this.events.containsKey(list)) this.events.put(list, new ArrayList());
		
		String[] eventsArray;
		/** first, split the single event entries */
		eventsArray = events.split("&xX");
		
		/** append all entries to the corresponding events list.
		 *  In the case of an occured load event, put the appended httptrafficindex (i.e. sd parameter value)
		 *  into the partner's sd field in his Partners Array (field specifying which recorded page this client is allowed to
		 *  request next)
		 */
		for (int m=0; m<eventsArray.length; m++) {
			
			/** append entry */
			appendEvent(eventsArray[m].replaceAll("&", " "), list);
			
			/** if load event, assign the specified httptrafficindex (i.e. sd) to the partner's sd field */
			if (HTTPData.getValue(eventsArray[m], "event").equals("load")) {
				/** retrieve sd and the user's session ID from event String */
				String sd 			= HTTPData.getValue(eventsArray[m], "sd");
				String sid 			= HTTPData.getValue(eventsArray[m], "sid");
				/** get the user's partner Array from partners Hashtable */
				String[] sidArray 	= (String[]) usaProxy.getUsers().getPartners().get(sid);
				/** the partner's session ID is stored at the first position */
				String psid			= sidArray[0];
				/** get the partner's partner Array from partners Hashtable */
				String[] partnerArray = (String[]) usaProxy.getUsers().getPartners().get(psid);
				/** set the exclusively requestable sd into the 3rd Array field (sd field) */
				partnerArray[2] = sd;
				/** put modified partnerArray back into partners Hashtable */
				usaProxy.getUsers().getPartners().put(psid, partnerArray);
			}
		}
		//for (int i=0; i<eventsArray.length; i++)
			//System.out.println(eventsArray[i]);
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
		
	}
	
	/**
	 *  Appends an event string to the corresponding events <code>ArrayList</code>
	 *  which is referenced in the overall events <code>Hashtable</code> by the 
	 *  string specified in list (i.e. the proposer's session ID).
	 * 
	 *  @param event is the string to be added
	 *  @param list specifies the common events list of the client and his shared session partner 
     *  (i.e. list is specified by the client's session ID who initiated the shared session)
	 */
	private void appendEvent(String event, String list) {
		/** get the respective ArrayList from events Hashtable referenced by list */
		ArrayList events = (ArrayList) this.events.get(list);
		/** append event */
		events.add(event);
		/** put modified list back into messages Hashtable */
		this.events.put(list, events);
	}
	
	/**
	 *  Deletes entry in events <code>Hashtable</code> specified by list.
	 *  
	 * 	@param list is the string which specifies the <code>ArrayList</code> to be removed
	 */
	public void deleteList(String list) {
		if (this.events.containsKey(list)) this.events.remove(list);
	}
	
	/**
     *  Writes exclusively log records to the log file.
     *  
     *  @param out is the client's <code>Outputstream</code>.
     *  @param data is the event string to be logged.
     *  @param client is the client's <code>Socket</code>.
     *  @param filename specifies the log file.
     */
	public synchronized void log (OutputStream out, String data, Socket client, String filename) {
    	
		/*"data" is the equivalent to "requestURL.getQuery()" so we can use HTTPData.getValue 
		 * to get some information*/
		
		String sid = HTTPData.getValue(data, "sid");
		String sd = HTTPData.getValue(data, "sd");
		String time = HTTPData.getValue(data, "time");
		
    	/** if client log request (else: serverdata log-request from proxy)*/
    	if(out!=null)
    		out = new DataOutputStream(out);
    	
    	try {
    		
    		/** Open a stream to the log file. */
			FileOutputStream fos = new FileOutputStream ( filename , true);
			
			/** retrieve the client's IP address */
			String clientIP = client.getInetAddress().getHostAddress();
			
			String[] dataArray;
			
			/** split data String into single event entries (entry seperator "&xX") */
			dataArray = data.split("&xX");
			data = "";
			
			
			/** append each entry to the final log String together with the related IP address */
			for (int m=0; m<dataArray.length; m++) {
				
				/** if entry not empty */
				if(dataArray[m].length()>0) {
					
					/** replace separators ("&") with spaces, leave attribute values escaped */
					dataArray[m] = dataArray[m].replaceAll("&", " ");
					System.out.println("Treating regular event");
					//TODO I will have to check if the event is "domchange" is being recorded in order to send it to logDOMChange
					if (dataArray[m].contains("domchange"))
					{
						System.out.println("There was a dom CHANGE!!!");
						logDOMChange(out, data, client, sd, sid, time);
						
					}
					
					/** append complete entry */
					data = data + clientIP + " " + dataArray[m] + HTTPData.CRLF;
				}
			}
			
			//System.out.println(data);
			fos.write(data.getBytes());
			fos.flush();
			fos.close();
			
			if(out!=null) {
				/** send 404 message in order to complete the request */
				SocketData.send404 (out);
			}

    	}
    	catch ( FileNotFoundException e ) { 
    		/** If log file doesn't exist, send 404 message. */
        	System.err.println("\nAn ERROR occured: log file not found:\n"
									+ e );
        	
        	/** Send 404 error message to client */
			PrintWriter outPrint = new PrintWriter(new OutputStreamWriter(out));
			outPrint.println("HTTP/1.0 404 ");            /** version and status code */
			outPrint.println();                           /** blank line */
			outPrint.flush();
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while logging:\n"
							+ ie );
        }
        
        /** notify waiting clients that log file is accessible */
		notifyAll();
    	
    }

	
	/**
     *  Sends all entries in events <code>ArrayList</code>, which have an index
     *  greater than "last" (parameter specified in event string),
     *  to the client in the form of a XML document.
     *  
     *  @param out is the client's <code>OutputStream</code>.
     *  @param event is the original request for events.
     */
	public void send (OutputStream out, String event, String list) throws IOException {
		
		/** retrieve last requested event entry id */
		String last 	= HTTPData.getValue(event, "last");
		int eventID 	= Integer.parseInt(last);
		
		/** generate new individual events list for this pair of clients if it doesn't exist yet */
		if (!this.events.containsKey(list)) this.events.put(list, new ArrayList());
		
		//String sid = HTTPData.getValue(event, "sid");
		
		/** get the respective ArrayList from events Hashtable referenced by list */
		ArrayList events = (ArrayList) this.events.get(list);
    	
		/** generate response headers,
		 *  add Cache-Control header so that the response won't be cached by the client,
		 *  assign a XML content type since events are sent as XML document */
		
		StringBuffer headers = new StringBuffer();
		
		headers.append("HTTP/1.1 200").append(HTTPData.CRLF);
		headers.append("Expires: Mon, 26 Jul 1997 05:00:00 GMT").append(HTTPData.CRLF);
		headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
		headers.append("Pragma: no-cache").append(HTTPData.CRLF);
		headers.append("Content-Type: text/xml; charset=utf-8").append(HTTPData.CRLF + HTTPData.CRLF);
		
		out = new DataOutputStream(out);
		
		/** send headers */
		out.write(headers.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
		
		/** generate XML document */
		StringBuffer XMLmessages = new StringBuffer();
		XMLmessages.append("<?xml version=\"1.0\" ?><root>").append(HTTPData.CRLF);
		
		/** if new events are available append them to the XML document*/
		if ((eventID+1)<events.size()) {
			
			/** max. last 5 entries */
			if(events.size()-(eventID+1)>5) eventID=events.size()-5;
			
			/** append each event specified by a couple of available properties:
			 *  the event type,
			 *  an offset value (used for relative mouse position), 
			 *  the related httptrafficindex (i.e. sd)
			 *  and the URL of the page the event occurred on,
			 *  size of the browser window (load/resize event), 
			 *  session ID,
			 *  id, dom path, x and y values, etc.*/
			for(int i=(eventID+1); i<events.size(); i++) {
				String eventEntry = (String)(events.get(i));
				
				/** retrieve the event type */
				String eventType 	= getValue(eventEntry, "event");
				/** retrieve offset attribute */
				String eventOffset 	= getValue(eventEntry, "offset");
				/** retrieve serverdata ID attribute */
				String eventSd 		= getValue(eventEntry, "sd");
				/** retrieve page attribute (load event) */
				String eventPage 	= getValue(eventEntry, "page");
				/** retrieve size attribute (resize event) */
				String eventSize 	= getValue(eventEntry, "size");
				/** retrieve session ID attribute */
				String eventSid 	= getValue(eventEntry, "sid");
				/** retrieve id attribute */
				String eventId 		= getValue(eventEntry, "id");
				/** retrieve dom attribute */
				String eventDom 	= getValue(eventEntry, "dom");
				/** retrieve y attribute (scroll event) */
				String eventY 		= getValue(eventEntry, "y");
				/** retrieve y attribute (scroll event) */
				String eventX 		= getValue(eventEntry, "x");
				/** retrieve field type attribute */
				String eventFieldType 	= getValue(eventEntry, "type");
				/** retrieve field value attribute */
				String eventValue 	= getValue(eventEntry, "value");
				/** retrieve field checked attribute */
				String eventChecked 	= getValue(eventEntry, "checked");
				/** retrieve field checked attribute */
				String eventSelected 	= getValue(eventEntry, "selected");
				
				/** create XML event element */
				XMLmessages.append("<event id=\"" + i + "\">").append(HTTPData.CRLF);
				XMLmessages.append("<type>" + eventType + "</type>").append(HTTPData.CRLF);
				if(eventOffset!=null) XMLmessages.append("<offset>" + eventOffset + "</offset>").append(HTTPData.CRLF);
				if(eventSd!=null) 	XMLmessages.append("<sd>" + eventSd + "</sd>").append(HTTPData.CRLF);
				if(eventPage!=null) XMLmessages.append("<page>" + eventPage + "</page>").append(HTTPData.CRLF);
				if(eventSize!=null)	XMLmessages.append("<size>" + eventSize + "</size>").append(HTTPData.CRLF);
				if(eventSid!=null)	XMLmessages.append("<sid>" + eventSid + "</sid>").append(HTTPData.CRLF);
				if(eventId!=null)	XMLmessages.append("<id>" + eventId + "</id>").append(HTTPData.CRLF);
				if(eventDom!=null)	XMLmessages.append("<dom>" + eventDom + "</dom>").append(HTTPData.CRLF);
				if(eventY!=null)	XMLmessages.append("<y>" + eventY + "</y>").append(HTTPData.CRLF);
				if(eventX!=null)	XMLmessages.append("<x>" + eventX + "</x>").append(HTTPData.CRLF);
				if(eventFieldType!=null)	XMLmessages.append("<fieldtype>" + eventFieldType + "</fieldtype>").append(HTTPData.CRLF);
				if(eventValue!=null)	XMLmessages.append("<value>" + eventValue + "</value>").append(HTTPData.CRLF);
				if(eventChecked!=null)	XMLmessages.append("<checked>" + eventChecked + "</checked>").append(HTTPData.CRLF);
				if(eventSelected!=null)	XMLmessages.append("<selected>" + eventSelected + "</selected>").append(HTTPData.CRLF);
				XMLmessages.append("</event>").append(HTTPData.CRLF);
			}
		}
		XMLmessages.append("</root>");
		
		/** send XML response */
		out.write(XMLmessages.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING) );/** Write it to client output stream */
		out.flush();      /** Remember to flush output buffer */
		//System.err.println(XMLmessages.toString());
    	
    }
	
	/** Returns the events <code>Hashtable</code>.
	 *  
	 * @return the events <code>Hashtable</code>
	 */
	public Hashtable getEvents() {
		return events;
	}
	
	/** Retrieves the value of the specified parameter from the 
	 *  event string. If none was appended, it returns null.
	 *  
	 *  @param event is the string to be examined
	 *  @param parameter is the attribute to be searched for in the event string
	 */
	public String getValue(String event, String parameter) {
		int start; // the start index
		if (event==null) return null;
		
		/** if attribute exists retrieve start index (blank neccessary since id= included in sid=)*/
		if(event.indexOf(" " + parameter + "=")>-1)
			start		= event.indexOf(" " + parameter + "=")+ 2 + parameter.length();
		else start = -1;
		
		/** if attribute exists retrieve end index and return the value */
		if (start!=-1) {
			int end			= event.indexOf(" ", start);
			if (end==-1) end = event.length();
			/** retrieve value according to start and end position */
			String attValue 	= event.substring(start,end);
			return attValue;
		}
		else {
			return null;
		}
	}

	/** Records the specific event of DOM change, the folder and name of file will depend on the values
	 * of sid and sd. A timestamped file will hold a screenshot of the current DOM 
	 *  
	 *  @param event is the string to be examined
	 *  @param parameter is the attribute to be searched for in the event string
	 */
	
	public void logDOMChange(OutputStream out, String data, Socket client, String sd, String sid, String time){
		
		
		/** if client log request (else: serverdata log-request from proxy)*/
    	if(out!=null)
    		out = new DataOutputStream(out);
    	
    	try {
    		
    		/** Create a folder with the session ID if it doesn't exist */ 
    		File dir = new File(sid);
    		if (!dir.exists()) {
    			dir.mkdir();
    		}
    		File filename = new File(dir, sd + ";" + time);
    		
    		/** Open a stream to the log file. */
			FileOutputStream fos = new FileOutputStream ( filename , true);
			
			/** retrieve the client's IP address */
			String clientIP = client.getInetAddress().getHostAddress();
			
		
			/** append complete entry */
			data = data + clientIP + " " + data + HTTPData.CRLF;


			//System.out.println(data);
			fos.write(data.getBytes());
			fos.flush();
			fos.close();
			
			if(out!=null) {
				/** send 404 message in order to complete the request */
				SocketData.send404 (out);
			}

    	}
    	catch ( FileNotFoundException e ) { 
    		/** If log file doesn't exist, send 404 message. */
        	System.err.println("\nAn ERROR occured: log file not found:\n"
									+ e );
        	
        	/** Send 404 error message to client */
			PrintWriter outPrint = new PrintWriter(new OutputStreamWriter(out));
			outPrint.println("HTTP/1.0 404 ");            /** version and status code */
			outPrint.println();                           /** blank line */
			outPrint.flush();
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while logging:\n"
							+ ie );
        }
        
        /** notify waiting clients that log file is accessible */
		notifyAll();
	}
	
}
