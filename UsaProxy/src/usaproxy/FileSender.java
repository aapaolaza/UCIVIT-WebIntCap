package usaproxy;
import java.io.*;

/** 
 *  Class <code>FileSender</code> is used for the forwarding of JavaScript files, images, and stylesheets.
 *  <br><br>
 *  In the case the proxyscript.js JavaScript is requested, additional customized
 *  parameters are added such as the user status. Furthermore, the JavaScript file is
 *  assembled accordingly from the adequate raw JavaScript files (e.g. if UsaProxy
 *  is running in pure logging mode the logging-script is delivered form the "log" folder,
 *  whereas, if remote monitoring is set up, special code from the "rm" folder is attached 
 *  to the raw collaboration JavaScript, which is present in the top-level "js" folder.
 */
public class FileSender {
	
	/**
     *  Opens a FileInputStream to the file and sends it to the client.
     *  In the case a JavaScript file is requested, it is dynamically assembled
     *  from the corresponding raw JavaScript files and enriched with customized 
     *  parameters. Otherwise, the image or the css-file is directly delivered.
     *  
     *  @param out is the client's <code>OutputStream</code>.
     *  @param filename is the name of the file to be send.
     *  @param sessionID is the clients current/new session ID.
     *  @param status is the client's status (offline/online)
     *  @param lastLogEntry is the current last index of the events <code>Hashtable</code>
     *  @param isRM is true if UsaProxy is launched in remote monitoring mode
     *  @param remoteMonitorer is true if the client is the monitoring partner
     *  @param isSB is true if UsaProxy is launched in shared browsing mode
     *  @param logMode holds the logging mode e.g. "pagereq", "all", or "" in the case that logging is disabled
     *  @param isAdmin is true if user is registered as remote monitoring assistant/ remote monitorer
     *  @param isWindowNameSet is true if the user's shared session browser window was defined by the JavaScript
     */
	public void send (DataOutputStream out,
			String filename, 
			String sessionID,
			String status,
			String partnerSID,
			int lastLogEntry,
			boolean isRM,
			String remoteMonitorer,
			boolean isSB,
			String logMode,
			boolean isAdmin,
			boolean isWindowNameSet) throws IOException {
		
		try {
			
			File file;
			String filepath = "";
			
			/** get file path according to the requested file */
			/** if JavaScript, specify the respective raw JavaScript file path */
			if (HTTPData.guessType(filename).equals("text/javascript")) {
				
				if (filename.equals("sharedbrowsing.js"))
					filepath = "js/sb/";
				else if (filename.equals("remotemonitoring.js"))
					filepath = "js/rm/";
				/** proxyscript.js */
				else { 
					/** if pure logging mode */
					if(!isRM && !isSB && logMode.equals("all"))
						filepath = "js/log/";
					else /** if any collaboration mode */
						filepath = "js/";
				}
			}
			/** css file */
			else if (HTTPData.guessType(filename).equals("text/css")) {
				filepath = "css/";
			}
			/* not neccessary since html files are requested via getHTMLStream()
			 * else if (HTTPData.guessType(filename).equals("text/html")) {
				filepath = "html/";
			}*/
			/** image file */
			else if (HTTPData.guessType(filename).equals("image/jpeg")
					|| HTTPData.guessType(filename).equals("image/gif")) {
				filepath = "img/";
			}
				
			/** create File object */
			file = new File(filepath + filename);
			/** Open a stream to the file */
			BufferedInputStream in = new BufferedInputStream (new FileInputStream(file));
			
			/** new headers StringBuffer */
			StringBuffer headers = new StringBuffer();
			
			/** enrich final proxyscript.js with
			 *  additonal code and parameters */
			if(filename.equals("proxyscript.js")) {
				
				/** session ID cookie */
				String cookieText = "";
				if(sessionID!=null && !(sessionID.equals(""))) cookieText = sessionID;
				else cookieText = "hallowelthal";
				String sessionSetter = "var sessionID_UsaProxy='" + cookieText + "';" + HTTPData.CRLF;
				cookieText = "userUsaProxy=" + cookieText;
				
				/** define additional fields which are pasted
				 *  into proxyscript.js according to the launched mode */
				String statusSetter 			= "";
				String partnerSIDSetter 		= "";
				String lastLogEntrySetter 		= "";
				String isRemoteMonitoringSetter = "";
				String remoteMonitorerSetter 	= "";
				String isAdminSetter 			= "";
				String isWindowNameSetSetter 	= "";
				int contentLength 				= 0;
				BufferedInputStream proposalJSIn = null;
				BufferedInputStream proposeJSIn = null;
				
				/** if no sharing mode defined but full logging, 
				 *  leave out any shared session JavaScript variables and code */
				if (!isRM && !isSB && logMode.equals("all")) {
					
					contentLength = sessionSetter.length() + (int) file.length();
					
				} 
				/** if any sharing mode enabled paste the appropriate
				 *  JavaScript variables and code */
				else {
					/** String: user status (online or offline) */
					statusSetter = "var onlineUser_UsaProxy='" + status + "';" + HTTPData.CRLF;
					
					/** String: the collaborator's session ID */
					partnerSIDSetter = "var partnerSID_UsaProxy='" + partnerSID + "';" + HTTPData.CRLF;
					
					/** Integer: current log entry ID */
					lastLogEntrySetter = "var lastLogEntry_UsaProxy=" + lastLogEntry + ";" + HTTPData.CRLF;
					
					/** Boolean: true if remote monitoring enabled */
					isRemoteMonitoringSetter = "var FLG_RemoteMonitoring=" + isRM + ";" + HTTPData.CRLF;
					
					/** String: "true" if user is the monitoring part, "false" if not
					 *  "undefined" if shared browsing mode */
					remoteMonitorerSetter = "var remoteMonitorer='" + remoteMonitorer + "';" + HTTPData.CRLF;
					
					/** Boolean: true if user remote support assistant admin */
					isAdminSetter = "var FLG_isAdmin_UsaProxy=" + isAdmin + ";" + HTTPData.CRLF;
					
					/** Boolean: true if shared window was already defined by user */
					if(isWindowNameSet)
						isWindowNameSetSetter = "var FLG_WindowNameSet_UsaProxy=true;" + HTTPData.CRLF;
					
					/** retrieve FileInputStream for propose.js depending on collaboration mode */
					int proposeJSLength = 0;
					File proposeJS;
					if (isRM) proposeJS = new File("js/rm/propose.js");
					else proposeJS = new File("js/sb/propose.js");
					proposeJSIn = new BufferedInputStream (new FileInputStream(proposeJS));
					proposeJSLength = (int) proposeJS.length();
					
					/** retrieve FileInputStream for proposal.js depending on collaboration mode */
					int proposalJSLength = 0;
					File proposalJS;
					if (isRM) proposalJS = new File("js/rm/proposal.js");
					else proposalJS = new File("js/sb/proposal.js");
					proposalJSIn = new BufferedInputStream (new FileInputStream(proposalJS));
					proposalJSLength = (int) proposalJS.length();
					
					/** adapt content length according to the appended code and parameters */
					contentLength = sessionSetter.length() + statusSetter.length()
							+ partnerSIDSetter.length()
							+ lastLogEntrySetter.length() + isRemoteMonitoringSetter.length()
							+ remoteMonitorerSetter.length() + isAdminSetter.length()
							+ (int) file.length()
							+ proposeJSLength
							+ proposalJSLength
							+ (isWindowNameSet ? isWindowNameSetSetter.length() : 0);
				}
				
				/** generate response headers,
				 *  add Cache-Control header so that the response won't be cached by the client,
				 *  assign a application/x-javascript type since advanced JavaScript is delivered,
				 *  append "Set-Cookie" header */
				
				headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
				headers.append("Content-Type: application/x-javascript").append(HTTPData.CRLF);
				headers.append("Content-Length: " + contentLength).append(HTTPData.CRLF);
				/** browser requires loading proxyscript.js each time */
				headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
				headers.append("Set-Cookie: " + cookieText).append(HTTPData.CRLF);
				headers.append(HTTPData.CRLF);
				
				/** send headers */
				out.writeBytes(headers.toString());
				
				/** append additional code and parameters to proxyscript.js */
				
				/** paste sessionID variable into proxyscript.js */
				out.writeBytes(sessionSetter);
				
				/** in either of the collaboration modes
				 *  paste the additional code and variables into proxyscript.js */
				if (isRM || isSB) {
					
					/** send propose.js file */
					byte[] buf = new byte[1024];
					int len;
					while ((len = proposeJSIn.read(buf, 0, 1024)) != -1) {
						out.write(buf, 0, len);
					}
					proposeJSIn.close();
					
					/** send proposal.js file */
					buf = new byte[1024];
					while ((len = proposalJSIn.read(buf, 0, 1024)) != -1) {
						out.write(buf, 0, len);
					}
					proposalJSIn.close();
				
				
					/** paste user status variable into proxyscript.js */
					out.writeBytes(statusSetter);
					/** paste partnerSID variable into proxyscript.js */
					out.writeBytes(partnerSIDSetter);
					/** paste lastLogEntry variable into proxyscript.js */
					out.writeBytes(lastLogEntrySetter);
					/** paste isRemoteMonitoring variable into proxyscript.js */
					out.writeBytes(isRemoteMonitoringSetter);
					/** paste remoteMonitorer variable into proxyscript.js */
					out.writeBytes(remoteMonitorerSetter);
					/** paste isAdmin variable into proxyscript.js */
					out.writeBytes(isAdminSetter);
					if(isWindowNameSet) {
						/** paste isWindowNameSet variable into proxyscript.js */
						out.writeBytes(isWindowNameSetSetter);
					}
				}

			}
			/** images, css */
			else {
		
				headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
				headers.append("Content-Type: " + HTTPData.guessType(file.getPath())).append(HTTPData.CRLF);
				headers.append("Content-Length: " + (new Long(file.length())).toString()).append(HTTPData.CRLF);
				headers.append(HTTPData.CRLF);
				
				out.writeBytes(headers.toString());
			}
			
			/** send the file resp. the raw proxyscript.js */
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf, 0, 1024)) != -1) {
				out.write(buf, 0, len);
			}
			in.close();
			
			out.flush();
		}
		catch ( FileNotFoundException e ) {  
			/** If no such file, then display the famous 404 message. */
        	/** If log file doesn't exist, display the famous 404 message. */
        	System.err.println("\nAn ERROR occured: script file not found:\n"
									+ e );
        	
        	SocketData.send404 (out);
		}
    }
	
	/** Returns a <code>FileInputStream</code> to the specified HTML file. This method is used for
	 *  the delivery of special HTML pages such as "remotemonitoring.htm",
	 *  or "sharedbrowsing.htm".
	 * 
	 * @param filename is the file to be processed
	 * @return the <code>FileInputStream</code> of the file to be processed
	 */
	public InputStream getHTMLData(String filename) {
		try {
			
			File file = new File("html/" + filename);
			
			/** Open a stream to the file with the specified index */
			FileInputStream fis = new FileInputStream(file);
			
			StringBuffer headers = new StringBuffer();
			
			/** create HTTP response headers, 
			 *  add Cache-Control header so that the response won't be cached by the client */
			headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
			headers.append("Content-Type: text/html").append(HTTPData.CRLF);
			headers.append("Content-Length: " + (new Long(file.length())).toString()).append(HTTPData.CRLF);
			headers.append("Cache-Control: no-cache, must-revalidate").append(HTTPData.CRLF);
			headers.append(HTTPData.CRLF);
			
			/** headers stream */
			ByteArrayInputStream bais = new ByteArrayInputStream(headers.toString().getBytes());
			
			/** combine headers stream with file stream */
			SequenceInputStream sis = new SequenceInputStream(bais, fis);
			
			return sis;
			
		} catch ( FileNotFoundException e ) {  
			/** If no such file, then display the famous 404 message. */
        	/** If log file doesn't exist, display the famous 404 message. */
        	System.err.println("\nAn ERROR occured: file " + filename + " not found:\n"
									+ e );
        	return null;
		}
	}

}
