package usaproxy;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.util.Date;

/**
 * Class <code>FileSender</code> is used for the forwarding of JavaScript files,
 * images, and stylesheets. <br>
 * <br>
 * In the case the proxyscript.js JavaScript is requested, additional customized
 * parameters are added such as the user status. Furthermore, the JavaScript
 * file is assembled accordingly from the adequate raw JavaScript files (e.g. if
 * UsaProxy is running in pure logging mode the logging-script is delivered form
 * the "log" folder, whereas, if remote monitoring is set up, special code from
 * the "rm" folder is attached to the raw collaboration JavaScript, which is
 * present in the top-level "js" folder.
 */
public class FileSender {

	/**
	 * Opens a FileInputStream to the file and sends it to the client. In the
	 * case a JavaScript file is requested, it is dynamically assembled from the
	 * corresponding raw JavaScript files and enriched with customized
	 * parameters. Otherwise, the image or the css-file is directly delivered.
	 * 
	 * @param out
	 *            is the client's <code>OutputStream</code>.
	 * @param filename
	 *            is the name of the file to be send.
	 * @param sessionID
	 *            is the clients current/new session ID.
	 * @param status
	 *            is the client's status (offline/online)
	 * @param lastLogEntry
	 *            is the current last index of the events <code>Hashtable</code>
	 * @param logMode
	 *            holds the logging mode e.g. "pagereq", "all", or "" in the
	 *            case that logging is disabled
	 */
	public void send(DataOutputStream out, String filename, String sessionID,
			String status, String partnerSID, int lastLogEntry, String logMode) throws IOException {

		try {

			File file;
			String filepath = "";

			/** get file path according to the requested file */
			/** if JavaScript, specify the respective raw JavaScript file path */
			if (HTTPData.guessType(filename).equals("text/javascript")) {
				if (logMode.equals("all"))
					filepath = "js/log/";
			}
			/** css file */
			else if (HTTPData.guessType(filename).equals("text/css")) {
				filepath = "css/";
			}
			/*
			 * not neccessary since html files are requested via getHTMLStream()
			 * else if (HTTPData.guessType(filename).equals("text/html")) {
			 * filepath = "html/"; }
			 */
			/** image file */
			else if (HTTPData.guessType(filename).equals("image/jpeg")
					|| HTTPData.guessType(filename).equals("image/gif")) {
				filepath = "img/";
			}

			/** create File object */
			file = new File(filepath + filename);
			/** Open a stream to the file */
			BufferedInputStream in = new BufferedInputStream(
					new FileInputStream(file));

			/** new headers StringBuffer */
			StringBuffer headers = new StringBuffer();

			/**
			 * enrich final proxyscript.js with additonal code and parameters
			 */
			if (filename.equals("proxyscript.js")) {

				// //We got rid of the cookie, instead the user will store it
				// and send it back to us in the request
				// /** session ID cookie */
				// String cookieText = "";
				// if(sessionID!=null && !(sessionID.equals(""))) cookieText =
				// sessionID;
				// else cookieText = "hallowelthal";
				// String sessionSetter = "var sessionID_UsaProxy='" +
				// cookieText + "';" + HTTPData.CRLF;
				// cookieText = "userUsaProxy=" + cookieText;

				// New cookie code
				String sessionIDText = "";
				if (sessionID != null && !(sessionID.equals("")))
					sessionIDText = sessionID;
				else
					sessionIDText = "hallowelthal";
				String sessionSetter = "var sessionID_Proxy='" + sessionIDText
						+ "';" + HTTPData.CRLF;

				/*
				 * We also add the server time as a variable
				 */
				String startDate = "var startDate_UsaProxy='" + new Date().getTime()
						+ "';" + HTTPData.CRLF;

				int contentLength = 0;

				/**
				 * if no sharing mode defined but full logging, leave out any
				 * shared session JavaScript variables and code
				 */
				if (logMode.equals("all")) {

					contentLength = sessionSetter.length() + startDate.length()
					+ (int) file.length();

				}
				
				/**
				 * generate response headers, add Cache-Control header so that
				 * the response won't be cached by the client, assign a
				 * application/x-javascript type since advanced JavaScript is
				 * delivered, append "Set-Cookie" header
				 */

				headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
				headers.append("Content-Type: application/x-javascript")
				.append(HTTPData.CRLF);
				headers.append("Content-Length: " + contentLength).append(
						HTTPData.CRLF);
				/** browser requires loading proxyscript.js each time */
				headers.append("Cache-Control: no-cache, must-revalidate")
				.append(HTTPData.CRLF);

				// We don't append the cookie anymore
				// headers.append("Set-Cookie: " +
				// cookieText).append(HTTPData.CRLF);
				headers.append(HTTPData.CRLF);

				/** send headers */
				out.writeBytes(headers.toString());

				/** append additional code and parameters to proxyscript.js */

				/** paste sessionID variable into proxyscript.js */
				out.writeBytes(sessionSetter);

				/** paste timestamp variable*/
				out.writeBytes(startDate);

			}
			
			/** send the file resp. the raw proxyscript.js */
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf, 0, 1024)) != -1) {
				out.write(buf, 0, len);
			}
			in.close();

			out.flush();
		} catch (FileNotFoundException e) {
			/** If no such file, then display the famous 404 message. */
			/** If log file doesn't exist, display the famous 404 message. */
			System.err.println("\nAn ERROR occured: script file not found:\n"
					+ e);

			ErrorLogging.logError("FileSender.java: send()",
					"ERROR occured: script file not found",e);

			SocketData.send404(out);
		}
	}

	/**
	 * Returns a <code>FileInputStream</code> to the specified HTML file. This
	 * method is used for the delivery of special HTML pages such as
	 * "remotemonitoring.htm", or "sharedbrowsing.htm".
	 * 
	 * @param filename
	 *            is the file to be processed
	 * @return the <code>FileInputStream</code> of the file to be processed
	 */
	public InputStream getHTMLData(String filename) {
		try {

			File file = new File("html/" + filename);

			/** Open a stream to the file with the specified index */
			FileInputStream fis = new FileInputStream(file);

			StringBuffer headers = new StringBuffer();

			/**
			 * create HTTP response headers, add Cache-Control header so that
			 * the response won't be cached by the client
			 */
			headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
			headers.append("Content-Type: text/html").append(HTTPData.CRLF);
			headers.append(
					"Content-Length: " + (new Long(file.length())).toString())
			.append(HTTPData.CRLF);
			headers.append("Cache-Control: no-cache, must-revalidate").append(
					HTTPData.CRLF);
			headers.append(HTTPData.CRLF);

			/** headers stream */
			ByteArrayInputStream bais = new ByteArrayInputStream(headers
					.toString().getBytes());

			/** combine headers stream with file stream */
			SequenceInputStream sis = new SequenceInputStream(bais, fis);

			return sis;

		} catch (FileNotFoundException e) {
			/** If no such file, then display the famous 404 message. */
			/** If log file doesn't exist, display the famous 404 message. */

			ErrorLogging.logError("FileSender.java: getHTMLData()", "file "
					+ filename + " not found", e);
			return null;
		}
	}

}
