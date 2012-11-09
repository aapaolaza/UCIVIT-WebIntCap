package usaproxy;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.Socket;
import java.net.URL;

/**
 * Class <code>ProxyMode</code> provides methods customized for regular proxy and 
 * transparent proxy mode.
 */
public class ProxyMode implements Mode {
	
	/** The customized request URL. */
	public URL requestURL;		

	/**
     *  Returns a <code>Socket</code> according to the specifed host (and port) within the request URL.
     *  
     *  @return the <code>Socket</code>
     */
	public Socket getServerConnect() throws Exception {
		
		int port 	= 80;
		/** Could port be detected ? */
		if (requestURL.getPort() > 0) {
		    port = requestURL.getPort();
		}
		return new Socket(requestURL.getHost(), port);
	}

	/**
     *  Returns the customized request line.
     *  Since regular and transparent proxies mostly directly access a remote web server,
     *  the URL is reduced to a relative file path. HTTP version 1.0 is added.
     *  
     *  @param method is the request method
     *  @param url is the request URL
     *  @return the request string
     */
	public String getRequestLine(String method, URL url) {
		return method + " " + url.getFile() + " HTTP/1.0";
	}
	
	/**
     *  Returns the JavaScript reference string in the form of a HTML script element 
     *  referring to the specified JavaScript file. The UsaProxy IP is used as
     *  host. If not available, the virtual name lo.lo is used.
     *  
     *  @param usaProxyIP is the UsaProxy IP address
     *  @param usaProxyPort is the UsaProxy port
     *  @return the script string
     */
	public String getScriptString(InetAddress usaProxyIP, int usaProxyPort, String filename) {
		String usaProxyHost;
		if (usaProxyIP != null)
			usaProxyHost = usaProxyIP.getHostAddress();
        else
            usaProxyHost = "lo.lo";
		return "<script src='http://" + usaProxyHost
            + "/usaproxylolo/file/" + filename + "' type='text/javascript'></script>";
	}

	/**
	 * Sets the requested URL
	 * if URL starts with "/", "http://" and the host are put in front.
	 * 
	 * @param url is the requestURL to be assigned.
	 * @param host is the host specified
	 */
	public void setRequestURL(String url, String host) {
		try {
			/** if transparent mode or proxy request url starts with "/" */
			if (url.startsWith("/")) {
				this.requestURL = new URL("http://" + host + url);
			/** if full url in the form "http://..." */
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
	
	/** not implemented in <code>ProxyMode</code> */
	public String getHostName() { return ""; }

}
