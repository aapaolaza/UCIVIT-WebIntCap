package usaproxy;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.net.URL;
import java.net.UnknownHostException;
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
	 */
	public ClientRequest(Socket socket, UsaProxy usaProxy) {

		this.client = new SocketData(socket);
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

		try {

			/** read in HTTP request headers */
			in = client.getHeaders().readHeaders(in);

			/** Request URL processing */

			/** get request-line */
			url = (String) client.getHeaders().elementAt(0);

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
			client.getHeaders().remove(url);

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
			 * 1. request for page recording: if user requests the recording of
			 * a page which has been delivered to his shared session partner =
			 * if page recording is requested FileInputStream of the
			 * corresponding text file containing the page headers and data is
			 * retrieved. The text file is specified by the so-called
			 * httptraffic index (serverdata index) in the request URL's query
			 * part (sd=). The stream is processed as if it was an actual server
			 * response by applying processResponse
			 * */
			if (requestURL.getQuery() != null
					&& requestURL.getQuery().indexOf("usaproxyload&") > -1) {

				/** retrieve serverdata / httptraffic index */
				String SdId = HTTPData.getValue(requestURL.getQuery(), "sd");

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/** ascertain that parameters actually were applied */
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * verify that both users actually collaborate this is first
				 * done by check if an entry set exists for the requesting
				 * client in the session Hashtable partners
				 */
				if (usaProxy.getUsers().getPartners().containsKey(sid)) {

					/**
					 * then the partner field (first field in entry list) is
					 * compared to psid
					 */
					String partner_field = ((String[]) usaProxy.getUsers()
							.getPartners().get(sid))[0];
					if (partner_field == null || !partner_field.equals(psid)) {
						/** send "403" Forbidden response */
						SocketData
								.send403(new DataOutputStream(client.getOut()),
										"Wrong partner session ID URL parameter specified !");
						return;
					}
				}

				/**
				 * then compare the sd field (third field) in Hashtable partners
				 * to the request query sd. This field contains the httptraffic
				 * index which was last used by the session partner for an
				 * original page request. in the case of a match, the user is
				 * entitled to request the recording and the corresponding
				 * httptraffic file's content is processed
				 */
				String sd_field = ((String[]) usaProxy.getUsers().getPartners()
						.get(sid))[2];
				if (sd_field.equals(SdId)) {

					/**
					 * open FileInputStream to httpraffic file with the
					 * specified sd and retrieve the recorded response headers
					 * and data
					 */
					InputStream responseFis = usaProxy.getHttpTraffic()
							.getResponseData(SdId);

					try {
						/** create UsaProxy server socket */
						this.server = new SocketData(new Socket(
								usaProxy.getIP(), usaProxy.getPort()));
					} catch (Exception err) {
						System.err
								.println("\nAn ERROR occured while opening UsaProxy server socket:\n"
										+ err);
						
						ErrorLogging
								.logError(
										"ClientRequest.java/processRequest()",
										"ERROR occured while opening UsaProxy server socket",
										err);
					}

					/**
					 * apply stream processing to the text file's response
					 * headers and data
					 */
					processResponse(responseFis);

					/** if user isn't entitled to request this sd */
				} else {
					System.err.println("\nClient "
							+ client.getSocket().getInetAddress().getHostName()
							+ " (session ID: " + sid + ")"
							+ " tried to access sd " + SdId
							+ " without authorization!");
					/** send "403" Forbidden response */
					SocketData
							.send403(new DataOutputStream(client.getOut()),
									"You are not entitled to request this serverdata ID (sd) !");
				}

			}

			/*********************************************************************
			 * 2. request for remote monitoring resp. shared browsing page: if
			 * request path is composed of either panel name UsaProxy retrieves
			 * first the corresponding HTML code (in "html" folder) and then
			 * applies response processing
			 * */
			else if (requestURL.getPath().equals("/remotemonitoring/")
					|| requestURL.getPath().equals("/remotemonitoring")
					|| requestURL.getPath().equals("/sharedbrowsing/")
					|| requestURL.getPath().equals("/sharedbrowsing")) {

				/**
				 * remote monitoring security check: check for UsaProxy ID
				 * specification in the query part of the request URL ("id=").
				 * if specified ID doesn't comply with the UsaProxy ID of this
				 * instance, deny request
				 */
				String id = HTTPData.getValue(requestURL.getQuery(), "id");
				if (requestURL.getPath().startsWith("/remotemonitoring")
						&& id != null && !id.equals(usaProxy.getId())) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"Wrong UsaProxy ID !");
					return;
				}

				/** retrieve appropriate HTTP response headers and HTML data */
				String filename = (requestURL.getPath()
						.startsWith("/remotemonitoring")) ? "remotemonitoring.htm"
						: "sharedbrowsing.htm";
				InputStream fis = usaProxy.getFileSender()
						.getHTMLData(filename);

				if (fis == null) {
					/** send "404" Not Found response */
					SocketData.send404(new DataOutputStream(client.getOut()));
					return;
				}
				/** else */

				/**
				 * Get new (automatically increased) httpTraffic index which
				 * will reference the txt-file the request and response data
				 * will be stored in. Store the request headers (storage of
				 * response headers and data will be performed when file stream
				 * is processed)
				 */
				if (getHttpTraffic().isCachingEnabled()) {
					httpTrafficIndex = usaProxy.getHttpTraffic()
							.getHttpTrafficIndex(true);
					getHttpTraffic().store(
							getHttpTrafficIndex(),
							"[request]\r\n"
									+ client.getHeaders().toStringBuffer());
				}

				try {
					/** create UsaProxy server socket */
					this.server = new SocketData(new Socket(usaProxy.getIP(),
							usaProxy.getPort()));

				} catch (Exception err) {
					System.err
							.println("\nAn ERROR occured while opening default server socket:\n"
									+ err);
					/** send "404" Not Found response */
					SocketData.send404(new DataOutputStream(client.getOut()));
				}

				/** apply stream processing to the response headers and data */
				processResponse(fis);

			}

			/*********************************************************************
			 * 3. /usaproxylolo/file request: if request path starts with
			 * "/usaproxylolo/file/ UsaProxy directly serves the requested file
			 * In addition, the session cookie is queried in the case that
			 * proxyscript.js is requested
			 * */
			else if (requestURL.getPath().indexOf("/usaproxylolo/file/") > -1) {

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

						/**
						 * if listName_field matches this client's session ID,
						 * the other collaborator is the monitoring party (this
						 * client would then be the initiator of the shared
						 * session, thus allow the other user to monitor him)
						 */
						if (usaProxy.isRM()) {
							remoteMonitorer = (listName_field.equals(sessionID)) ? "false"
									: "true";
							/**
							 * in addition, if the client has registered for
							 * remote support assistance the isAdmin flag is set
							 * true
							 */
							if (usaProxy.getUsers().getAdmins()
									.contains(sessionID))
								isAdmin = true;
						}

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
						usaProxy.isRM(), remoteMonitorer, usaProxy.isSB(),
						usaProxy.getLogMode(), isAdmin, isWindowNameSet);
			}

			/*********************************************************************
			 * 4. chat request (get chat messages + store chat messages): if
			 * user is verified to collaborate within a shared session request
			 * processing by the global ChatManager instance is applied
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/chat")) {

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/** ascertain that parameters actually were applied */
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * First, check if user is still taking part in a shared session
				 * (if an entry exists in partners Hashtable). Otherwise delete
				 * the corresponding list entry from the ChatManager messages
				 * Hashtable (precautionary action: sid might be the referring
				 * key but might also be not).
				 * 
				 * Then, verify that both users actually collaborate. This is
				 * first done by check if an entry set exists for the requesting
				 * client in the session Hashtable partners. Then the partner
				 * field (first field in entry list) is compared to psid.
				 * 
				 * Finally, the request is handed over to the ChatManager
				 * instance
				 * */
				if (usaProxy.getUsers().getPartners().containsKey(sid)) {

					/** collaboration check */
					String partner_field = ((String[]) usaProxy.getUsers()
							.getPartners().get(sid))[0];
					if (partner_field == null || !partner_field.equals(psid)) {
						/** send "403" Forbidden response */
						SocketData
								.send403(new DataOutputStream(client.getOut()),
										"Wrong partner session ID URL parameter specified !");
						return;
					}

					/** hand over */
					String listName_field = ((String[]) usaProxy.getUsers()
							.getPartners().get(sid))[3];
					usaProxy.getChatManager().processRequest(client.getOut(),
							client.getSocket(), requestURL.getQuery(),
							listName_field);
				} else
					usaProxy.getChatManager().deleteList(sid);

			}

			/*********************************************************************
			 * 5. log request (log usage data): if user is verified to
			 * collaborate within a shared session the new usage data is
			 * appended by the EventManager instance
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/log")) {

				// /DEBUG TEST
				//String[] dataArray = requestURL.getQuery().split("&xX");
				
				// DEBUG
				// System.out.println("\n\n\n\n\n\nClientRequest processRequest log  Received new data"
				// +"Parsing a total of " + dataArray.length + "elements");
				// System.out.println(requestURL.getQuery() + "\n\n\n\n\n\n");

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");

				System.out.println("The request was:" + requestURL.getQuery());
				System.out.println("Logging information for session: " + sid);

				/** ascertain that parameter actually was applied */
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** First, ascertain that shared mode enabled */
				if (usaProxy.isRM() || usaProxy.isSB()) {

					String psid = HTTPData.getValue(requestURL.getQuery(),
							"psid");

					/** ascertain that parameter actually was applied */
					if (psid == null) {
						/** send "403" Forbidden response */
						SocketData.send403(
								new DataOutputStream(client.getOut()),
								"No session ID URL parameter specified !");
						return;
					}

					/**
					 * First, check if user is still taking part in a shared
					 * session (if an entry exists in partners Hashtable).
					 * Otherwise delete the corresponding list entry from the
					 * EventManager events Hashtable (precautionary action: sid
					 * might be the referring key but might also be not).
					 * 
					 * Then, verify that both users actually collaborate. This
					 * is first done by check if an entry set exists for the
					 * requesting client in the session Hashtable partners. Then
					 * the partner field (first field in entry list) is compared
					 * to psid.
					 * 
					 * Finally, the request is handed over to the EventManager
					 * instance
					 * */
					if (usaProxy.getUsers().getPartners().containsKey(sid)) {

						/** collaboration check */
						String partner_field = ((String[]) usaProxy.getUsers()
								.getPartners().get(sid))[0];
						if (partner_field == null
								|| !partner_field.equals(psid)) {
							/** send "403" Forbidden response */
							SocketData
									.send403(
											new DataOutputStream(client
													.getOut()),
											"Wrong partner session ID URL parameter specified !");
							return;
						}

						/** hand over */
						String listName_field = ((String[]) usaProxy.getUsers()
								.getPartners().get(sid))[3];
						/** append events */
						usaProxy.getEventManager().append(client.getOut(),
								requestURL.getQuery(), listName_field);
					} else
						usaProxy.getEventManager().deleteList(sid);
				}

				/**
				 * if full logging enabled store entries in log file
				 */
				if (usaProxy.isLogging()
						&& !usaProxy.getLogMode().equals("pagereq")
						&& requestURL.getQuery().indexOf("lastId=") == -1)
					usaProxy.getEventManager().log(client.getOut(),
							requestURL.getQuery(), client.getSocket());
			}

			/*********************************************************************
			 * 6. request for remote events: if user is verified to collaborate
			 * within a shared session with the specified partner new event logs
			 * are fetched by the EventManager instance
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/getevents")) {

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/** ascertain that parameters actually were applied */
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * First, check if user is still taking part in a shared session
				 * (if an entry exists in partners Hashtable). Otherwise delete
				 * the corresponding list entry from the EventManager events
				 * Hashtable (precautionary action: sid might be the referring
				 * key but might also be not).
				 * 
				 * Then, verify that both users actually collaborate. This is
				 * first done by check if an entry set exists for the requesting
				 * client in the session Hashtable partners. Then the partner
				 * field (first field in entry list) is compared to psid.
				 * 
				 * Finally, the request is handed over to the EventManager
				 * instance
				 * */
				if (usaProxy.getUsers().getPartners().containsKey(sid)) {

					/** collaboration check */
					String partner_field = ((String[]) usaProxy.getUsers()
							.getPartners().get(sid))[0];
					if (partner_field == null || !partner_field.equals(psid)) {
						/** send "403" Forbidden response */
						SocketData
								.send403(new DataOutputStream(client.getOut()),
										"Wrong partner session ID URL parameter specified !");
						return;
					}

					/** hand over */
					String list = ((String[]) usaProxy.getUsers().getPartners()
							.get(sid))[3];
					/** send events */
					usaProxy.getEventManager().send(client.getOut(),
							requestURL.getQuery(), list);
				} else
					usaProxy.getEventManager().deleteList(sid);

			}

			/*********************************************************************
			 * 7. end session request: if user is verified to collaborate within
			 * a shared session with the specified partner the shared session is
			 * terminated
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/endsession")) {

				/** retrieve both collaborators' session ID query parameters */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/** ascertain that parameters actually were applied */
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * Verify that both users actually collaborate. This is first
				 * done by check if an entry set exists for the requesting
				 * client in the session Hashtable partners. Then the partner
				 * field (first field in entry list) is compared to psid.
				 * */
				if (usaProxy.getUsers().getPartners().containsKey(sid)) {

					String partner_field = ((String[]) usaProxy.getUsers()
							.getPartners().get(sid))[0];
					if (partner_field == null || !partner_field.equals(psid)) {
						/** send "403" Forbidden response */
						SocketData
								.send403(new DataOutputStream(client.getOut()),
										"Wrong partner session ID URL parameter specified !");
						return;
					}
				}

				/** perform termination */
				usaProxy.getUsers().endSession(client.getOut(), sid);
			}

			/*********************************************************************
			 * 8. set isWindowNameSet request (in case a window was defined as
			 * shared session window): flag is set for the requesting client
			 * */
			else if (requestURL.getPath().equals(
					"/usaproxylolo/setwindownameset")) {

				/** ascertain that a sid parameter actually was applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** set flag */
				usaProxy.getUsers().setWindowNameSet(client.getOut(), sid);
			}

			/*********************************************************************
			 * 9. request for users: all registered users are served
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/getusers")) {

				/** ascertain that a sid parameter actually was applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** send users */
				usaProxy.getUsers().send(client.getOut(), "users", sid);
			}

			/*********************************************************************
			 * 10. request for proposals: the session IDs of all client's which
			 * proposed this user a shared session are delivered
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/getproposals")) {

				/** ascertain that a sid parameter actually was applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** send proposals */
				usaProxy.getUsers().send(client.getOut(), "proposals", sid);
			}

			/*********************************************************************
			 * 11. accept proposal request:
			 * */
			else if (requestURL.getPath()
					.equals("/usaproxylolo/acceptproposal")) {

				/** ascertain that sid and psid parameters actually were applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** accept proposal */
				usaProxy.getUsers().acceptProposal(client.getOut(), sid, psid);
			}

			/*********************************************************************
			 * 12. reject proposal request:
			 * */
			else if (requestURL.getPath()
					.equals("/usaproxylolo/rejectproposal")) {

				/** ascertain that sid and psid parameters actually were applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");
				if (sid == null || psid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** reject proposal */
				usaProxy.getUsers().rejectProposal(client.getOut(), sid, psid);
			}

			/*********************************************************************
			 * 13. propose request: a proposal is generated
			 */
			else if (requestURL.getPath().equals("/usaproxylolo/propose")) {

				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/**
				 * ascertain that a sid parameter actually was applied psid not
				 * neccessarily available since in the case of remote support a
				 * user proposes without specifying a dedicated partner
				 */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * generate a new proposal for a dedicated partner, otherwise
				 * (psid=null) for all registered admins/support assistants
				 */
				usaProxy.getUsers()
						.generateProposal(client.getOut(), sid, psid);
			}

			/*********************************************************************
			 * 14. request for proposal acknowledgement: verification if the
			 * user's proposal was accepted by the partner
			 * */
			else if (requestURL.getPath()
					.equals("/usaproxylolo/getproposalAck")) {

				String psid = HTTPData.getValue(requestURL.getQuery(), "psid");

				/**
				 * ascertain that a sid parameter actually was applied psid not
				 * neccessarily available since in the case of remote support a
				 * user proposes without specifying a dedicated partner
				 */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * check for proposal acceptance by the dedicated partner, or by
				 * any registered admin/support assistant (psid=null)
				 */
				usaProxy.getUsers().isProposalAccepted(client.getOut(), sid,
						psid);
			}

			/*********************************************************************
			 * 15. request for user status: First, a new timestamp is produced
			 * and assigned to the client's "last accessed" field. Then the user
			 * status is send
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/getstatus")) {

				/** ascertain that a sid parameter actually was applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/** set timestamp */
				String ms = ""
						+ (int) Calendar.getInstance().getTime().getTime();
				usaProxy.getUsers().updateUserTS(sid, ms);

				/** send status */
				usaProxy.getUsers().send(client.getOut(), "status", sid);
			}

			/*********************************************************************
			 * 16. set admin request: The user is registered/removed as support
			 * assistant depending on the URL parameter mode
			 * */
			else if (requestURL.getPath().equals("/usaproxylolo/setadmin")) {

				/**
				 * mode specifies the direction of admin setting, either "set"
				 * or "reset".
				 */
				String mode = HTTPData.getValue(requestURL.getQuery(), "mode");

				/** ascertain that sid and mode parameters actually were applied */
				String sid = HTTPData.getValue(requestURL.getQuery(), "sid");
				if (sid == null || mode == null) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"No session ID URL parameter specified !");
					return;
				}

				/**
				 * remote monitoring security check: check for UsaProxy ID
				 * specification in the query part of the request URL ("id=").
				 * if specified ID doesn't comply with the UsaProxy ID of this
				 * instance, deny request
				 */
				String id = HTTPData.getValue(requestURL.getQuery(), "id");
				if (requestURL.getPath().startsWith("/remotemonitoring")
						&& id != null && !id.equals(usaProxy.getId())) {
					/** send "403" Forbidden response */
					SocketData.send403(new DataOutputStream(client.getOut()),
							"Wrong UsaProxy ID !");
					return;
				}

				/** perform request */
				usaProxy.getUsers().setAdmin(client.getOut(), sid, mode);
			}

			/*********************************************************************
			 * 17. regular web server request: The request is forwarded to the
			 * respective web server.
			 * 
			 * First, several HTTP headers are modified/added. Then a connection
			 * to the web server is established. For the purpose of forwarding
			 * the request, a ServerRequest thread is created. When the server
			 * replies, the response processing is handed over to
			 * processResponse()
			 * */
			else {
				
				/////////We removed the possibility of acting as a Proxy, minimizing the overload the server will have
//
//				/**
//				 * other undefined "usaproxylolo" requests: Reject request
//				 */
//				if (requestURL.getPath().startsWith("/usaproxylolo")) {
//					SocketData.send403(new DataOutputStream(client.getOut()),
//							"Forbidden usaproxylolo request !");
//					return;
//				}
//
//				/** Display message: Client and requested URL */
//				if (UsaProxy.DEBUG)
//					System.out.println("New REQUEST:");
//				if (UsaProxy.DEBUG)
//					System.out.println("From client "
//							+ client.getSocket().getInetAddress().getHostName()
//							+ " ("
//							+ client.getSocket().getInetAddress()
//									.getHostAddress() + ") with request GET "
//							+ url + "\n");
//
//				/** HTTP headers processing */
//
//				/**
//				 * add X-Forwarded-For header to ensure the server gets the
//				 * client IP
//				 */
//				client.getHeaders().put(HTTPData.HEADER_X_FORWARDED_FOR,
//						client.getSocket().getInetAddress().getHostAddress());
//
//				/**
//				 * add accept-encoding header value "identity" to avoid gzip
//				 * content-encoding
//				 */
//				client.getHeaders().put(HTTPData.HEADER_ACCEPT_ENCODING,
//						"identity");
//
//				/** add connection header value "close" */
//				client.getHeaders().put(HTTPData.HEADER_CONNECTION, "close");
//
//				/** remove proxy-connection and keep-alive header */
//				if (client.getHeaders().containsKey(
//						HTTPData.HEADER_PROXY_CONNECTION))
//					client.getHeaders()
//							.remove(HTTPData.HEADER_PROXY_CONNECTION);
//				if (client.getHeaders().containsKey(
//						HTTPData.HEADER_CONNECTION_KEEPALIVE))
//					client.getHeaders().remove(
//							HTTPData.HEADER_CONNECTION_KEEPALIVE);
//
//				/** add UsaProxy header for Apache mod_rewrite */
//				client.getHeaders().put(HTTPData.HEADER_X_USAPROXY, "client");
//
//				// client.getHeaders().printHeaders();
//				// requestURL.toString();
//
//				/** end HTTP headers processing */
//
//				/** connect with the web server depending on the proxy mode */
//				try {
//					this.server = new SocketData(usaProxy.getMode()
//							.getServerConnect());
//				}
//				/** if server could not be detected or didn't respond */
//				catch (Exception err) {
//
//					System.err
//							.println("\nAn ERROR occured while connecting to the server:\n"
//									+ err);
//					err.printStackTrace();
//
//					/**
//					 * send error message to client with the error, the
//					 * requested url, and the host
//					 */
//					SocketData.send403(new DataOutputStream(client.getOut()),
//							err.getMessage());
//
//					/** Close streams and sockets */
//					client.closeInputStream();
//					client.closeOutputStream();
//					client.closeSocket();
//					if (server != null)
//						server.closeSocket();
//
//					/** End of run */
//					return;
//				}
//
//				if (method.equals("POST"))
//					client.setIn(in);
//				else
//					client.setIn(null);
//
//				/** Create server streams */
//				/** Create client streams */
//				server.bindInputStream();
//				server.bindOutputStream();
//
//				/**
//				 * retrieve new httptraffic index for the storage of request and
//				 * response
//				 */
//				if (usaProxy.getHttpTraffic().isCachingEnabled())
//					httpTrafficIndex = usaProxy.getHttpTraffic()
//							.getHttpTrafficIndex(true);
//
//				/**
//				 * Create new Thread that manages the posting of the client
//				 * request to the web server
//				 */
//				new ServerRequest(client, server, this);
//
//				/** Receive server response and process it */
//				processResponse(server.getIn());
			}

		} catch (IOException e) {
			// e.printStackTrace();
			if (client.getSocket() != null) {
				ErrorLogging.logCriticalError("ClientRequest.java/process Request","\nAn IO ERROR occured while processing request:\n"
								+ client.getHeaders().elementAt(0)
								+ " from client "
								+ client.getSocket().getInetAddress()
										.getHostName(),e);
				/*if (client.getSocket().isClosed()) {
					System.err
							.println("Reason: Client closed his socket (maybe left for www.weg.de)\n");
				} else {
					if (client.getHeaders().elementAt(0)
							.indexOf("/usaproxylolo/log?sid=") > -1)
						System.err
								.println("Reason: client has left the web page. Polling thread has been suspended.\n");
					else
						System.err
								.println("Reason: Maybe the client's Outputstream is already closed\n");
				}*/
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
					scriptString = insertPars(scriptString);

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
		return scriptString;
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
					usaProxy.getEventManager().log(null, logData,
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
					usaProxy.getEventManager().log(null, logData,
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
					// TEST-REMOVAL if((isHtmlStream &&
					// (isNotFoundMessage==false))
					// TEST-REMOVAL &&
					// usaProxy.getHttpTraffic().isCachingEnabled()) {

					/** store data to indexed txt-file */
					usaProxy.getHttpTraffic().store(httpTrafficIndex, response,
							0, responseLength);
					// TEST-REMOVAL }
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

}