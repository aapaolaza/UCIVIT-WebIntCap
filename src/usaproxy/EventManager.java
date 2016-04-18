package usaproxy;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;

import org.apache.commons.io.FileUtils;

import usaproxy.domchanges.DOMBean;
import usaproxy.domchanges.DOMdiff;
import usaproxy.events.EventConstants;
import usaproxy.events.EventDataHashMap;
import usaproxy.events.FactoryEvent;
import usaproxy.events.GenericEvent;

/**
 * Class EventManager manages the exchange of interactions occured in one of the
 * collaborating browsers. <br>
 * <br>
 * In the case of incoming events, they are appended to the corresponding events
 * list. If a client requests new events, those are forwarded. <br>
 * <br>
 * In addition, it stores events to a log file.
 */
public class EventManager {

	/**
	 * Contains the events lists of all online pairs of users. An events
	 * <code>ArrayList</code> is addressed by the proposer's session ID.
	 */
	private Hashtable events;

	/**
	 * UsaProxy parent instance which is neccessary for accessing the
	 * corresponding partners list.
	 */
	private UsaProxy usaProxy;

	/**
	 * Name of the folder in which to put the log files
	 */
	private final static String logFolder = "logFiles";

	/**
	 * Name of the file in which to record the logged data
	 */
	private final static String logFilename = "log.txt";

	/**
	 * Number of minutes that define the threshold to discern different
	 * interaction episodes
	 */
	private final static int interactEpisLengthMinutes = 30;

	/**
	 * Maximum size of the log file in bytes. If bigger than this, it will
	 * create a new file The first value will be 5MB, to not make the file too
	 * heavy for text editors, and also to check it's working. that should be 5
	 * * 1024 *1024 = 5242880
	 */
	private final static int maxLogSize = 5242880;// I will test with 100kb to
	// see if it's working

	/**
	 * Reference value of the default value of the variable
	 * recordingsLeftToCheckSize, so it can get reseted
	 */
	private final static int recordingsLeftToCheckSizeDefault = 100;

	/**
	 * Number of iterations left before we check for the size of the file again.
	 * As the increases in size are very small, there is no point in checking
	 * the size every time we log something
	 */
	private int recordingsLeftToCheckSize = recordingsLeftToCheckSizeDefault;

	/**
	 * Constructor: creates an <code>EventManager</code> instance and a new
	 * overall events <code>Hashtable</code>, which will be filled with the
	 * individual event lists.
	 */
	public EventManager(UsaProxy usaProxy) {
		events = new Hashtable();
		this.usaProxy = usaProxy;
	}

	/**
	 * Adds events to the corresponding events <code>ArrayList</code>.
	 * 
	 * @param out
	 *            is the client's <code>OutputStream</code>.
	 * @param events
	 *            contains the events to be appended.
	 * @param list
	 *            specifies the common events list of the client and his shared
	 *            session partner (i.e. list is specified by the client's
	 *            session ID who initiated the shared session)
	 */
	public void append(OutputStream out, String events, String list)
			throws IOException {
		if (!this.events.containsKey(list))
			this.events.put(list, new ArrayList());

		String[] eventsArray;
		/** first, split the single event entries */
		eventsArray = events.split("&xX");

		/**
		 * append all entries to the corresponding events list. In the case of
		 * an occured load event, put the appended httptrafficindex (i.e. sd
		 * parameter value) into the partner's sd field in his Partners Array
		 * (field specifying which recorded page this client is allowed to
		 * request next)
		 */
		for (int m = 0; m < eventsArray.length; m++) {

			/** append entry */
			appendEvent(eventsArray[m].replaceAll("&", " "), list);

			/**
			 * if load event, assign the specified httptrafficindex (i.e. sd) to
			 * the partner's sd field
			 */
			if (HTTPData.getValue(eventsArray[m], "event").equals("load")) {
				/** retrieve sd and the user's session ID from event String */
				String sd = HTTPData.getValue(eventsArray[m], "sd");
				String sid = HTTPData.getValue(eventsArray[m], "sid");
				/** get the user's partner Array from partners Hashtable */
				String[] sidArray = (String[]) usaProxy.getUsers()
						.getPartners().get(sid);
				/** the partner's session ID is stored at the first position */
				String psid = sidArray[0];
				/** get the partner's partner Array from partners Hashtable */
				String[] partnerArray = (String[]) usaProxy.getUsers()
						.getPartners().get(psid);
				/**
				 * set the exclusively requestable sd into the 3rd Array field
				 * (sd field)
				 */
				partnerArray[2] = sd;
				/** put modified partnerArray back into partners Hashtable */
				usaProxy.getUsers().getPartners().put(psid, partnerArray);
			}
		}
		// for (int i=0; i<eventsArray.length; i++)
		// System.out.println(eventsArray[i]);

		/** send 404 message in order to complete the request */
		SocketData.send404(out);

	}

