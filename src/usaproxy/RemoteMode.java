package usaproxy;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;

/** 
 *  Class <code>RemoteMode</code> provides methods which are specifically defined for
 *  the request forwarding to another proxy (if UsaProxy is for instance deployed 
 *  within a network which connects to the Internet through a gateway proxy)
 */

public class RemoteMode implements Mode {
	
	/** Remote proxy IP address. */
	private InetAddress 			remoteProxy;	
	
	/** Remote proxy port. */
    private int 					remotePort;	
    
    /** The customized request URL. */
    public URL 						requestURL;						  
	
	/** Constructor: sets up UsaProxy to forward requests to another proxy
	 *  with the specified remote proxy information.
	 * 
	 * @param remoteProxy is the remote gateway
	 * @param remotePort is the remote gateway port
     */
	public RemoteMode(InetAddress remoteProxy, int remotePort) {
		super();
		this.remoteProxy 		= remoteProxy;
		this.remotePort 		= remotePort;
	}

	/**
     *  Returns a <code>Socket</code> of the second proxy.
     *  
     *  @return the <code>Socket</code>
     */
	public Socket getServerConnect() throws Exception {
		return new Socket(remoteProxy.getHostName(),remotePort);
	}
	
	/**
     *  Returns the customized request line.
     *  The URL is left unaltered since it is sent in its complete form.
     *  HTTP version 1.0 is added.
     *  
     *  @param method is the request method
     *  @param url is the request URL
     *  @return the request string
     */
	public String getRequestLine(String method, URL url) {
		return method + " " + url.toString() + " HTTP/1.0";
	}
	
	/**
     *  Returns the customized JavaScript reference string in the form of a 
     *  HTML script element referring to the specified JavaScript file.
     *  The UsaProxy IP and port are used as host. If not available
     *  the virtual name lo.lo is used.
     *  
     *  @param usaProxyIP is the UsaProxy IP address
     *  @param usaProxyPort is the UsaProxy port
     *  @return the reference string
     */
	public String getScriptString(InetAddress usaProxyIP, int usaProxyPort, String filename) {
		String usaProxyHost = "";
		if(usaProxyIP!=null) {
			usaProxyHost = usaProxyIP.getHostAddress();
		} else usaProxyHost = "lo.lo";
		return "<script src='http://" + usaProxyHost + "/usaproxylolo/file/" 
				+  filename + "' type='text/javascript'></script>";
	}
	
	/**
	 * Sets the request URL.
	 * If URL starts with "/", "http://" and the host are put in front.
	 * 
	 * @param url is the requestURL to set.
	 * @param host is the host specified
	 */
	public void setRequestURL(String url, String host) {
		try {
			/** if url starts with "/" */
			if (url.startsWith("/")) {
				this.requestURL = new URL("http://" + host + url);
			/** if complete url in the form "http://..." */
			} else this.requestURL = new URL(url);
		} catch (MalformedURLException e) {
			System.err.println("\nAn ERROR occured while setting requestURL: "
					+ "url invalid: " + url + "\n");
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
	
	/** Not implemented in RemoteMode */
	public String getHostName() { return ""; }

}
