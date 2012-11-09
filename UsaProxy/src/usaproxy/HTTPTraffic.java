package usaproxy;
import java.io.*;

/**
 * Class <code>HTTPTraffic</code> is used for exclusively manage the current httptrafficindex which 
 * is used as identifier for the individual txt-files to which the requests and corresponding
 * server responses are stored.<br><br>
 * In addition it is used with the "sd" parameter in event log entries and other
 * request URLs in order to reference the web page the events occurred on.<br><br>
 * Httptrafficindex is increased each time it is assigned to a request/response pair.
 */
public class HTTPTraffic {
	
	/** Holds the current httptrafficindex. */
	private int 		index;			
	
	/** True if httptraffic logging is enabled.
  	 *  This information is retrieved from isCachingEnabled.txt. */
	private boolean 	isCachingEnabled;		
	
	/** Constructor: creates an <code>HTTPTraffic</code> instance. If caching is enabled
	 *  the current httptrafficindex is retrieved.
     */
	public HTTPTraffic() {
		/** retrieve from isCachingEnabled.txt whether 
		 *  caching of requests/responses shall be enabled */
		retrieveIsCachingEnabled();
		/** retrieve the current index from httpTraffic.txt (default=0) */
		if(isCachingEnabled) this.index = getHttpTrafficIndex(false);
	}
	
	/** Returns the current httptrafficindex which is retrieved from httpTraffic.txt.
	 * 
	 *  @param fromClient is false if this method is invoked the 
	 *  first time and true with each following attempt
	 *  @return the index
	 *  */
	public synchronized int getHttpTrafficIndex(boolean fromClient) {
		
		byte buffer[] = new byte[80];
		
		int clientIndex = 0;
    	
		/** retrieve current index */
    	try {
    		
    		/** Open a stream to the HTTP traffic file. */
			FileInputStream fis = new FileInputStream ( "httpTraffic/httpTraffic.txt");

       		int len = fis.read( buffer, 0, fis.available() );
       		String str = new String( buffer, 0, len );
       		
       		/** if no index available in file, create a default one (i.e. o) */
       		if (str.equals("")) str = "0";
       		clientIndex = Integer.parseInt(str);
       		
			fis.close();

    	}
    	catch ( FileNotFoundException e ) { 
        	/** If httpTraffic file doesn't exist, display error message. */
        	System.err.println("\nAn ERROR occured: httpTraffic file not found:\n");
									e.printStackTrace() ;
									
			try{
				/** Create new httpTraffic file. */
				FileOutputStream fos = new FileOutputStream ( "httpTraffic/httpTraffic.txt" , false);
				
				fos.write(("0").getBytes());
				clientIndex = 0;
				fos.flush();
				fos.close();
				System.err.println("httpTraffic file was created with index 0");
			}
			catch ( IOException ie ) { 	
        		System.err.println("\nAn ERROR occured while creating httpTraffic:\n"
							+ ie );
        	}	
			
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while getting HTTPTraffic index:\n"
							+ ie );
        }
        
        /** assign index */
        index = clientIndex;
        
        /** index is not increased when it is first accessed on launch;
         *  with each following attempt, it is increased to provide the next client a new index */
        if(fromClient) increaseHttpTrafficIndex();
        
