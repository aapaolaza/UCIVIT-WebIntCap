package usaproxy;
import java.io.*;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Hashtable;

/**  
 *  Class <code>ChatManager</code> manages the exchange of chat messages between 
 *  two clients which collaborate in a shared session. For each pair of users an 
 *  <code>ArrayList</code> structure is created which stores the exchanged messages.
 *  The lists are stored in an overall messages <code>Hashtable</code>.
 *  <br><br>
 *  In the case of an incoming message, it is appended to the corresponding 
 *  messages list. If a client requests new messages, they are delivered.
 */
public class ChatManager {
	
	/** Contains the messages <code>ArrayList</code> structures of all online pairs of users.
	  * The respective messages list is addressed by
	  * the proposer's session ID. */
	private Hashtable	messages;
	
	/** Constructor: creates a ChatManager instance and a
	 *  new overall messages <code>Hashtable</code>, which will be filled with the
	 *  individual message lists.
	 */
	public ChatManager() {
		messages = new Hashtable();
	}
	
	/** Processes a "chat" request. Messages are either appended to the corresponding
	 *  messages list or, in the case new messages are requested, sent to the client.
	 *  
	 * @param out is the client's <code>OutputStream</code>
	 * @param client is the client's <code>Socket</code>
	 * @param message is the request URL query string containing the data to be examined
	 * @param list specifies the common messages list of the client and his shared session partner
	 * @throws <code>IOException</code>
	 */
	public void processRequest(OutputStream out, Socket client, String message, String list) throws IOException {
		/** if Hashtable messages doesn't yet contain an ArrayList 
		 *  specified by key list create a new one */
		if (!this.messages.containsKey(list)) this.messages.put(list, new ArrayList());
		
		/** if message contains a text parameter, the data is assumed to be appended.
		 *  Otherwise new messages are requested */
		if (message.indexOf("text=")>-1) append (out, client, message, list);
		else send (out, client, message, list);
	}
	
	/**
     *  Appends a message to the corresponding messages <code>ArrayList</code>.
     *  
     *  @param out is the client's <code>OutputStream</code>
     *  @param client is the client's <code>Socket</code>
     *  @param message is the data to be appended
     *  @param list specifies the common messages list of the client and his shared session partner
     */
	public void append (OutputStream out, Socket client, String message, String list) throws IOException {
		
		/** replace separators ("&") with spaces */
		message = message.replaceAll("&", " ");
		appendMessage(message, list);
		
		/** send 404 message in order to complete the request */
		SocketData.send404 (out);
	}
	
	/**
	 *  Appends message string to the corresponding <code>ArrayList</code>
	 *  which is referenced in the overall messages <code>Hashtable</code> by the 
	 *  list parameter (i.e. the proposer's session ID).
	 * 
	 *  @param message is the string to be added
	 *  @param list specifies the common messages list of the client and his shared 
	 *  session partner (i.e. the proposer's session ID)
	 */
	private void appendMessage(String message, String list) {
		
		/** get the respective ArrayList from messages Hashtable referenced by list */
		ArrayList messages = (ArrayList) this.messages.get(list);
		/** append message */
		messages.add(message);
		/** put modified list back into messages Hashtable */
		this.messages.put(list, messages);
	}
	
	/**
	 *  Deletes list from messages <code>Hashtable</code> specified by the parameter "list".
	 *  
	 * 	@param list is the string which specifies the <code>ArrayList</code> to be removed
	 */
	public void deleteList(String list) {
		if (this.messages.containsKey(list)) this.messages.remove(list);
	}
	
	/**
     *  Sends the client all entries in the <code>ArrayList</code> referenced by "list",
     *  which have an index greater than the "last" parameter
     *  in the message string.
     *  
     *  @param out is the client's <code>OutputStream</code>.
     *  @param client is the client's <code>Socket</code>.
     *  @param message is the original request query string which contains an 
     *  index specifying the last received message
     *  @param list specifies the common messages list of the client and his shared 
	 *  session partner (i.e. the proposer's session ID)
     */
	public void send (OutputStream out, Socket client, String message, String list) {
		
		/** retrieve last requested message id */
		String last 	= HTTPData.getValue(message, "last");
		int messageID 	= Integer.parseInt(last);
		
		/** get the respective ArrayList from messages Hashtable referenced by list */
		ArrayList messages = (ArrayList) this.messages.get(list);
    	
		try {
			
			/** generate response headers,
			 *  add Cache-Control header so that the response won't be cached by the client,
			 *  assign a XML content type since messages are sent as XML document */
			
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
			
			/** if new messages are available append them to the XML document */
			if ((messageID+1)<messages.size()) {
				
				/** max. last 10 entries (relevant in the case that a new page was loaded) */
				if(messages.size()-(messageID+1)>10) messageID=messages.size()-10;
				
				/** append each chat message specified by a 
				 *  text attribute and a session ID attribute */
				for(int i=(messageID+1); i<messages.size(); i++) {
					
					String messageEntry = (String)(messages.get(i));
					
					/** retrieve the message text */
					String messageText = getValue(messageEntry, "text");
					/** retrieve session ID attribute */
					String messageSid  = getValue(messageEntry, "sid");
					
					XMLmessages.append("<message id=\"" + i + "\">").append(HTTPData.CRLF);
					XMLmessages.append("<text>" + messageText + "</text>").append(HTTPData.CRLF);
					XMLmessages.append("<sid>" + messageSid + "</sid>").append(HTTPData.CRLF);
					XMLmessages.append("</message>").append(HTTPData.CRLF);
				}
			}
			XMLmessages.append("</root>");
			
			/** send XML data */
			out.write(XMLmessages.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING) );/** Write it to client output stream */
			out.flush();      /** Remember to flush output buffer */
			//System.err.println(XMLmessages.toString());
        }
        catch ( IOException e ) { 
        	System.err.println("\nAn ERROR occured while sending chat messages:\n"
							+ e );
        }
    	
    }
	
	/** Retrieves the value of the specified parameter from the 
	 *  message string. If none was appended, it returns null.
	 *  
	 *  @param message is the string to be examined
	 *  @param parameter is the attribute to be searched for in the message string
	 */
	public String getValue(String message, String parameter) {
		
		int start; // the start index
		if (message==null) return null;
		
		/** if attribute exists retrieve start index */
		if(message.indexOf(" " + parameter + "=")>-1)
			start		= message.indexOf(" " + parameter + "=")+ 2 + parameter.length();
		else start = -1;
		
		/** if attribute exists retrieve end index and return the value */
		if (start!=-1) {
			int end			= message.indexOf(" ", start);
			if (end==-1) end = message.length();
			/** retrieve value according to start and end position */
			String attValue 	= message.substring(start,end);
			return attValue;
		}
		else {
			return null;
		}
	}

}
