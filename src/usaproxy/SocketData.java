package usaproxy;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/** 
 *  Class <code>SocketData</code> provides methods for client or server <code>Socket</code>
 *  connections such as the management of input and output streams.
 *  It also manages the corresponding <code>Headers</code> object which reads in the
 *  HTTP request resp. response headers.
 */

public class SocketData {
	
	/** The client resp. server <code>Socket</code>. */
	private Socket 				socket;
	/** The <code>Headers</code> structure managing HTTP request resp. response headers. */
	private Headers	 			headers;
	/** The <code>Socket</code> object's <code>InputStream</code>. */
    private InputStream 		in; 
    /** the <code>Socket</code> object's <code>OutputStream</code>. */
    private OutputStream 		out;
	
    /** Constructor, creates a <code>SocketData</code> instance for the specified <code>Socket</code> and
     *  instantiates a new <code>Headers</code> instance.
     * 
     * @param socket is the <code>Socket</code> to be assigned
     */
	public SocketData(Socket socket) {
		this.socket 	= socket;
		this.headers	= new Headers();
	}
	
	/**
     *  Retrieves the <code>InputStream</code> of the respective <code>Socket</code>.
     */
	public void bindInputStream() throws IOException {
		this.in = socket.getInputStream();
	}
	
	/**
     *  Retrieves the <code>OutputStream</code> of the respective <code>Socket</code>.
     */
	public void bindOutputStream() throws IOException {
		this.out = socket.getOutputStream();
	}
	
	/**
     *  Closes the <code>InputStream</code> of the respective <code>Socket</code>.
     */
	public void closeInputStream() throws IOException {
		if (this.in != null) this.in.close();
	}
	
	/**
     *  Closes the <code>OutputStream</code> of the respective <code>Socket</code>.
     */
	public void closeOutputStream() throws IOException {
		if (this.out != null) this.out.close();
	}
	
	/**
     *  Closes the <code>Socket</code>.
     */
	public void closeSocket() throws IOException {
		if (this.socket != null) this.socket.close();
	}
    
    /**
     * Returns the <code>Socket</code>.
     * 
	 * @return the <code>Socket</code>
	 */
    public Socket getSocket() {
		return socket;
	}
    
	/**
	 * Sets the <code>Socket</code>.
	 * 
	 * @param socket is the <code>Socket</code> to be assigned
	 */
	public void setSocket(Socket socket) {
		this.socket = socket;
	}

	/**
     *  Sets the <code>InputStream</code> of the respective <code>Socket</code>.
     *  
     *  @param in is the <code>InputStream</code> to be assigned
     */
	public void setIn(InputStream in) {
		this.in = in;
	}

	/**
     *  Sets the <code>OutputStream</code> of the respective <code>Socket</code>.
     *  
     *  @param out is the <code>OutputStream</code> to be assigned
     */
	public void setOut(OutputStream out) {
		this.out = out;
	}
	
	/**
	 * Returns the <code>InputStream</code> of the respective <code>Socket</code>.
	 * 
	 * @return the <code>InputStream</code>
	 */
	public InputStream getIn() {
		return in;
	}
	
	/**
	 * Returns the <code>OutputStream</code> of the respective <code>Socket</code>.
	 * 
	 * @return the <code>OutputStream</code>
	 */
	public OutputStream getOut() {
		return out;
	}

	/**
	 * Returns the <code>Headers</code> object.
	 * 
	 * @return the <code>Headers</code> structure
	 */
	public Headers getHeaders() {
		return headers;
	}

	/**
	 * Sets the <code>Headers</code> structure of the respective <code>Socket</code>.
	 * 
	 * @param headers is the <code>Headers</code> structure to be assigned
	 */
	public void setHeaders(Headers headers) {
		this.headers = headers;
	}
	
	/**
     *  Sends a HTTP 403 "Forbidden" status message to the client.
     *  
     *  @param out is the client's <code>OutputStream</code>
     *  @param message is the message to be sent
     */
	public static void send403 (OutputStream out, String message) throws IOException {
			
		System.out.println("SocketData:send403");
			DataOutputStream dout = new DataOutputStream(out);
			
			/** new headers StringBuffer */
			StringBuffer headers = new StringBuffer();
				
			headers.append("HTTP/1.1 403 Forbidden").append(HTTPData.CRLF);
			headers.append("Content-Type: text/html").append(HTTPData.CRLF);
			headers.append(HTTPData.CRLF);
			headers.append("<H1 style=\"font-family:Arial;font-size:20px\">This request is forbidden !</H1>");
			if(message!=null) {
				headers.append("<p style=\"font-family:Arial;font-size:12px;color:red\">" + message + "</p>");
				headers.append(HTTPData.CRLF+HTTPData.CRLF);
			}
			
			/** send headers */
			dout.writeBytes(headers.toString());
			dout.flush();
    }
	
	/**
     *  Sends a HTTP 404 "Not Found" status to the client.
     *  
     *  @param out is the client's <code>OutputStream</code>
     */
	public static void send404 (OutputStream out) throws IOException {
		
			DataOutputStream dout = new DataOutputStream(out);
			
			/** new headers StringBuffer */
			StringBuffer headers = new StringBuffer();
				
			headers.append("HTTP/1.1 404 Not Found").append(HTTPData.CRLF);
			headers.append(HTTPData.CRLF);
			
			/** send headers */
			dout.writeBytes(headers.toString());
			dout.flush();
    }
	
	
	/**
     *  Sends a HTTP 200 "OK" status to the client.
     *  
     *  @param out is the client's <code>OutputStream</code>
     */
	public static void send200 (OutputStream out) throws IOException {
		
			DataOutputStream dout = new DataOutputStream(out);
			
			/** new headers StringBuffer */
			StringBuffer headers = new StringBuffer();
				
			headers.append("HTTP/1.1 200 OK").append(HTTPData.CRLF);
			
			// Function to support crossdomain access
			headers.append("Access-Control-Allow-Origin: *").append(HTTPData.CRLF);

			headers.append(HTTPData.CRLF);

			/** send headers */
			dout.writeBytes(headers.toString());
			dout.flush();
    }
	

}
