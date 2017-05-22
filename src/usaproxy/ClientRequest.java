package usaproxy;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Socket;
import java.net.SocketException;
import java.net.URL;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Calendar;

/**
 * UsaProxy - HTTP proxy for the tracking, logging, and the replay of user
 * interactions on websites in order to enable web-based collaboration. <br>
 * <br>
 * Copyright (C) 2006 Monika Wnuk - Media Informatics Group at the University of
 * Munich <br>
 * <br>
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version. <br>
 * <br>
 * Thread <code>ClientRequest</code> handles a single HTTP request.
 * <code>ClientRequest</code> parses and processes it according to the specified
 * action (e.g. file request, logging of usage data, regular request for a web
 * server object). It then either forwards the request or initiates any further
 * action. HTML responses are handled and augmented with special JavaScript.
 * Finally, the response headers and data are sent to the client.
 */
public class ClientRequest extends Thread {

	/** Associated parent proxy application. */
	private UsaProxy usaProxy;

	/**
	 * Manages the client <code>Socket</code>, streams, and the request headers.
	 */
	private SocketData client;

	/**
	 * Manages the server <code>Socket</code>, streams, and the response
	 * headers.
	 */
	private SocketData server;

	/** True if HTML response. */
	private boolean isHtmlStream;
	/** True if 404 response. */
	private boolean isNotFoundMessage;
	/** Storage for response data. */
	private StringBuffer data;
	/** Format is either "http://host/path" or "/path". */
	private String url;
	/** Like url, but complete URL. */
	private URL requestURL;

	/**
	 * Index which suffixes the txt-file to which request headers and response
	 * headers and data are stored to, and which is used as identifier in the
	 * httpTraffic log entry.
	 */
	private int httpTrafficIndex;

	/**
	 * Timestamp of the form "2004-12-31,23:59:59" which is used as httptraffic
	 * log entry time and server-side start time for logging. The timestamp is
	 * set when first needed in <code>insertJavaScript()</code>.
	 */
	private String timeStamp;

	/**
	 * Constructor: creates a <code>ClientRequest</code> thread with a specified
	 * client <code>Socket and the deployed UsaProxy instance
	 * @throws SocketException 
	 */
	public ClientRequest(Socket socket, UsaProxy usaProxy) throws SocketException {

		this.client = new SocketData(socket);
		socket.setSoTimeout(10000);

		this.usaProxy = usaProxy;
		/** start this */
		start();
	}

	/**
	 * Gets the input and output stream of the client and invokes
	 * <code>processRequest()</code>. Finally, all sockets and streams are
	 * closed.
	 */
	public void run() {

		//System.out.println("STARTING thread number: " + threadId + "; at time: " + timeStampms());

		try {

			/** retrieve client communication streams */
			client.bindInputStream();
			client.bindOutputStream();

			/** parse request */
			processRequest(client.getIn());

		} catch (Exception e) {
			System.err
			.println("\nAn ERROR occured while negotiating with the server:\n"
					+ e);
			e.printStackTrace();

			ErrorLogging.logError("ClientRequest.java: run()",
					"ERROR occured while negotiating with the server",e);

		} finally {

			/** Close streams and sockets */
			try {
				client.closeInputStream();
				client.closeOutputStream();
				if (server != null)
					server.closeInputStream();
				/**
				 * server might not be initialized e.g. in case of log request
				 */
				if (server != null)
					server.closeOutputStream();
				client.closeSocket();
				if (server != null)
					server.closeSocket();
			} catch (Exception ex) {
				System.err
				.println("\nAn ERROR occured while closing streams and sockets");
				ex.printStackTrace();
			}
		}

		//System.out.println("ENDING thread number: " + threadId + "; at time: " + timeStampms());
	}