        /** notify waiting clients that index file is accessible */
		notifyAll();
        return clientIndex;
    	
    }
    
    /** Retrieves a <code>Boolean</code> from the isCachingEnabled.txt file which 
     *  determines whether httptraffic caching shall be enabled or not. 
     */
	protected void retrieveIsCachingEnabled() {
		
		byte buffer[] = new byte[80];
		
		index = 0;
    	
    	try {
    		
    		/** Open a stream to the logHttpTraffic file. */
			FileInputStream fis = new FileInputStream ( "httpTraffic/isCachingEnabled.txt");

       		int len = fis.read( buffer, 0, fis.available() );
       		String str = new String( buffer, 0, len );
       		
       		Boolean doLog 		= new Boolean(str);
       		isCachingEnabled 	= doLog.booleanValue();
       		
			fis.close();

    	}
    	catch ( FileNotFoundException e ) { 
        	/** If httpTraffic file doesn't exist, display error message. */
        	System.err.println("\nAn ERROR occured: httpTraffic file not found:\n"
									+ e );
									
			try{
				/** Create new httpTraffic file. */
				FileOutputStream fos = new FileOutputStream ( "httpTraffic/isCachingEnabled.txt" , false);
				
				fos.write(("true").getBytes());
	       		this.isCachingEnabled = true;
				fos.flush();
				fos.close();
				System.err.println("logHttpTraffic file was created with value true");
			}
			catch ( IOException ie ) { 	
        		System.err.println("\nAn ERROR occured while creating httpTraffic:\n"
							+ ie );
        	}	
			
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while getting HTTPTraffic index:\n"
							+ ie );
        }
    	
    }
    
    /** Increases the httptrafficindex and stores it back to httpTraffic.txt  */
	protected void increaseHttpTrafficIndex() {
    	
    	try {
    		
    		/** Open a stream to the HTTP traffic file. */
			FileOutputStream fos = new FileOutputStream ( "httpTraffic/httpTraffic.txt" , false);

       		fos.write((""+(this.index + 1)).getBytes());
       		this.index += 1;
			fos.flush();
			fos.close();

    	}
    	catch ( FileNotFoundException e ) { 
        	/** If httpTraffic file doesn't exist, display error message. */
        	System.err.println("\nAn ERROR occured: httpTraffic file not found:\n"
									+ e );
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while increasing httpTraffic index:\n"
							+ ie );
        }
    	
    }
    
    /** Stores HTTP request and response headers and data, in string representation,
     *  to an individual txt-file suffixed by the specified httptrafficindex.
     * 
     *  @param index is the postfix of the txt-file the data is stored to 
     *  @param data is the data to be stored
     *  */
	public void store (int index, String data) {
    	
    	try {
    		
    		/** Open a stream to the individual file. */
			FileOutputStream fos = new FileOutputStream ( "httpTraffic/log/httpTraffic"+index+".txt" , true);
			
			/** store data */
			fos.write(data.getBytes(HTTPData.HEADER_DEFAULT_CHAR_ENCODING));
			fos.flush();
			fos.close();

    	}
    	catch ( FileNotFoundException e ) { 
        	System.err.println("\nAn ERROR occured: txt file with index " + index + " not found:\n"
									+ e );
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while storing data to file with index " + index + ":\n"
							+ ie );
        }
    	
    }
    
	/** Stores HTTP request and response headers and data in the form of a byte array
	 *  to an individual txt-file suffixed by the specified httptrafficindex.
     * 
     *  @param index is the postfix of the txt-file the data is stored to 
     *  @param data is the byte array of which a byte sequence is stored
     *  @param off is the start index of the relevant sequence in the byte array
     *  @param length is the number of bytes of the data to be stored.
     *  */
	public void store (int index, byte[] data, int off, int length) {
    	
    	try {
    		
    		/** Open a stream to the individual file. */
			FileOutputStream fos = new FileOutputStream ( "httpTraffic/log/httpTraffic"+index+".txt" , true);
			
			/** store bytes */
			fos.write(data, off, length);
			fos.flush();
			fos.close();

    	}
    	catch ( FileNotFoundException e ) { 
        	System.err.println("\nAn ERROR occured: txt file with index " + index + " not found:\n"
									+ e );
        }
        
        catch ( IOException ie ) { 	
        	System.err.println("\nAn ERROR occured while storing data to file with index " + index + ":\n"
							+ ie );
        }
    	
    }
	
	/** Returns the stored HTTP response headers and data. For this purpose, 
	 *  it parses the content of the specified txt-file (by index) until it detects
	 *  the response start.
	 * 
	 * @param index references the txt-file
	 * @return the response <code>FileInputStream</code>
	 * @throws <code>FileNotFoundException</code>
	 */
	public InputStream getResponseData(String index) throws FileNotFoundException {
		
		/** Open a stream to the file with the specified index */
		FileInputStream in = new FileInputStream("httpTraffic/log/httpTraffic"+index+".txt");
		
		String response			= "[response]\r\n";	/** holds the char sequence 
														which specifies the response start;
														bytes are subsequently compared with the single characters */
		int	responseIndex		= 0;		/** is increased with each match between the read-in byte
												and the currently examined character in response String */
		boolean responseStarted	= false;	/** true if response found */
		byte b 					= 0;
		
		try {
			while (!responseStarted) {
				
				b = (byte)in.read();	/** read in new byte */
				
				if (b == -1) {	/** end of document */
	                break;
	            }
				/** compare read-in byte with the current character in response String 
				 *  if they match, response index is increased to be used for the next
				 *  comparison */
				if (b == response.charAt(responseIndex)) {
					/** if the last byte of the response String was read-in 
					 *  response is detected */
					if(responseIndex==response.length()-1)
						responseStarted = true;
					/** otherwise response index is increased */
					else responseIndex++;
				/** no match between character and byte: reset response index */
				} else {
					/** if next byte matches the first response String character,
					 *  index is set to "1" */
					if (b == response.charAt(0))
						responseIndex = 1;
					else responseIndex = 0;
				}
			}
			
		} catch (IOException e) {
    		System.err.println("\nAn ERROR occured while retrieving HTTPTraffic response: "
					+ "\n"
					+ e );
		}
		
		if(responseStarted) {
            return in;
		} else {
			return null;
		}

	}
	
	/** Returns the isCachingEnabled flag which specifies if caching 
	 *  of HTTP requests and responses is enabled.
	 * 
	 *  @return true, if caching enabled, otherwise false.
	 */
	public boolean isCachingEnabled() {
		return isCachingEnabled;
	}

}