	/**
	 * Appends an event string to the corresponding events
	 * <code>ArrayList</code> which is referenced in the overall events
	 * <code>Hashtable</code> by the string specified in list (i.e. the
	 * proposer's session ID).
	 * 
	 * @param event
	 *            is the string to be added
	 * @param list
	 *            specifies the common events list of the client and his shared
	 *            session partner (i.e. list is specified by the client's
	 *            session ID who initiated the shared session)
	 */
	private void appendEvent(String event, String list) {
		/**
		 * get the respective ArrayList from events Hashtable referenced by list
		 */
		ArrayList events = (ArrayList) this.events.get(list);
		/** append event */
		events.add(event);
		/** put modified list back into messages Hashtable */
		this.events.put(list, events);
	}

	/**
	 * Deletes entry in events <code>Hashtable</code> specified by list.
	 * 
	 * @param list
	 *            is the string which specifies the <code>ArrayList</code> to be
	 *            removed
	 */
	public void deleteList(String list) {
		if (this.events.containsKey(list))
			this.events.remove(list);
	}

	/**
	 * Writes exclusively log records to the log file.
	 * 
	 * @param out
	 *            is the client's <code>Outputstream</code>.
	 * @param data
	 *            is the event string to be logged.
	 *            
	 * @param clientIP
	 * 			  we add the clientIP in case the client has already left, this will prevent future errors. 
	 * @param client
	 *            is the client's <code>Socket</code>.
	 * @param logFilename
	 *            specifies the log file.
	 */
	public void log(OutputStream out, String data, String clientIP, Socket client) {

		int numberOfDomChanges;

		/** if client log request (else: serverdata log-request from proxy) */
		//if (out != null)
			//out = new DataOutputStream(out);

		try {

			/** retrieve the client's IP address */
			//String clientIP = client.getInetAddress().getHostAddress();

			String[] dataArray;

			/**
			 * split data String into single event entries (entry separator
			 * "&xX")
			 */
			dataArray = data.split("&xX");

			// This timestamp will tell us when was the last time an event was
			// recorded for this user
			// It will be used to discern if the recording of a new milestone
			// DOM is necessary

			Long lastEventStoredTS = (long) 0;

			try {
				if (!dataArray[0].equals("null"))
					lastEventStoredTS = Long.parseLong(dataArray[0]);

			} catch (NumberFormatException e) {
				ErrorLogging
						.logError(
								"EventManager.java:logDOMChangeToDB",
								"There was a parsing error with the lastEventStoredTS which value is: "
										+ dataArray[0], e);
			}

			data = "";

			/**
			 * append each entry to the final log String together with the
			 * related IP address As the first element (dataArray[0]) was the
			 * last stored event timestamp, the events are recorded from "1"
			 */
			for (int m = 1; m < dataArray.length; m++) {

				/** if entry not empty */
				if (dataArray[m].length() > 0) {

					/**
					 * replace separators ("&") with spaces, leave attribute
					 * values escaped
					 */
					dataArray[m] = dataArray[m].replaceAll("&", " ");

					// I will have to check if the event is "domchange" is
					// being recorded in order to send it to logDOMChange
					if (isEventDOMChange(dataArray[m])) {

						ErrorLogging.logError("EventManager.java: log()","There was a dom CHANGE",null);

						// numberOfDomChanges = logDOMChange(lastEventStoredTS,
						// dataArray[m], clientIP);

						numberOfDomChanges = logDOMChangeToDB(
								lastEventStoredTS, dataArray[m], clientIP);
						ErrorLogging.logError("EventManager.java:log()",
								"Updating timestamp from " + lastEventStoredTS
										+ " to " + new Date().getTime(), null);
						lastEventStoredTS = new Date().getTime();

						// If it's a DOM change event, then we need to remove
						// the information from the traditional log
						// I will use regex with the information obtained from:
						// http://stackoverflow.com/questions/4026685/regex-to-get-text-between-two-characters
						// This regex will delete everything after domchange

						if (numberOfDomChanges != -1) {
//							dataArray[m] = dataArray[m].replaceAll(
//									"(?<=domchange)[^$]*", "");

							dataArray[m] += " numberofchanges="
									+ numberOfDomChanges;

							logEventToDB(clientIP, dataArray[m]);
						}

					}

					else {
						// Log information to the database
						logEventToDB(clientIP, dataArray[m]);
					}

					/** append complete entry */
					data = data + clientIP + " " + dataArray[m] + HTTPData.CRLF;
				}
			}

			//if (writeToLogFile(data) && out != null) {
//			if (writeToLogFile(data)) {
//
//				/** send 404 message in order to complete the request */
//				// Changed to 200 message
//				//SocketData.send200(out);
//			}
//
//		} catch (FileNotFoundException e) {
//			/** If log file doesn't exist, send 404 message. */
//			System.err.println("\nAn ERROR occured: log file not found:\n" + e);
//
//			ErrorLogging.logError("Event Manager.java: log()",
//					"log file not found while trying to write the following data:\n"
//							+ data, e);
//
//			/** Send 404 error message to client */
////			PrintWriter outPrint = new PrintWriter(new OutputStreamWriter(out));
////			outPrint.println("HTTP/1.0 404 ");
////			/** version and status code */
////			outPrint.println();
////			/** blank line */
////			outPrint.flush();
		}

		catch (Exception ie) {
			System.err.println("\nAn ERROR occured while logging:\n" + ie);
		}

		/** notify waiting clients that log file is accessible */
		//notifyAll();

	}