	/**
	 * Retrieves the request headers and examines them in order to determine the
	 * action which is intended to be performed. A web server request is
	 * directly forwarded to the server, and the response is accordingly
	 * enriched with JavaScript (if HTML data), and delivered. A
	 * "/usaproxylolo/" request is captured and locally processed. In the case
	 * of a "/remotemonitoring" resp. "/sharedbrowsing" request, the
	 * corresponding HTML file is enriched with JavaScript code and delivered.
	 * The HTTP request headers are appropriately modified.
	 * 
	 * @param in
	 *            is the client's <code>InputStream</code>.
	 * @throws <code>Exception</code>
	 */
	private void processRequest(InputStream in) throws Exception {

		String method = "";

		String clientIP = "";

		System.out.println("Request received");

		//InputStream inCopy = in;
		//printInput(inCopy);
		try {
			/** read in HTTP request headers */
			in = client.getHeaders().readHeaders(in);
			//in = client.getHeaders().readHeadersBufferedReader(in);

			/** Request URL processing */

			/** get request-line */
			url = (String) client.getHeaders().elementAt(0);

			clientIP = client.getSocket().getInetAddress().getHostAddress();

			if (url == null)
				return; // In case headers are empty

			/** display request besides the specified ones */
			int debugIndex = 0;
			if (url.indexOf("getusers") == -1 && url.indexOf("getstatus") == -1
					&& url.indexOf("chat") == -1
					&& url.indexOf("getproposals") == -1
					&& url.indexOf("getproposalAck") == -1
					/* && url.indexOf("log")==-1 */
					&& url.indexOf("getevents") == -1)

				// DEBUG
				// System.out.println(url);
				debugIndex = 200;
			if (debugIndex > url.length())
				debugIndex = url.length();

			ErrorLogging.logError("ClientRequest.java: processRequest()",
					url.substring(0, debugIndex), null);
			// client.getHeaders().printHeaders();

			/** iterative request-line detection in case url doesn't contain it */
			if (!(HTTPData.isRequestLine(url))) {
				for (int i = 0; i < client.getHeaders().size(); i++) {
					if (HTTPData.isRequestLine(client.getHeaders().keyAt(i)))
						url = client.getHeaders().keyAt(i);
				}
			}

			/** remove request line from headers stucture */
			try{
				client.getHeaders().remove(url);
			}catch (Exception e){
				//If the element "url" could not be found in the headers, it will trigger an exception
				ErrorLogging.logCriticalError("ClientRequest.java: processRequest()", "element " + url + " was not found in the headers", e);
			}

			try {
				/** retrieve request method */
				method = url.substring(0, url.indexOf(" ")).trim();

				/** crop method */
				url = url.substring(url.indexOf(" ")).trim();
			} catch (Exception e){
				ErrorLogging.logCriticalError("ClientRequest.java: processRequest()", 
						"A critical error occurred when splitting following input: \n "+ url 
						+ "\n From request: \n" +in , e);
			}

			/** crop HTTP version */
			if (url.toUpperCase().lastIndexOf("HTTP") >= 0)
				/** if HTTP version exists */
				url = url.substring(0, url.toUpperCase().lastIndexOf("HTTP"))
				.trim();
			else
				url = url.trim();

			/**
			 * set request URL and modify it corresponding to the deployed proxy
			 * mode
			 */
			usaProxy.getMode().setRequestURL(url,
					client.getHeaders().get(HTTPData.HEADER_HOST));
			requestURL = usaProxy.getMode().getRequestURL();

			/**
			 * add new request line to request headers hashtable with default
			 * HTTP/1.0
			 */
			client.getHeaders().add(0,
					usaProxy.getMode().getRequestLine(method, requestURL), "");

			/**
			 * check which action was requested. 1. request for page recording
			 * 2. request for remote monitoring resp. shared browsing page 3.
			 * /usaproxylolo/file request 4. chat request (get chat messages +
			 * store chat messages) 5. log request (log usage data) 6. request
			 * for remote events 7. end session request 8. set isWindowNameSet
			 * request (in case a window was defined as shared session window)
			 * 9. request for users 10. request for proposals 11. accept
			 * proposal request 12. reject proposal request 13. propose request
			 * 14. request for proposal acknowledgement 15. request for user
			 * status 16. set admin request 17. regular web server request
			 */

			/*********************************************************************
			 * 3. /usaproxylolo/file request: if request path starts with
			 * "/usaproxylolo/file/ UsaProxy directly serves the requested file
			 * In addition, the session cookie is queried in the case that
			 * proxyscript.js is requested
			 * */
			if (requestURL.getPath().indexOf("/usaproxylolo/file/") > -1) {

				/** retrieve file name */
				int startFile = requestURL.getPath().indexOf(
						"usaproxylolo/file/") + 18;
				String fileName = requestURL.getPath().substring(startFile);

				/** define parameters for proxyscript.js file delivery */
				String sessionID = ""; // cookie session ID
				boolean isWindowNameSet = false; // flag: if session window was
				// already defined by client
				int lastLogEntry = -1; // last event log entry that was fetched
				String remoteMonitorer = ""; // defines if user is the
				// monitoring party in a shared
				// session
				boolean isAdmin = false; // defines if user is registered for
				// Live Support assistance
				String status = ""; // holds the user's status (online/offline)
				String partnerSID = ""; // holds the user's collaborator

				/**
				 * if special UsaProxy JavaScript is ordered check if request is
				 * valid (match UsaProxy ID to query param)
				 */
				if (fileName.equals("proxyscript.js")) {

					/**
					 * check for UsaProxy ID specification in the query part of
					 * the request URL ("id="). if specified ID doesn't comply
					 * with the UsaProxy ID of this instance, deny request
					 */
					String id = HTTPData.getValue(requestURL.getQuery(), "id");
					/**
					 * if UsaProxy id doesn't comply with the query id, send
					 * forbidden status
					 */
					if (id != null && !id.equals(usaProxy.getId())) {
						/** send "403" Forbidden response */
						SocketData.send403(
								new DataOutputStream(client.getOut()),
								"Wrong UsaProxy ID !");
						return;
					}

					/** Retrieve session ID */
					// We got rid of the cookie, now the sessionID will be
					// recovered via request url
					// sessionID = getCookieSessionID();
					sessionID = getCookieSessionIDFromRequest();

					/**
					 * Check if session window was already defined by client and
					 * assign the value
					 */
					String windowFlag_field = ((String[]) (usaProxy.getUsers()
							.getUsers().get(sessionID)))[2];
					if (windowFlag_field.equals("true"))
						isWindowNameSet = true;

					/**
					 * retrieve last log entry: assign last index in
					 * corresponding events list if list exists (if partners
					 * Hashtable contains an entry for this user). Otherwise,
					 * leave lastLogEntry=-1.
					 * 
					 * In addition for remote monitoring, define if client is
					 * the monitoring or the monitored partner. Field
					 * "remoteMonitorer" is specified by a String value ("true",
					 * "false", and "not defined" (remote monitoring disabled)).
					 * 
					 * Furthermore, the collaborator's session ID is assigned
					 */
					if (usaProxy.getUsers().getPartners()
							.containsKey(sessionID)) {

						/**
						 * retrieve the list identificator of the corresponding
						 * events list which is specified by the session
						 * initiator's sessin ID
						 */
						String listName_field = ((String[]) usaProxy.getUsers()
								.getPartners().get(sessionID))[3];
						/**
						 * lastLogEntry is defined as the last position in the
						 * collaborators' events list which is held in the
						 * global events Hashtable
						 */
						lastLogEntry = ((ArrayList) usaProxy.getEventManager()
								.getEvents().get(listName_field)).size() - 1;

						/** retrieve the collaborator's sid */
						partnerSID = ((String[]) (usaProxy.getUsers()
								.getPartners().get(sessionID)))[0];
					}

					/** retrieve the client's status (online/offline) */
					status = ((String[]) (usaProxy.getUsers().getUsers()
							.get(sessionID)))[0];
				}

				/**
				 * initialize file delivery together with the identified
				 * parameters
				 */
				usaProxy.getFileSender().send(
						new DataOutputStream(client.getOut()), fileName,
						sessionID, status, partnerSID, lastLogEntry,
						usaProxy.getLogMode());
				
				//DataOutputStream out, String filename, String sessionID,String status, String partnerSID, int lastLogEntry, String logMode
			}

			/*********************************************************************
			 * 5. log request (log usage data): if user is verified to
			 * collaborate within a shared session the new usage data is
			 * appended by the EventManager instance
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/log")) {
				System.out.println("/usaproxylolo/log");
				System.out.println(requestURL.getQuery());
				// /DEBUG TEST
				//String[] dataArray = requestURL.getQuery().split("&xX");

				// DEBUG
				// System.out.println("\n\n\n\n\n\nClientRequest processRequest log  Received new data"
				// +"Parsing a total of " + dataArray.length + "elements");
				// System.out.println(requestURL.getQuery() + "\n\n\n\n\n\n");

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");

				System.out.println("Before reading content");
				System.out.println("The request was:" + requestURL.getQuery());
				System.out.println("Before reading POST");

				System.out.println("The POST content was:");
				String postData = readInputStreamToString(in);
				System.out.println(postData);
				System.out.println("Logging information for session: " + sid);

				/** ascertain that parameter actually was applied */
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * if full logging enabled store entries in log file
				 */
				if (usaProxy.isLogging()
						&& !usaProxy.getLogMode().equals("pagereq")
						&& requestURL.getQuery().indexOf("lastId=") == -1)
					/*Old version using GET data instead of post
					 * usaProxy.getEventManager().log(client.getOut(),
							requestURL.getQuery(), clientIP, client.getSocket());*/
					usaProxy.getEventManager().log(client.getOut(),
							postData, clientIP, client.getSocket());
			}


			///Respond to the client
			try{
				SocketData.send200(
						new DataOutputStream(client.getOut()));
				System.out.println(" 200 returned ");
			}
			catch(Exception e){
				System.out.println("could not return 200");
			}

		} catch (IOException e) {
			// e.printStackTrace();
			if (client.getSocket() != null) {
				ErrorLogging.logCriticalError("ClientRequest.java/process Request","\nAn IO ERROR occured while processing request:\n"
						+ client.getHeaders().elementAt(0)
						+ " from client "
						+ client.getSocket().getInetAddress()
						.getHostName(),e);
			} else {
				ErrorLogging.logCriticalError("ClientRequest.java/process Request",
						"\nAn IO ERROR occured while processing request", e);
			}
		}

	}

	/**
	 * Returns the client's session ID. Examines first if a session ID was
	 * transmitted with the "Cookie" HTTP request header. Otherwise, a new
	 * random session ID is generated.
	 * 
	 * @return the session ID string
	 */
	private String getCookieSessionID() {

		String sessionID = "";
		/** try to retrieve Cookie HTTP header content */
		if (client.getHeaders().containsKey(HTTPData.HEADER_COOKIE))
			sessionID = client.getHeaders().get(HTTPData.HEADER_COOKIE);

		/**
		 * if cookies were transmitted, check if usaproxylolo cookie exists then
		 * retrieve the transmitted session ID String
		 */
		if (sessionID.indexOf(HTTPData.SESSION_ID_NAME) > -1) {

			/**
			 * session ID starts after the variable name (SESSION_ID_NAME) and
			 * "="
			 */
			int startPos = sessionID.indexOf(HTTPData.SESSION_ID_NAME)
					+ HTTPData.SESSION_ID_NAME.length() + 1;
			int endPos = (sessionID.indexOf(";", startPos) > -1) ? sessionID
					.indexOf(";", startPos) : sessionID.length();
					sessionID = sessionID.substring(startPos, endPos).trim();

		} else {
			/** If session ID wasn't set yet, generate a 12-char random String */
			sessionID = generateSessionID(12);
		}

		/**
		 * if session ID not yet registered in Users Hashtable, add user with an
		 * offline status, a current timestamp, and a "false" flag which
		 * specifies that no session browser window was yet assigned
		 */
		if (!(usaProxy.getUsers().getUsers().containsKey(sessionID))) {
			String ms = "" + (int) Calendar.getInstance().getTime().getTime();
			String[] userArray = { "offline", ms, "false" };
			usaProxy.getUsers().getUsers().put(sessionID, userArray);
		}

		return sessionID;
	}

	private String getCookieSessionIDFromRequest() {

		/** try to retrieve session ID from request url */
		String sessionID = HTTPData.getValue(requestURL.getQuery(), "sid");
		ErrorLogging.logError("ClientRequest.java:getCookieSessionIDFromRequest()",
				"The request was:" + requestURL.getQuery(), null);
		ErrorLogging.logError("ClientRequest.java:getCookieSessionIDFromRequest()",
				"Session ID in the request was:" + sessionID, null);

		if (sessionID == null || sessionID.equals("null")
				|| sessionID.equals("")) {
			ErrorLogging.logError("ClientRequest.java:getCookieSessionIDFromRequest()",
					"Generating a new ID", null);
			sessionID = generateSessionID(12);
		} else
			ErrorLogging.logError("ClientRequest.java:getCookieSessionIDFromRequest()",
					"There was no need for a new ID",null);

		/**
		 * if session ID not yet registered in Users Hashtable, add user with an
		 * offline status, a current timestamp, and a "false" flag which
		 * specifies that no session browser window was yet assigned
		 */
		if (!(usaProxy.getUsers().getUsers().containsKey(sessionID))) {
			String ms = "" + (int) Calendar.getInstance().getTime().getTime();
			String[] userArray = { "offline", ms, "false" };
			usaProxy.getUsers().getUsers().put(sessionID, userArray);
		}

		return sessionID;

	}

	/**
	 * Retrieves the response headers and data and examines them. If HTML was
	 * sent, response is augmented with Javascript code (in the form of a
	 * reference string) and subsequently sent to the client. Otherwise, the
	 * response is forwarded to the client unaltered. Method modifies and adds
	 * headers (e.g. modifies the content length, adds a "Via" header).
	 * 
	 * @param in
	 *            is the server's <code>InputStream</code>.
	 */
	private void processResponse(InputStream in) {

		/** Read in response headers */
		try {
			server.setHeaders(new Headers());
			in = server.getHeaders().readHeaders(in);

		} catch (IOException e) {
			if (server.getSocket() != null) {
				System.err
				.println("\nAn ERROR occured while reading response headers: "
						+ "from server "
						+ server.getSocket().getInetAddress()
						.getHostName() + ":\n" + e);

				ErrorLogging.logError("ClientRequest.java/processResponse()",
						"ERROR occured while reading response headers",e);
			} else {
				System.err
				.println("\nAn ERROR occured while reading response headers: "
						+ "\n" + e);

				ErrorLogging.logError("ClientRequest.java: processResponse()",
						"ERROR occured while reading response headers",e);
			}
		}

		/**
		 * If a real web server was accessed or in the case of a
		 * remotemonitoring resp. sharedbrowsing page request, perform some
		 * regular verifications (e.g. add VIA header, Cache-Control).
		 * 
		 * Otherwise (if server = UsaProxy) send unmodified recorded response
		 * stream (modifications were already done when original response was
		 * stored in corresponding httpTraffic file)
		 * */
		if ((server.getSocket().getLocalAddress() != usaProxy.getIP() && server
				.getSocket().getPort() != usaProxy.getPort())
				/**
				 * if original (<> usaproxyload) remote monitoring page
				 * requested
				 */
				|| (requestURL.getPath().startsWith("/remotemonitoring") && (requestURL
						.getQuery() != null ? requestURL.getQuery().indexOf(
								"usaproxyload&") == -1 : true))
				|| (requestURL.getPath().startsWith("/sharedbrowsing") && (requestURL
						.getQuery() != null ? requestURL.getQuery().indexOf(
								"usaproxyload&") == -1 : true))) {

			/** add VIA-header in the form Via: <hostname> (UsaProxy/2.0) */
			try {
				java.net.InetAddress i = java.net.InetAddress.getLocalHost();
				String newVia = "";
				if (server.getHeaders().containsKey(HTTPData.HEADER_VIA))
					newVia = (String) server.getHeaders().get(
							HTTPData.HEADER_VIA)
					+ ", ";
				newVia = newVia + i.getHostName() + " (UsaProxy/2.0)";
				server.getHeaders().put(HTTPData.HEADER_VIA, newVia);
			} catch (UnknownHostException e1) {
				System.err
				.println("\nAn ERROR occured while reading generating VIA header: "
						+ e1);
			}

			/**
			 * add Cache-Control header so that each page delivered by UsaProxy
			 * won't be cached by the client
			 */
			server.getHeaders().put(HTTPData.HEADER_CACHE_CONTROL,
					"no-cache, must-revalidate");

			/** Additional header for cache control */
			server.getHeaders().put(HTTPData.HEADER_EXPIRES,
					HTTPData.EXPIRES_DATE);

			// if(UsaProxy.DEBUG) System.err.println("Status line: " + (String)
			// server.getHeaders().elementAt(0) + "\n");

			/** retrieve status line */
			String status = (String) server.getHeaders().elementAt(0); // get
			// status-line
			if (!(HTTPData.isStatusLine(status))) { // if first header !=
				// status-line search
				// status-line

				for (int j = 0; j < server.getHeaders().size(); j++) {
					if (HTTPData.isStatusLine(server.getHeaders().keyAt(j)))
						status = server.getHeaders().keyAt(j);
					break;
				}
			}

			/**
			 * Check if html is being transmitted if content type "text/html"
			 * resp. "text/xhtml" and if status code = 200 (might also be e.g.
			 * 304 not modified)
			 */
			String contentType = (String) server.getHeaders().get(
					HTTPData.HEADER_CONTENT_TYPE);
			if ((contentType != null) && HTTPData.isHTMLType(contentType)
					&& (status != null) && (status.indexOf("200") != -1))
				isHtmlStream = true;
			else
				isHtmlStream = false;

			/** Check if 404 Not Found response */
			if ((status != null) && (status.indexOf("404") != -1))
				isNotFoundMessage = true;
			else
				isNotFoundMessage = false;

			/** If successful HTML response add JavaScript */
			if (isHtmlStream && (isNotFoundMessage == false))
				in = insertJavaScript(in);
		}

		/** print all headers in OrderedHashtable server.getHeaders() */
		// if (UsaProxy.DEBUG) { server.getHeaders().printHeaders(); }

		/** transmit response HTTP headers to the client */
		sendHeaders(client.getOut());

		sendResponse(in);
		/**
		 * transmit either all data or, in the case of html-data, the rest after
		 * the proxyScript-part
		 */
	}

	/**
	 * Parses the HTML code and inserts a JavaScript reference string after the
	 * <head> tag. The reference string addresses the UsaProxy JavaScript code,
	 * which performs the tracking, logging and event reconstruction in the
	 * users' browsers.
	 * 
	 * @param in
	 *            is the server's <code>InputStream</code>.
	 * @return the remaining <code>InputStream</code> for further processing.
	 */
	private InputStream insertJavaScript(InputStream in) {

		byte b = 0;
		boolean readTooMuch = false;
		/** specifies the end of the document */
		boolean noHead = true;
		/** false when head tag is found */
		boolean headStarted = false;
		/** specifies the start of the head tag */

		this.data = new StringBuffer();
		/** will be assigned the modified response */
		byte[] bdata;
		/** holds the first part of the response including the head tag */
		String dataBefore;
		/** holds the first part of the response including the head tag */

		try {

			/** read in max 4097 bytes and search for the head-tag */
			for (ByteArrayOutputStream buf = new ByteArrayOutputStream(4097);;) {
				if (!readTooMuch) {
					b = (byte) in.read();
					/** read in new byte */
				}
				if (b == -1) {
					break;
					/** end procedure when end of document */
				}
				readTooMuch = false;

				/**
				 * if head wasn't found yet and b = opening tag or "<head"
				 * String already detected but searching for end tag (head might
				 * also be composed of "<head par=foo>"
				 */
				if ((!headStarted && b != '<') || (headStarted && b != '>')) {
					buf.write(b);
					/** append byte to buf */

					/** b== '<' || (headStarted && b == '>') */
				} else {
					buf.write(b);
					/** append byte to buf */

					/**
					 * if head tag not yet started, examine the following bytes
					 * e.g. current read-in byte = <, followed by h e a d
					 */
					if (!headStarted) {

						b = (byte) in.read();
						if ((b != 'h') && (b != 'H')) {
							buf.write(b);
							/** if this byte != h append other value */
							continue;
							/** and stop here and start next loop */
						}
						/**
						 * b== 'h' detected, read in next byte and see if it
						 * matches "e"
						 */
						buf.write(b);
						/** append "h" */

						b = (byte) in.read();
						if ((b != 'e') && (b != 'E')) {
							buf.write(b);
							continue;
						}
						/** b== 'e' */
						buf.write(b);
						/** append "e" */

						b = (byte) in.read();
						if ((b != 'a') && (b != 'A')) {
							buf.write(b);
							continue;
						}
						/** b== 'a' */
						buf.write(b);
						/** append "a" */

						b = (byte) in.read();
						if ((b != 'd') && (b != 'D')) {
							buf.write(b);
							continue;
						}
						/** b== 'd' */
						buf.write(b);
						/** append "d" */

						headStarted = true;
						/**
						 * String "<head" found: set headStarted flag in order
						 * to check for end tag (might also look like this:
						 * "<head par=foo>"
						 */

						b = (byte) in.read();
						if (b != '>') {
							buf.write(b);
							continue;
						}
						/** b== '>': end tag directly found */
						buf.write(b);
						/** append ">" */

					}
					/** complete head-tag detected */

					System.out
					.println("\nUsaProxy script tag was added to request "
							+ client.getHeaders().elementAt(0)
							+ "\n"
							+ "Monitoring was started at client "
							+ client.getSocket().getInetAddress()
							.getHostName()
							+ " ("
							+ client.getSocket().getInetAddress()
							.getHostAddress() + ")");

					headStarted = false;
					readTooMuch = true;
					noHead = false;
					buf.close();

					bdata = buf.toByteArray();
					/** assign buf content to bdata ByteArray */
					buf.reset();
					/** generate String representation of bdata */
					dataBefore = new String(bdata,
							HTTPData.HEADER_DEFAULT_CHAR_ENCODING);

					/**
					 * generate individual JavaScript reference String
					 * (scriptstring) together with the corresponding URL
					 * parameters such as sd or timestamp
					 */
					/** first, get the Mode-dependent scriptstring */
					String scriptString = usaProxy.getMode().getScriptString(
							usaProxy.getIP(), usaProxy.getPort(),
							"proxyscript.js");

					timeStamp = timeStamp();
					/** generate new timestamp */
					/**
					 * paste sd attribute with the current serverdata
					 * ID/httptrafficindex, the ts attribute, and the UsaProxy
					 * instance id
					 */
					//scriptString = insertPars(scriptString);
					scriptString = insertParsNew();

					/**
					 * if shared browsing page requested, add also
					 * sharedbrowsing.js scriptstring
					 */
					String sbScriptString = "";
					if (requestURL.getPath().equals("/sharedbrowsing/")
							|| requestURL.getPath().equals("/sharedbrowsing"))
						sbScriptString = usaProxy.getMode().getScriptString(
								usaProxy.getIP(), usaProxy.getPort(),
								"sharedbrowsing.js");

					/**
					 * if remote monitoring page requested, add also
					 * remotemonitoring.js scriptstring
					 */
					String rmScriptString = "";
					if (requestURL.getPath().equals("/remotemonitoring/")
							|| requestURL.getPath().equals("/remotemonitoring"))
						rmScriptString = usaProxy.getMode().getScriptString(
								usaProxy.getIP(), usaProxy.getPort(),
								"remotemonitoring.js");

					/**
					 * add first part of response together with the
					 * scriptstrings to the data StringBuffer object which will
					 * be transmitted later
					 */
					data.append(dataBefore).append(scriptString)
					.append(sbScriptString).append(rmScriptString);

					/**
					 * adapt header content-length according to scriptstring
					 * lengths
					 */
					if (server.getHeaders().containsKey(
							HTTPData.HEADER_CONTENT_LENGTH)) {
						int contentLength = Integer.parseInt((String) server
								.getHeaders().get(
										HTTPData.HEADER_CONTENT_LENGTH));
						contentLength += scriptString.getBytes().length
								+ sbScriptString.getBytes().length;
						server.getHeaders().put(HTTPData.HEADER_CONTENT_LENGTH,
								"" + contentLength);
					}
					break;
				}

				/**
				 * if no head-tag was detected simply add processed data to the
				 * StringBuffer which will be transmitted later
				 */
				if (noHead) {
					buf.close();
					bdata = buf.toByteArray();
					buf.reset();
					data.append(new String(bdata,
							HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
				}
			}

		} catch (IOException e) {
			if (server.getSocket() != null) {
				System.err
				.println("\nAn ERROR occured while enhancing response: "
						+ "from server "
						+ server.getSocket().getInetAddress()
						.getHostName() + ":\n" + e);

				ErrorLogging.logCriticalError("ClientRequest.java: insertJavaScript()",
						"ERROR occured while enhancing response" + "from server "
								+ server.getSocket().getInetAddress()
								.getHostName(), e);
			} else {
				System.err
				.println("\nAn ERROR occured while enhancing response: "
						+ "\n" + e);

				ErrorLogging.logError("ClientRequest.java: insertJavaScript()",
						"ERROR occured while enhancing response",e);
			}
		}

		/** return the rest of the input stream */
		return in;
	}

	/**
	 * Appends properties and URL parameters to the JavaScript reference string.
	 * First, it assigns an id property in order to provide access to the
	 * reference URL.
	 * 
	 * Then, it appends individual URL parameters: An sd attribute with the
	 * current httptrafficindex, a ts attribute with the generated timestamp,
	 * and the UsaProxy instance ID.
	 * 
	 * @param scriptString
	 *            is the original reference string to be augmented.
	 * @return the reference string together with an id property and the
	 *         individual URL parameters.
	 */
	private String insertPars(String scriptString) {

		/** insert id property into script element */
		StringBuffer scriptStringID = new StringBuffer(scriptString);
		String proxyString = "<script ";
		int insertPos = scriptString.indexOf(proxyString)
				+ proxyString.length();
		scriptStringID.insert(insertPos, "id='proxyScript_UsaProxy' ");
		scriptString = scriptStringID.toString();

		/**
		 * insert URL parameters sd, ts, and id after proxyscript.js file name
		 * and "?"-seperator
		 */
		scriptStringID = new StringBuffer(scriptString);
		proxyString = "proxyscript.js";
		insertPos = scriptString.indexOf(proxyString) + proxyString.length();
		scriptStringID.insert(insertPos, "?sd=" + httpTrafficIndex + "&amp;ts="
				+ timeStamp + "&amp;id=" + usaProxy.getId());
		scriptString = scriptStringID.toString();
		System.out.println("ClientRequest.java: SCRIPT TO INJECT IS: "+scriptString);
		return scriptString;
	}

	/**
	 * As insertPars, it injects the necessary script, 
	 * but instead of the original UsaProxy script, it injects
	 * the customized one from the copypaste approach we took.
	 * 
	 * 
	 * @return String containing the script to inject
	 */
	private String insertParsNew() {


		//I took the literal copypaste text and used an online tool (http://www.htmlescape.net/javaescape_tool.html)
		//to obtain the correspondent escaped string

		//String with webpageIndex = 10010 and server IP = wel-experimental
		String scriptToInject = "<!-- usaProxy script start-->\n\t<script type=\"text/javascript\">\n\t\t\n\t\t//Sensitive fields\' IDs should be in this array. It will be empty by default.\n\t\t//The comparison will be case sensitive!!\n\t\twindow.protectedIds=[];\n\t\t\n\t\t//The webpageindex will be specific to each site\n\t\twindow.webpageIndex = \'10010\';\n\t\twindow.usaProxyServerIP = \'wel-experimental.cs.man.ac.uk:2727\'; \n\t\twindow.sessionId = getCookie(\"proxyUserID\");\n\t\t\n\t\twindow.usaProxySrc = \"http://\"+window.usaProxyServerIP+\"/usaproxylolo/file/proxyscript.js?sd=\"+window.webpageIndex+\"&sid=\"+window.sessionId\n\n\t\t//we add the script dinamically\n\t\tvar usaProxyScriptNode = document.createElement(\'script\');\n\t\tusaProxyScriptNode.id = \'proxyScript_UsaProxy\';\n\t\tusaProxyScriptNode.type = \'text/javascript\';\n\t\tusaProxyScriptNode.src = window.usaProxySrc;\n\n\t\tdocument.getElementsByTagName(\'head\')[0].appendChild(usaProxyScriptNode);\n\t\t\n\t\tfunction getCookie(c_name)\n\t\t{\n\t\t\tvar i,x,y,ARRcookies=document.cookie.split(\";\");\n\t\t\tfor (i=0;i<ARRcookies.length;i++)\n\t\t\t{\n\t\t\t\tx=ARRcookies[i].substr(0,ARRcookies[i].indexOf(\"=\"));\n\t\t\t\ty=ARRcookies[i].substr(ARRcookies[i].indexOf(\"=\")+1);\n\t\t\t\tx=x.replace(/^\\s+|\\s+$/g,\"\");\n\t\t\t\tif (x==c_name)\n\t\t\t\t{\n\t\t\t\t\treturn unescape(y);\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\t//we didn\'t find the cookie, so we return null\n\t\t\treturn \"null\";\n\t\t}\n\t\t\n\t</script>\n<!-- usaProxy script end -->\n";

		//String with webpageIndex = 10010 and server IP = 130.88.193.26
		String testingScriptToInject = "<!-- usaProxy script start-->\n\t<script type=\"text/javascript\">\n\t\t\n\t\t//Sensitive fields\' IDs should be in this array. It will be empty by default.\n\t\t//The comparison will be case sensitive!!\n\t\twindow.protectedIds=[];\n\t\t\n\t\t//The webpageindex will be specific to each site\n\t\twindow.webpageIndex = \'10010\';\n\t\twindow.usaProxyServerIP = \'130.88.193.26:2727\'; \n\t\twindow.sessionId = getCookie(\"proxyUserID\");\n\t\t\n\t\twindow.usaProxySrc = \"http://\"+window.usaProxyServerIP+\"/usaproxylolo/file/proxyscript.js?sd=\"+window.webpageIndex+\"&sid=\"+window.sessionId\n\n\t\t//we add the script dinamically\n\t\tvar usaProxyScriptNode = document.createElement(\'script\');\n\t\tusaProxyScriptNode.id = \'proxyScript_UsaProxy\';\n\t\tusaProxyScriptNode.type = \'text/javascript\';\n\t\tusaProxyScriptNode.src = window.usaProxySrc;\n\n\t\tdocument.getElementsByTagName(\'head\')[0].appendChild(usaProxyScriptNode);\n\t\t\n\t\tfunction getCookie(c_name)\n\t\t{\n\t\t\tvar i,x,y,ARRcookies=document.cookie.split(\";\");\n\t\t\tfor (i=0;i<ARRcookies.length;i++)\n\t\t\t{\n\t\t\t\tx=ARRcookies[i].substr(0,ARRcookies[i].indexOf(\"=\"));\n\t\t\t\ty=ARRcookies[i].substr(ARRcookies[i].indexOf(\"=\")+1);\n\t\t\t\tx=x.replace(/^\\s+|\\s+$/g,\"\");\n\t\t\t\tif (x==c_name)\n\t\t\t\t{\n\t\t\t\t\treturn unescape(y);\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\t//we didn\'t find the cookie, so we return null\n\t\t\treturn \"null\";\n\t\t}\n\t\t\n\t</script>\n<!-- usaProxy script end -->\n"; 

		System.out.println("ClientRequest.java: SCRIPT TO INJECT IS: "+testingScriptToInject);
		return testingScriptToInject;
	}

	/**
	 * Sends the response headers to the client. In the case a recorded web page
	 * is requested ("usaproxyload"), or when HTML is processed, a corresponding
	 * log file entry is generated. In addition, the response headers are stored
	 * in the corresponding txt-file.
	 * 
	 * @param out
	 *            is the client's <code>OutputStream</code>.
	 */
	private void sendHeaders(OutputStream out) {

		client.setOut(new DataOutputStream(new BufferedOutputStream(client
				.getOut())));
		StringBuffer headers = server.getHeaders().toStringBuffer();

		if (UsaProxy.DEBUG)
			System.err.println("Enhanced response headers " + headers);

		try {
			/** forward response headers */
			client.getOut().write(
					headers.toString().getBytes(
							HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
			client.getOut().flush();

			/**
			 * in the case a recorded/cached response is transmitted (indicated
			 * by keyword "usaproxyload"), record a log file entry
			 */
			if (requestURL.getQuery() != null
					&& requestURL.getQuery().indexOf("usaproxyload") > -1) {
				/** if file logging enabled */
				if (usaProxy.isLogging()) {
					String logData = timeStamp() + " usaproxyload url="
							+ requestURL;
					usaProxy.getEventManager().log(null, logData,"",
							client.getSocket());
				}
			}

			/**
			 * in the case HTML is transmitted (original, remotemonitoring, or
			 * sharedbrowsing page = all cases besides "usaproxyload") create
			 * "httptraffic" log entry with index already defined by
			 * serverRequest as suffix for stored response data
			 */
			if (isHtmlStream && !isNotFoundMessage) {

				if (usaProxy.isLogging()) {
					/** httpTraffic log entry */
					String logData = timeStamp + " httptraffic url="
							+ requestURL + " sd=" + httpTrafficIndex;
					usaProxy.getEventManager().log(null, logData,"",
							client.getSocket());
				}

				/** store headers to indexed txt-file */
				if (usaProxy.getHttpTraffic().isCachingEnabled())
					usaProxy.getHttpTraffic().store(httpTrafficIndex,
							"[response]\r\n" + headers.toString());
			}

		} catch (IOException e) {
			if (client.getSocket() != null) {
				System.err
				.println("\nAn ERROR occured while sending response headers: "
						+ "to client "
						+ client.getSocket().getInetAddress()
						.getHostName() + ":\n" + e);
			} else {
				System.err
				.println("\nAn ERROR occured while sending response headers: "
						+ "\n" + e);
			}
		}
	}

	/**
	 * Sends the response data to the client. In case the response was augmented
	 * with JavaScript, the enriched part is sent first followed by the rest of
	 * the response. Else, the complete response is simply forwarded. The
	 * forwarded data is stored to the respective httpTraffic txt-file specified
	 * by the corresponding httptrafficindex.
	 * 
	 * @param in
	 *            is the response data stream
	 */
	private void sendResponse(InputStream in) {

		byte response[] = new byte[4096];
		/** data buffer */
		int responseLength;
		/** length of response as number of bytes */

		try {

			/** transmit augmented response data */
			if (isHtmlStream && (isNotFoundMessage == false)) {
				/** send data StringBuffer content */
				client.getOut().write(
						data.toString().getBytes(
								HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
				client.getOut().flush();

				/** store data to indexed txt-file */
				if (usaProxy.getHttpTraffic().isCachingEnabled())
					usaProxy.getHttpTraffic().store(httpTrafficIndex,
							data.toString());
			}

			while ((responseLength = in.read(response)) != -1) {
				if (responseLength > 0) {

					client.getOut().write(response, 0, responseLength);
					client.getOut().flush();

					/**
					 * in case HTML is transmitted store response data (or the
					 * rest of the response data) to the corresponding
					 * httptraffic txt-file
					 */
					if((isHtmlStream && (isNotFoundMessage==false))
							&&
							usaProxy.getHttpTraffic().isCachingEnabled()) {

						/** store data to indexed txt-file */
						usaProxy.getHttpTraffic().store(httpTrafficIndex, response,
								0, responseLength);
					}
				}
			}
		} catch (IOException e) {
			if (client.getSocket() != null) {
				System.err
				.println("\nAn ERROR occured while sending response: "
						+ "to client "
						+ client.getSocket().getInetAddress()
						.getHostName() + ":\n" + e);
			} else {
				System.err
				.println("\nAn ERROR occured while sending response: "
						+ "\n" + e);
			}
		}
	}

	/**
	 * Returns a timestamp string of the form "2004-12-31,23:59:59"
	 * 
	 * @return the timestamp
	 * */
	public String timeStamp() {
		Calendar now = Calendar.getInstance();
		return now.get(Calendar.YEAR) + "-"
		+ completeDateVals(now.get(Calendar.MONTH) + 1) + "-"
		+ completeDateVals(now.get(Calendar.DAY_OF_MONTH)) + ","
		+ completeDateVals(now.get(Calendar.HOUR_OF_DAY)) + ":"
		+ completeDateVals(now.get(Calendar.MINUTE)) + ":"
		+ completeDateVals(now.get(Calendar.SECOND));
	}

	/**
	 * Returns a timestamp string of the form "2004-12-31,23:59:59:999"
	 * 
	 * @return the timestamp
	 * */
	public String timeStampms() {
		Calendar now = Calendar.getInstance();
		return now.get(Calendar.YEAR) + "-"
		+ completeDateVals(now.get(Calendar.MONTH) + 1) + "-"
		+ completeDateVals(now.get(Calendar.DAY_OF_MONTH)) + ","
		+ completeDateVals(now.get(Calendar.HOUR_OF_DAY)) + ":"
		+ completeDateVals(now.get(Calendar.MINUTE)) + ":"
		+ completeDateVals(now.get(Calendar.SECOND)) + ":"
		+ completeDateVals(now.get(Calendar.MILLISECOND));
	}
	/**
	 * Converts single-digit numbers into two-digit numbers ("0" prefix).
	 * 
	 * @param dateVal
	 *            is the digit to be examined and adapted
	 * @return the converted number
	 * */
	public String completeDateVals(int dateVal) {
		String dateVals = "" + dateVal;
		if (dateVals.length() < 2)
			return "0" + dateVal;
		else
			return dateVals;
	}

	/**
	 * Returns the <code>HTTPTraffic</code> instance.
	 * 
	 * @return the <code>HTTPTraffic</code> instance
	 */
	public HTTPTraffic getHttpTraffic() {
		return usaProxy.getHttpTraffic();
	}

	/**
	 * Returns the httpTrafficIndex.
	 * 
	 * @return the httpTrafficIndex.
	 */
	public int getHttpTrafficIndex() {
		return httpTrafficIndex;
	}

	/**
	 * Sets the httpTrafficIndex.
	 * 
	 * @param httpTrafficIndex
	 *            is the new httptrafficindex
	 */
	public void setHttpTrafficIndex(int httpTrafficIndex) {
		this.httpTrafficIndex = httpTrafficIndex;
	}

	/**
	 * Returns a random string with a specified length.
	 * 
	 * @param positions
	 *            is the length of the random string
	 * @return the random string
	 */
	public String generateSessionID(int positions) {

		int intI = 0;
		String strLargeText = "";
		int intValue = 0;
		String[] arrCharacters = { "0", "1", "2", "3", "4", "5", "6", "7", "8",
				"9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
				"L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W",
				"X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i",
				"j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u",
				"v", "w", "x", "y", "z" };
		/** Loop over number of characters in string. */
		for (intI = 0; intI < positions; intI++) {
			/**
			 * Get a random value between 0 and the length of the character
			 * list.
			 */
			intValue = randRange_UsaProxy(0, (arrCharacters.length - 1));
			/** Append a character that is randomly chosen */
			strLargeText += arrCharacters[intValue];
		}
		return strLargeText;
	}

	/**
	 * Returns a random index.
	 * 
	 * @param intFrom
	 *            is the lowest index to be selected
	 * @param intTo
	 *            is the highest index to be selected
	 * 
	 * @return the random index
	 */
	public int randRange_UsaProxy(double intFrom, double intTo) {
		/** Make sure that we have rounded numbers. */
		intFrom = Math.floor(intFrom);
		intTo = Math.floor(intTo);

		/** Return the random number. */
		return ((int) (Math.floor(intFrom + ((intTo - intFrom + 1) *
				/** Seed the random number if a value was passed. */
				Math.random()))));
	}


	/**
	 * 
	 * This function will "clean up" after all opened hash tables, otherwise we will encounter java heap errors when many users are recorded
	 */
	public void eraseClient() {
		//Code previously found in "Finally" section of run()
		/** Close streams and sockets */
		try {
			client.closeInputStream();
			client.closeOutputStream();
			if (server != null)
				server.closeInputStream();
			/**
			 * server might not be initialized e.g. in case of log request
			 */
			if (server != null)
				server.closeOutputStream();
			client.closeSocket();
			if (server != null)
				server.closeSocket();
		} catch (Exception ex) {
			System.err
			.println("\nAn ERROR occured while closing streams and sockets");
			ex.printStackTrace();
		}

		//connections are closed, but now I want to get rid of the hashtables
	}

	/**
	 * Simple function to just print the input from the user.
	 * Inspired by http://stackoverflow.com/questions/3033755/reading-post-data-from-html-form-sent-to-serversocket
	 * http://stackoverflow.com/questions/30901173/handling-post-request-via-socket-in-java
	 * @param is
	 * @throws IOException 
	 */
	String readInputStreamToString(InputStream is)
	{
		try {
			// HTTP carries both textual and binary elements.
			// Not using BufferedReader.readLine() so it does
			// not "steal" bytes from BufferedInputStream...

			// HTTP itself only allows 7bit ASCII characters
			// in headers, but some header values may be
			// further encoded using RFC 2231 or 5987 to
			// carry Unicode characters ...

			InputStreamReader r = new InputStreamReader(is, StandardCharsets.US_ASCII);
			StringBuilder sb = new StringBuilder();
			char c;

			while ((c = (char) r.read()) >= 0) {
				if (c == '\n') break;
				sb.append(c);
			}

			return sb.toString();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

}