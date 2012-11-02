import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;

/** Class <code>ServerMode</code> provides methods which are specifically defined for
 *  the case that UsaProxy is set up in directly in front of a web server.
 */
public class ServerMode implements Mode {
	
	/** Server IP address. */
    private InetAddress 	hostAddress;
    /** Server port. */
	private int 			serverPort;	
	/** The customized request URL. */
	public URL 				requestURL;						  
	
	/** Constructor: deploys UsaProxy in the server-side mode
	 *  with the specified web server information.
	 * 
	 * @param hostAddress is the HTTP server address
	 * @param serverPort is the port the web server application is running on
     */
	public ServerMode(InetAddress hostAddress, int serverPort) {
		super();
		this.serverPort 	= serverPort;
		this.hostAddress	= hostAddress;
	}
	
	/**
     *  Returns a <code>Socket</code> of the web server.
     *  
     *  @return the <code>Socket</code>
     */
	public Socket getServerConnect() throws Exception {
		return new Socket(hostAddress.getHostName(),serverPort);
	}
	
	/**
     *  Returns the customized request line.
     *  The URL is reduced to a relative file path since the web server is directly contacted.
     *  HTTP version 1.0 is added.
     *  
     *  @param method is the request method
     *  @param url is the request URL
     *  @return the request string
     */
	public String getRequestLine(String method, URL url) {
		return method + " " + url.getFile() + " HTTP/1.0";
	}
	
	/**
     *  Returns the customized JavaScript reference string in the form of a 
     *  HTML script element referring to the specified JavaScript file.
     *  The HTTP server address is used as host.
     *  
     *  @param usaProxyIP is the UsaProxy IP address - not used in server mode
     *  @param usaProxyPort is the UsaProxy port - not used in server mode
     *  @return the script string
     */
	public String getScriptString(InetAddress usaProxyIP, int usaProxyPort, String filename) {
		return "<script src='http://" + hostAddress.getHostName() 
				+ "/usaproxylolo/file/" +  filename + "' type='text/javascript'></script>";
	}

	/**
	 * Sets the request URL. Since the URL starts with "/", "http://" and the web server's 
	 * IP address is put in front.
	 * 
	 * @param url is the requestURL to be assigned.
	 * @param host is the specified host - not used in server mode
	 */
	public void setRequestURL(String url, String host) {
		try {
			this.requestURL = new URL("http://" + hostAddress.getHostName() + url);
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
     *  Returns the request URL.
     *  
     *  @return the request URL
     */
	public URL getRequestURL() {
		return requestURL;
	}
	
	/**
	 * Returns the web server name
	 * 
	 * @return the host name string
	 */
	public String getHostName() { return this.hostAddress.getHostName(); }

}