	/**
	 * This function writes the data given as an input into the log file. It
	 * will also handle situations in which log file gets too big. In that case
	 * it will backup the current log file and create a new one.
	 * 
	 * @param data
	 *            is the data to write to the log file.
	 * @return boolean indicating if the writing was successfull or not
	 */
	public boolean writeToLogFile(String data) throws IOException {

		boolean returnValue = false;
		/** Open a stream to the log file. */
		File logFile = new File(logFolder, logFilename);

		// System.out.println("recordingsLeftToCheckSize: " +
		// recordingsLeftToCheckSize +", and log file size:" +
		// logFile.length());

		// if it's time to check the size
		if (recordingsLeftToCheckSize == 0) {
			// we restart the "time to check" counter
			recordingsLeftToCheckSize = recordingsLeftToCheckSizeDefault;

			// If the size is bigger than the allowed one, create a new log file
			// and add a timestamp to the old one
			if (logFile.length() > maxLogSize) {

				SimpleDateFormat sdf = new SimpleDateFormat(
						"yyyy-MM-dd,HH-mm-ss-SSS");
				Date dt = new Date();
				String timeStamp = sdf.format(dt);

				File oldLogFile = new File(logFolder, timeStamp + "_"
						+ logFilename);

				// if the rename function works we create a new log file
				// and writes the new data to it
				try {
					FileUtils.moveFile(logFile, oldLogFile);
					File newLog = new File(logFolder, logFilename);
					FileOutputStream fos = new FileOutputStream(newLog, true);
					fos.write(data.getBytes());
					fos.flush();
					fos.close();
					returnValue = true;
				} catch (Exception e) {
					// There was a problem with the rename function, we record
					// the error
					ErrorLogging.logError("EventManager.java:writeToLogFile()",
							"Trying to rename the old log file failed", e);
					returnValue = false;
				}
			}
		} else {
			// We record it like we normally would
			recordingsLeftToCheckSize--;
			FileOutputStream fos = new FileOutputStream(logFile, true);
			fos.write(data.getBytes());
			fos.flush();
			fos.close();
			returnValue = true;
		}
		return returnValue;
	}

