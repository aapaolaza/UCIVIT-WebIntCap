package usaproxy;
import java.io.*;

/** 
 *  Thread <code>ServerRequest</code> forwards a request to the web server and
 *  stores it to the corresponding httptraffic txt-file.
 */
public class ServerRequest extends Thread {

	/** manages the client <code>Socket</code>, streams, and the request headers. */
	private SocketData			client;
	/** manages the server <code>Socket</code>, streams, and the response headers. */
	private SocketData			server;
	/** The parent <code>ClientRequest</code> thread. */
    private ClientRequest	clientRequest;
    
    /**
     *  Constructor: creates a <code>ServerRequest</code> instance and starts the thread.
     *  
     *  @param client is the <code>SocketData</code> class which manages the client socket, streams, and request headers
     *  @param server is the <code>SocketData</code> class which represents the web server
     *  @param clientRequest is the thread which manages and processes the request and the corresponding response
     */
    public ServerRequest (SocketData client, SocketData server, ClientRequest clientRequest) throws Exception {

		this.client 			= client;
		this.server 			= server;
		this.clientRequest 		= clientRequest;
	
		/** start thread */
		start();
    } 
    
    /**
     *  Sets up a connection to the web server, sends the request, 
     *  and stores it to an individual httptraffic txt-file 
     *  (referenced by the current httptrafficindex postfix).
     */
    public void run () { 

		try { 
			
			/** open connection (retrieve OutputStream) */
			server.setOut(new DataOutputStream(new BufferedOutputStream(server.getOut())));
			
			/** get StringBuffer representation of the request headers */
			StringBuffer headers = this.client.getHeaders().toStringBuffer();
			
			if (UsaProxy.DEBUG) System.err.println(headers);
			
			/** send request to the web server */
			server.getOut().write(headers.toString().getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
			server.getOut().flush();	

			/** retrieve new httptraffic index for the request which will be
			 *  used for suffixing the txt-file the request and response data will be stored to.
			 *  Finally, store the request */
			if(clientRequest.getHttpTraffic().isCachingEnabled()) {
				clientRequest.getHttpTraffic().store(clientRequest.getHttpTrafficIndex(),"[request]\r\n"+headers.toString());
			}
			
			/** if any additional data was sent with the request headers (POST) */
			if(client.getIn()!=null) {	
				byte request[] = new byte[4096]; /** data buffer */  
	        	int requestLength;   /** length of request as number of bytes */
	        
	        	while ((requestLength = client.getIn().read(request)) != -1) {
					if (requestLength > 0) {
						/** store the request to txt-file */
			        	if(clientRequest.getHttpTraffic().isCachingEnabled()) 
							clientRequest.getHttpTraffic().store(clientRequest.getHttpTrafficIndex(), request, 0, requestLength);
			        	
			        	/** send it to server */
						server.getOut().write (request,0,requestLength);
						server.getOut().flush();
			        }
				}
			}
			
			server.getOut().flush();
		    
		} catch (IOException e) {
        	System.err.println("\nAn ERROR occured while sending request: "
							+ e );
		}
    }

}
