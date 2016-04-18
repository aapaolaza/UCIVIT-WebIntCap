package usaproxy;
import java.net.*; 

/** Interface <code>Mode</code> provides deployment-independent methods 
 *  which are accordingly implemented by the assigned proxy mode instance 
 *  (e.g. regular proxy mode, server-side deployment).
 */
public interface Mode {
	
	/**
     *  Returns a <code>Socket</code> of the web server resp. next hop proxy.
     *  
     *  @return the corresponding <code>Socket</code>
     */
	public Socket getServerConnect() throws Exception;
	
	/**
     *  Returns the customized request line according 
     *  to the receiver of this request (e.g. web server, next hop proxy).
     *  
     *  @param method is the request method
     *  @param url is the request URL
     *  @return the customized request string
     */
	public String getRequestLine(String method, URL url);
	
	/**
     *  Returns the customized JavaScript reference string in the form of a 
     *  HTML script element referring to the specified JavaScript file.
     *  
     *  @param usaProxyIP is the UsaProxy IP address
     *  @param usaProxyPort is the UsaProxy port
     *  @param filename is the name of the JavaScript file to be referred to
     *  @return the customized reference string
     */
	public String getScriptString(InetAddress usaProxyIP, int usaProxyPort, String filename);
	
	/**
	 * Sets the customized request URL according to the deployed proxy mode.
	 * 
	 * @param url is the requestURL to be assigned
	 * @param host is the host which contains the requested resource
	 */
	public void setRequestURL(String url, String host);
	
	/**
	 * Returns the request URL.
	 * 
	 * @return the request URL
	 */
	public URL getRequestURL();
	
	/**
	 * Returns the host name of the machine which contains the requested resource.
	 * 
	 * @return a host name String
	 */
	public String getHostName();
}