	/**
	 * Sends all entries in events <code>ArrayList</code>, which have an index
	 * greater than "last" (parameter specified in event string), to the client
	 * in the form of a XML document.
	 * 
	 * @param out
	 *            is the client's <code>OutputStream</code>.
	 * @param event
	 *            is the original request for events.
	 */
	public void send(OutputStream out, String event, String list)
			throws IOException {

		/** retrieve last requested event entry id */
		String last = HTTPData.getValue(event, "last");
		int eventID = Integer.parseInt(last);

		/**
		 * generate new individual events list for this pair of clients if it
		 * doesn't exist yet
		 */
		if (!this.events.containsKey(list))
			this.events.put(list, new ArrayList());

		// String sid = HTTPData.getValue(event, "sid");

		/**
		 * get the respective ArrayList from events Hashtable referenced by list
		 */
		ArrayList events = (ArrayList) this.events.get(list);

		/**
		 * generate response headers, add Cache-Control header so that the
		 * response won't be cached by the client, assign a XML content type
		 * since events are sent as XML document
		 */

		StringBuffer headers = new StringBuffer();

		headers.append("HTTP/1.1 200").append(HTTPData.CRLF);
		headers.append("Expires: Mon, 26 Jul 1997 05:00:00 GMT").append(
				HTTPData.CRLF);
		headers.append("Cache-Control: no-cache, must-revalidate").append(
				HTTPData.CRLF);
		headers.append("Pragma: no-cache").append(HTTPData.CRLF);
		headers.append("Content-Type: text/xml; charset=utf-8").append(
				HTTPData.CRLF + HTTPData.CRLF);

		out = new DataOutputStream(out);

		/** send headers */
		out.write(headers.toString().getBytes(
				HTTPData.HEADER_DEFAULT_CHAR_ENCODING));

		/** generate XML document */
		StringBuffer XMLmessages = new StringBuffer();
		XMLmessages.append("<?xml version=\"1.0\" ?><root>").append(
				HTTPData.CRLF);

		/** if new events are available append them to the XML document */
		if ((eventID + 1) < events.size()) {

			/** max. last 5 entries */
			if (events.size() - (eventID + 1) > 5)
				eventID = events.size() - 5;

			/**
			 * append each event specified by a couple of available properties:
			 * the event type, an offset value (used for relative mouse
			 * position), the related httptrafficindex (i.e. sd) and the URL of
			 * the page the event occurred on, size of the browser window
			 * (load/resize event), session ID, id, dom path, x and y values,
			 * etc.
			 */
			for (int i = (eventID + 1); i < events.size(); i++) {
				String eventEntry = (String) (events.get(i));

				/** retrieve the event type */
				String eventType = getValue(eventEntry, "event");
				/** retrieve offset attribute */
				String eventOffset = getValue(eventEntry, "offset");
				/** retrieve serverdata ID attribute */
				String eventSd = getValue(eventEntry, "sd");
				/** retrieve page attribute (load event) */
				String eventPage = getValue(eventEntry, "page");
				/** retrieve size attribute (resize event) */
				String eventSize = getValue(eventEntry, "size");
				/** retrieve session ID attribute */
				String eventSid = getValue(eventEntry, "sid");
				/** retrieve id attribute */
				String eventId = getValue(eventEntry, "id");
				/** retrieve dom attribute */
				String eventDom = getValue(eventEntry, "dom");
				/** retrieve y attribute (scroll event) */
				String eventY = getValue(eventEntry, "y");
				/** retrieve y attribute (scroll event) */
				String eventX = getValue(eventEntry, "x");
				/** retrieve field type attribute */
				String eventFieldType = getValue(eventEntry, "type");
				/** retrieve field value attribute */
				String eventValue = getValue(eventEntry, "value");
				/** retrieve field checked attribute */
				String eventChecked = getValue(eventEntry, "checked");
				/** retrieve field checked attribute */
				String eventSelected = getValue(eventEntry, "selected");

				/** create XML event element */
				XMLmessages.append("<event id=\"" + i + "\">").append(
						HTTPData.CRLF);
				XMLmessages.append("<type>" + eventType + "</type>").append(
						HTTPData.CRLF);
				if (eventOffset != null)
					XMLmessages.append("<offset>" + eventOffset + "</offset>")
							.append(HTTPData.CRLF);
				if (eventSd != null)
					XMLmessages.append("<sd>" + eventSd + "</sd>").append(
							HTTPData.CRLF);
				if (eventPage != null)
					XMLmessages.append("<page>" + eventPage + "</page>")
							.append(HTTPData.CRLF);
				if (eventSize != null)
					XMLmessages.append("<size>" + eventSize + "</size>")
							.append(HTTPData.CRLF);
				if (eventSid != null)
					XMLmessages.append("<sid>" + eventSid + "</sid>").append(
							HTTPData.CRLF);
				if (eventId != null)
					XMLmessages.append("<id>" + eventId + "</id>").append(
							HTTPData.CRLF);
				if (eventDom != null)
					XMLmessages.append("<dom>" + eventDom + "</dom>").append(
							HTTPData.CRLF);
				if (eventY != null)
					XMLmessages.append("<y>" + eventY + "</y>").append(
							HTTPData.CRLF);
				if (eventX != null)
					XMLmessages.append("<x>" + eventX + "</x>").append(
							HTTPData.CRLF);
				if (eventFieldType != null)
					XMLmessages.append(
							"<fieldtype>" + eventFieldType + "</fieldtype>")
							.append(HTTPData.CRLF);
				if (eventValue != null)
					XMLmessages.append("<value>" + eventValue + "</value>")
							.append(HTTPData.CRLF);
				if (eventChecked != null)
					XMLmessages.append(
							"<checked>" + eventChecked + "</checked>").append(
							HTTPData.CRLF);
				if (eventSelected != null)
					XMLmessages.append(
							"<selected>" + eventSelected + "</selected>")
							.append(HTTPData.CRLF);
				XMLmessages.append("</event>").append(HTTPData.CRLF);
			}
		}
		XMLmessages.append("</root>");

		/** send XML response */
		out.write(XMLmessages.toString().getBytes(
				HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
		/** Write it to client output stream */
		out.flush();
		/** Remember to flush output buffer */
		// System.err.println(XMLmessages.toString());

	}

	/**
	 * Returns the events <code>Hashtable</code>.
	 * 
	 * @return the events <code>Hashtable</code>
	 */
	public Hashtable getEvents() {
		return events;
	}

	/**
	 * Retrieves the value of the specified parameter from the event string. If
	 * none was appended, it returns null.
	 * 
	 * @param event
	 *            is the string to be examined
	 * @param parameter
	 *            is the attribute to be searched for in the event string
	 */
	public String getValue(String event, String parameter) {
		int start; // the start index
		if (event == null)
			return null;

		/**
		 * if attribute exists retrieve start index (blank neccessary since id=
		 * included in sid=)
		 */
		if (event.indexOf(" " + parameter + "=") > -1)
			start = event.indexOf(" " + parameter + "=") + 2
					+ parameter.length();
		else
			start = -1;

		/** if attribute exists retrieve end index and return the value */
		if (start != -1) {
			int end = event.indexOf(" ", start);
			if (end == -1)
				end = event.length();
			/** retrieve value according to start and end position */
			String attValue = event.substring(start, end);
			return attValue;
		} else {
			return null;
		}
	}

	/**
	 * Simple function that tells if the current event string is a domchange
	 * event
	 * 
	 * @param data
	 *            is the string to be examined, which will contain a single
	 *            event
	 * 
	 */

	public boolean isEventDOMChange(String data) {

		// The input should be in this format:
		// time=2012-11-05,18:15:39:981 sd=20002 sid=4WIUpRFctOr7
		// event=domchange domContent= ”encodedDOM”

		String[] paramList = data.split(" ");

		for (int i = 0; i < paramList.length; i++) {
			String[] paramItemPair = paramList[i].split("=");
			if (paramItemPair[0].equals("event")
					&& paramItemPair[1].equals("domchange"))
				return true;

		}
		// we have analysed all items in the event string and none of them told
		// us it was a domchange
		return false;

	}

//	/**
//	 * Records the specific event of DOM change, the folder and name of file
//	 * will depend on the values of sid and sd. A timestamped file will hold a
//	 * screenshot of the current DOM
//	 * 
//	 * @param lastEventStoredTS
//	 *            is the timestamp (2013-03-31,18:12:09:939 format) of the last
//	 *            event stored for that user
//	 * 
//	 * @param newdomData
//	 *            is the string to be examined, which will include the complete
//	 *            encoded DOM
//	 * @param clientIP
//	 *            is the client's machine IP address
//	 * 
//	 * @return An integer with the count of DOM changes that happened with
//	 *         respect to the last recorded DOM. If the DOM is saved for the
//	 *         first time it will be 0, and -1 in case of error.
//	 */
//
//	public int logDOMChange(String lastEventStoredTS, String newdomData,
//			String clientIP) {
//
//		int numberOfDomChanges;// variable that will contain the number of DOM
//		// changes. If it records a new DOM it will be
//		// 0.
//
//		try {
//			// /First we need to get all the data, it should arrive in the
//			// following format, and we have already tested it is a "domchange"
//			// event
//			// time=2012-11-05,18:15:39:981 sd=20002 sid=4WIUpRFctOr7
//			// event=domchange domContent= ”encodedDOM”
//
//			String[] paramList = newdomData.split(" ");
//			String time = "", sd = "", sid = "", domContent = "", event = "", url = "";
//
//			for (int i = 0; i < paramList.length; i++) {
//				String[] paramItemPair = paramList[i].split("=");
//
//				switch (paramItemPair[0]) {
//				case "time":
//					time = paramItemPair[1];
//					break;
//				case "sd":
//					sd = paramItemPair[1];
//					break;
//				case "sid":
//					sid = paramItemPair[1];
//					break;
//				case "domContent":
//					domContent = paramItemPair[1];
//					break;
//				case "event":
//					event = paramItemPair[1];
//				case "url":
//					url = paramItemPair[1];
//				default:
//					// this case should not happen
//					ErrorLogging.logError("EventManager.java:logDOMChange",
//							"This switch case should never happen", null);
//				}
//			}
//
//			domContent = URLDecoder.decode(domContent, "UTF-8");
//
//			boolean saveEntireDOM = false;
//			/** Create a folder with the session ID if it doesn't exist */
//			File dir = new File("DOMchanges", sid);
//			if (!dir.exists()) {
//				dir.mkdir();
//				// If the folder doesn't exist, that means this will be the
//				// first DOM to log.
//				// We need to store the entire DOM, and the successive
//				// recordings will be modifications to this DOM
//				saveEntireDOM = true;
//			}
//
//			/** append complete entry */
//			newdomData = domContent;
//
//			// We need to read the previous state of the DOM
//			File latestDOM = new File(dir, "currentStateDOM");
//
//			// if it's the first file then we store the entire DOM,
//			// including the temporal copy representing the latest DOM
//			if (saveEntireDOM) {
//
//				// WE ONLY CREATE THE FILE IF WE NEED IT, otherwise it will
//				// leave an empty file
//				// The name of the file where the dom/changes will be stored
//
//				// we need to replace : in time for - so it doens't provoke any
//				// error in windows file systems
//				File filename = new File(dir, time.replace(":", "-") + ";" + sd);
//				/** Open a stream to the log file. */
//				FileOutputStream fos = new FileOutputStream(filename, false);
//
//				numberOfDomChanges = 0;
//				fos.write(newdomData.getBytes());
//				fos.flush();
//				fos.close();
//			}
//			// otherwise we store the differences with the current last DOM
//			// We will only save it IF there were any, if not we don't save
//			// anything
//			else {
//
//				String latestDOMString = getStringFromFile(latestDOM);
//
//				// System.out.println("The original DOM was: " +
//				// latestDOMString);
//				// System.out.println();
//				// System.out.println("The new DOM is: " + newdomData);
//				String domChangesString = DOMdiff.getChangesLogJSON(
//						removeNewLines(latestDOMString),
//						removeNewLines(newdomData), clientIP, time, sd, sid,
//						url);
//
//				numberOfDomChanges = DOMdiff.lastNumberOfDomChanges;
//
//				if (numberOfDomChanges > 0) {
//
//					// WE ONLY CREATE THE FILE IF WE NEED IT, otherwise it will
//					// leave an empty file
//					// The name of the file where the dom/changes will be stored
//					File filename = new File(dir, time.replace(":", "-") + ";"
//							+ sd);
//					/** Open a stream to the log file. */
//					FileOutputStream fos = new FileOutputStream(filename, false);
//
//					fos.write(domChangesString.getBytes());
//					fos.flush();
//					fos.close();
//				}
//			}
//
//			FileOutputStream latestDOMOutput = new FileOutputStream(latestDOM,
//					false);
//
//			latestDOMOutput.write(newdomData.getBytes());
//			latestDOMOutput.flush();
//			latestDOMOutput.close();
//
//			return numberOfDomChanges;
//
//		} catch (FileNotFoundException e) {
//			/** If log file doesn't exist, send 404 message. */
//			System.err
//					.println("\nAn ERROR occured: problems accessing the log file for DOM change:\n"
//							+ e);
//
//			ErrorLogging
//					.logError(
//							"EventManager.java: logDOMChange()",
//							"ERROR occured: problems accessing the log file for DOM change",
//							e);
//		}
//
//		catch (IOException ie) {
//			System.err
//					.println("\nAn ERROR occured while logging DOM change event data:\n"
//							+ ie);
//
//			ErrorLogging.logError("EventManager.java: logDOMChange()",
//					"ERROR occured while logging DOM change event data", ie);
//		}
//		return -1;
//
//	}

	/**
	 * Records the specific event of DOM change to the MongoDB. It works the
	 * same way as logDOMChange, without using files.
	 * 
	 * @param lastEventStoredTS
	 *            is the timestamp (2013-03-31,18:12:09:939 format) of the last
	 *            event stored for that user
	 * 
	 * @param newdomData
	 *            is the string to be examined, which will include the complete
	 *            encoded DOM
	 * @param clientIP
	 *            is the client's machine IP address
	 * 
	 * @return An integer with the count of DOM changes that happened with
	 *         respect to the last recorded DOM. If the DOM is saved for the
	 *         first time it will be 0, and -1 if no DOM event was stored, or in
	 *         case of error.
	 */

	public int logDOMChangeToDB(Long lastEventStoredTS, String newdomData,
			String clientIP) {

		int numberOfDomChanges = -1;// variable that will contain the number of
									// DOM
		// changes. If it records a new DOM it will be
		// 0.

		EventDataHashMap eventHashMap = new EventDataHashMap(newdomData);
		
		
		String sid = eventHashMap.get(EventConstants.SID);
		
		String sessionstartms = eventHashMap.get(EventConstants.SESSIONSTARTMS);
		
		//We parse the data we need from the hashmap
		//String time = "", timems = "", sd = "", sid = "", encodedDomContent = "", event = "", url = "", browser = "", platform = "";
		
		//String sessionstartms = "",  sessionstartparsed = "", usertimezoneoffset = "";

		//String decodedDomContent = "", decodedUrl = "";

//		timems = eventHashMap.get(EventConstants.TIMESTAMP);
//		
//		time = GenericEvent.formatDateFromMs(eventHashMap.get(EventConstants.TIMESTAMP));
//		
//		sessionstartms = eventHashMap.get(EventConstants.SESSIONSTARTMS);
//		
//		sessionstartparsed = GenericEvent.formatDateFromMs(eventHashMap.get(EventConstants.SESSIONSTARTMS));
//		
//		usertimezoneoffset = eventHashMap.get(EventConstants.USERTIMEZONEOFFSET);
//		sd = eventHashMap.get(EventConstants.SD);
//		
//		
//		
//		decodedDomContent = eventHashMap.get(EventConstants.DOMCONTENT);
//		
//		decodedUrl = eventHashMap.get(EventConstants.URL);
//		
//		browser = eventHashMap.get(EventConstants.BROWSER);
//		
//		platform = eventHashMap.get(EventConstants.PLATFORM);

		boolean saveEntireDOM = false;

		/*
		 * There will be three different collections for the IF there was a lack
		 * of that user events for more than 20 minutes OR it has no
		 * milestoneTEMP If so, record new milestone Change milestoneTemp to the
		 * new milestone (update existing one or insert new) ELSE Look for the
		 * last DOMTemp Milestone. (If there isn't one, do previous step) Get
		 * differences with that milestone Record differences with it Update
		 * obtained milestone temp with the new DOM (mongo's update function?)
		 */

		// IF there was a lack of that user events for more than 20 minutes
		// OR it has no milestoneTEMP

		// If there is any error with the dates, we will want to store the
		// entire DOM
		long diffDateMinutes = interactEpisLengthMinutes + 10;

		// lastEventTS = MongoDAO.MongoDAO().getLastEventTimestampForUser(sid);

		diffDateMinutes = ((new Date().getTime() / 60000) - (lastEventStoredTS / 60000));

		// ErrorLogging.logError("EventManager.java:logDOMChangeToDB()",
		// "Last TS was "+ Long.parseLong(lastEventStoredTS)
		// + " and current date is " + new Date().getTime(), null);
		//
		// diffDateMinutes = ((new Date().getTime() / 60000)
		// - (Long.parseLong(lastEventStoredTS)/ 60000));

		if (diffDateMinutes > interactEpisLengthMinutes) {
			// We need to store the entire DOM, and the successive
			// recordings will be modifications to this DOM
			saveEntireDOM = true;

			ErrorLogging.logError("EventManager.java:logDOMChangeToDB()",
					"Saving entire DOM. \n Last TS was " + lastEventStoredTS
							+ " and current date is " + new Date().getTime()
							+ "\n" + "The difference was " + diffDateMinutes
							+ " which is more than "
							+ interactEpisLengthMinutes, null);

		} else {

			ErrorLogging.logError("EventManager.java:logDOMChangeToDB()",
					"NOT saving entire DOM. \n Last TS was "
							+ lastEventStoredTS + " and current date is "
							+ new Date().getTime() + "\n"
							+ "The difference was " + diffDateMinutes
							+ " which is less than "
							+ interactEpisLengthMinutes, null);

		}

		/** append complete entry */

		// We need to read the previous state of the DOM
		// This needs to be a Mongo function.
		// Read the last milestone TEMP DOM from the database for that user
		DOMBean latestDOMTemp = MongoDAO.MongoDAO().getTempMilestoneForSid(sid, sessionstartms);

		
		
		DOMBean currentDOM = new DOMBean(eventHashMap);
		
		//DOMBean domToSave = new DOMBean(time, timems, sd, sid, clientIP, decodedUrl,
			//	browser, platform, decodedDomContent);

		// if there was no temporary DOM, then store entire DOM
		if (latestDOMTemp == null)
			saveEntireDOM = true;

		// if there wasn't any previous temporary DOM, we store the entire DOM

		// we also need to store the temporary one, but that will be done later
		if (saveEntireDOM) {
			MongoDAO.MongoDAO().commitJsonToDOM(currentDOM.toGson());

			numberOfDomChanges = 0;

		}
		// otherwise we store the differences with the current last DOM
		// We will only save it IF there were any, if not we don't save
		// anything
		else {

			// Get the correspondent TEMP DOM for that user and decode the
			// DOM (it's decoded directly from the Bean, in the
			// "getDomContent()" function
			String decodedOldDOM = latestDOMTemp.getDomContent();

			String domChangesString = DOMdiff.getChangesLogJSON(
					removeNewLines(decodedOldDOM),
					removeNewLines(currentDOM.getDomContent()), currentDOM);


			if (DOMdiff.lastNumberOfDomChanges > 0) {

				numberOfDomChanges = DOMdiff.lastNumberOfDomChanges;
				// /Store the changes to the database
				MongoDAO.MongoDAO().commitJsonToDOMChange(domChangesString);
			}
		}

		MongoDAO.MongoDAO().upsertDOMTempForUser(currentDOM);

		return numberOfDomChanges;

	}

	/**
	 * Logs the event to the database, in order to do that, it has to discern
	 * what kind of event it is, map it into the corresponding event Java class
	 * from usaproxy.events and serialize it into a JSON. After that it will
	 * submit it to the Database.
	 * 
	 * @param ipAddress
	 *            String with the users' IP address
	 * @param eventData
	 *            String with all the information about the event, this is the
	 *            string that needs to be parsed.
	 * 
	 * 
	 */
	public void logEventToDB(String ipAddress, String eventData) {

		// EventDataHashMap will automatically parse the event data,
		// and by adding the IP address we will have all the information there
		EventDataHashMap eventHashMap = new EventDataHashMap(eventData);
		eventHashMap.put(EventConstants.IPADDRESS, ipAddress);

		try{
			
			// We look the type of event, to then create the corresponding Java
			// class and serialize into a JSON
			MongoDAO.MongoDAO().commitJsonToEvents(
				FactoryEvent.getJsonFromEventHashMap(eventHashMap));
			
		}catch (Exception e){
			
			//We put in a printable String all the information contained in the tab
			String hashMapContents ="";
			for (int hashIndex = 0; hashIndex < eventHashMap.dataMap.keySet().size(); hashIndex++){
				
				hashMapContents += eventHashMap.dataMap.keySet().toArray()[hashIndex]
						+ ":"
						+ eventHashMap.dataMap.get(eventHashMap.dataMap
								.keySet().toArray()[hashIndex]) + "\n";
			}
			ErrorLogging.logCriticalError("EventManager.java:logEventToDB", 
					"There was an error when trying to commit the following event to the database from a Hashtable:\n" + hashMapContents, e);		
			
		}


	}

	public String getStringFromFile(File filename) {
		List<String> lineList;
		try {
			lineList = Files.readAllLines(Paths.get(filename.getPath()),
					StandardCharsets.UTF_8);

			String fileString = "";
			for (int i = 0; i < lineList.size(); i++) {
				fileString += lineList.get(i);
				fileString += "\n";
			}

			// Cutting out the last "\n" to avoid different files from the one
			// in the system
			fileString = fileString.substring(0, fileString.length() - 1);
			return fileString;

		} catch (IOException e) {
			System.out
					.println("EventManager.java/getStringFromFile: ERROR accessing the following file:"
							+ filename.getPath());
			e.printStackTrace();
			return null;
		}
	}

	/*
	 * this function will just remove the useless "newline" tags for comparison
	 */
	public String removeNewLines(String input) {
		input = input.replaceAll("\n", "");
		input = input.replaceAll("\r", "");
		return (input);
	}

}
