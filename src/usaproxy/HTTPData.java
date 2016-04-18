package usaproxy;
/** 
 *  Class <code>HTTPData</code> contains HTTP protocol and message context constants. 
 *  Furthermore, it provides methods for the retrieval of specific header and 
 *  request URL attribute values which are globally accessible.
 */

public class HTTPData {
	
    public static final String HEADER_PROTOCOL_10 				= "HTTP/1.0";
    public static final String HEADER_PROTOCOL_11 				= "HTTP/1.1";
    public static final String HEADER_POST 						= "POST";
    public static final String HEADER_HOST 						= "Host";
    public static final String HEADER_CONTENT_DESCRIPTION 		= "Content-Description";
    public static final String HEADER_CONTENT_TYPE 				= "Content-Type";
    public static final String HEADER_CONTENT_TRANSFER_ENCODING = "Content-Transfer-Encoding";
    public static final String HEADER_CONTENT_LENGTH 			= "Content-Length";
    public static final String HEADER_RANGE 					= "Range";
    public static final String HEADER_IF_RANGE 					= "If-Range";
    public static final String HEADER_EXPIRES 					= "Expires";
    public static final String HEADER_CACHE_CONTROL 			= "Cache-Control";
    public static final String HEADER_PRAGMA 					= "Pragma";
    public static final String HEADER_VIA 						= "Via";
    public static final String HEADER_X_USAPROXY 				= "X-UsaProxy";
    public static final String HEADER_X_FORWARDED_FOR 			= "X-Forwarded-For";

    public static final String HEADER_CONNECTION 				= "Connection";
    public static final String HEADER_PROXY_CONNECTION 			= "Proxy-Connection";
    public static final String HEADER_CONNECTION_CLOSE 			= "close".intern();
    public static final String HEADER_CONNECTION_KEEPALIVE 		= "Keep-Alive".intern(); //The default don't send.

    public static final String HEADER_ACCEPT 					= "Accept";
    public static final String HEADER_ACCEPT_TEXT_ALL 			= "text/*";
    public static final String HEADER_ACCEPT_APPL_SOAP 			= "application/soap+xml";
    public static final String HEADER_ACCEPT_MULTIPART_RELATED 	= "multipart/related";
    public static final String HEADER_ACCEPT_APPLICATION_DIME 	= "application/dime";
    public static final String HEADER_ACCEPT_ENCODING 			= "Accept-Encoding";
    public static final String HEADER_CONTENT_ENCODING 			= "Content-Encoding";
    public static final String COMPRESSION_GZIP 				= "gzip";
  
    public static final String HEADER_COOKIE 					= "Cookie";
    public static final String HEADER_SET_COOKIE 				= "Set-Cookie";
    
    public final static String CRLF 							= "\r\n";

    public static final String HEADER_DEFAULT_CHAR_ENCODING 	= "utf-8";
    
    public static final String COOKIE_EXPIRES_DATE 				= "Sun, 23 August 2020 20:05:17 GMT";
    public static final String EXPIRES_DATE 					= "Sun, 23 August 2005 20:05:17 GMT";
    public static final String SESSION_ID_NAME 					= "userUsaProxy";
    
    
    /** Returns true if examined string line starts with a request method such as "GET". 
     *  Otherwise the specified string is determined as not being the first request line.
     *  
     *  @param line is the request header line to be examined
     *  @return true if line is request line
     */
    public static boolean isRequestLine(String line) {        
    	if (line.startsWith("GET ")
            || line.startsWith("HEAD ")
            || line.startsWith("POST ")
            || line.startsWith("PUT ")
            || line.startsWith("DELETE ")
            || line.startsWith("TRACE ")
            || line.startsWith("OPTIONS ")
            || line.startsWith("CONNECT "))
            return true;
    	else
            return false;
    }
    
    /** Returns true if examined string line starts with "HTTP". 
     *  Otherwise the specified string is determined as not being a response status line. 
     *  
     *  @param line is the response header line to be examined
     *  @return true if line is the status line
     */
    public static boolean isStatusLine(String line) {          
        
    	if (line.toUpperCase().startsWith("HTTP")) return true;
    	else return false;
    }
    
    /** Examines if the string "contentType" contains any HTML mimetypes
     * 
     *  @param contentType is the response header to be examined
     *  @return true if contentType contains HTML type mimetypes
     */
    public static boolean isHTMLType(String contentType) {          
        
    	if (contentType.toLowerCase().indexOf("html")!=-1
    	 || contentType.toLowerCase().indexOf("xhtml")!=-1)  return true;
    	else return false;
    }
    
    /**
	* Retrieves the mimetype of the specified file based on the file ending.
	*
	* For this purpose, the file name extension is compared to some well-known
	* extensions.
	* 
	* @param filename is the name of the file to be examined
	* @return the mimetype if match succeeded and "unknown/unknown" otherwise
	*/
	public static String guessType(String filename) {
		String type = null;
		int i = filename.lastIndexOf(".");
		String extension = filename.substring(i);
		if (extension.equals(".jpg")) 			type = "image/jpeg";
		else if (extension.equals(".gif")) 		type = "image/gif";
		else if (extension.equals(".js")) 		type = "text/javascript";
		else if (extension.equals(".css")) 		type = "text/css";
		else if (extension.equals(".htm")
				|| extension.equals(".html")) 	type = "text/html";
		else									type = "unknown/unknown";

		return type;
	}
	
	/** Retrieves the attribute value (if available) from the 
	 *  query part of an URL String. Returns null in case none is detected.
	 * 
	 * @param attribute is the attribute name to be evaluated
	 * @return the value if available, otherwise null
	 */
	public static String getValue(String queryString, String attribute) {
		int start; // the start index
		if (queryString==null) return null;
		/** if start of queryString */
		if(queryString.indexOf(attribute + "=")==0)
			start		= queryString.indexOf(attribute + "=")+ 1 + attribute.length();
		/** if attribute exists in queryString but after "&" */
		else if(queryString.indexOf("&" + attribute + "=")>0)
			start		= queryString.indexOf("&" + attribute + "=")+ 2 + attribute.length();
		else start = -1;
		
		/** if attribute exists */
		if (start!=-1) {
			int end			= queryString.indexOf("&", start);
			if (end==-1) end = queryString.length();
			/** retrieve value Substring */
			String attValue 	= queryString.substring(start,end);
			return attValue;
		}
		else {
			return null;
		}
	}
}
