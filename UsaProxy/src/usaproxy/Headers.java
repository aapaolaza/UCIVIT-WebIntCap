package usaproxy;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.Map.Entry;

/** Class Headers stores either HTTP request or response headers. 
 *  In each case headers are first read in from the corresponding client/server.
 *  */
public class Headers extends OrderedHashtable {
	
	/**
     *  Reads in the HTTP request/response headers and stores them
     *  in this <code>OrderedHashtable</code>.
     *  Returns the remaining input stream for further processing.
     *  
     *  @param in is the <code>InputStream</code> the headers are retrieved from.
     *  @return the remaining <code>InputStream</code>
     */
	public InputStream readHeaders(InputStream in) throws IOException {
		
		byte b 			= 0;		/** stores the currently read byte */
        int len 		= 0;		/** stores length of a single header */
        int colonIndex	= -1;		/** stores index of ":" within a single header */
        String name, value, tmpString;
        
        if (in == null)
			in = new BufferedInputStream(in);
        
        /** Logic to read HTTP request headers */
        boolean readTooMuch = false;	/** specifies the end of the headers part */
        
        /** read in max 4097 bytes */
        for (ByteArrayOutputStream buf = new ByteArrayOutputStream(4097); ;) {
        	
            if (!readTooMuch) {
                b = (byte) in.read();	/** read in new byte */
                //System.err.print((char) b);
            }
            if (b == -1) {		/** end procedure when end of data */
                break;
            }
            
            readTooMuch = false;
            
            /** if regular byte within a header */
            if ((b != '\r') && (b != '\n')) {
            	
            	/** if separator found retrieve separator 
            	 *  index within the currently parsed header */
                if ((b == ':') && (colonIndex == -1)) {
                    colonIndex = len;
                }
                len++;
                buf.write(b);	/** append byte to buf */
            
            /** if return byte continue loop */
            } else if (b == '\r') {
                continue;
                
            /** if newline (i.e. \n) detected, store header line */
            } else {    // b== '\n'
                if (len == 0) { /** end of headers */
                    break;
                }
                b = (byte) in.read(); /** read in next byte */
                //System.err.print((char) b);
                readTooMuch = true;

                /** A space or tab at the beginning of a line means the current header line continues */
                if ((b == ' ') || (b == '\t')) {
                    continue;
                }
                
                /** otherwise: header line completely read in */
                buf.close();
                byte[] hdata = buf.toByteArray();
                buf.reset();
                
                if (colonIndex != -1) {  /** if ":" exists in header */
                	
                	/** generate header line String */
                	tmpString = new String(hdata, 0, len, HTTPData.HEADER_DEFAULT_CHAR_ENCODING);
                	
                	/** generate a name/value pair; in the case of the request line
                	 *  value is left empty  */
                	if (HTTPData.isRequestLine(tmpString)) {
                		name = tmpString;
                		value = "";
                		
                	/** all other request or response headers will be referenced
                	 *  by the header field name and are assigned the right part next to
                	 *  ":" as value
                	 */
                	} else {
                		name 	= new String(hdata, 0, colonIndex, HTTPData.HEADER_DEFAULT_CHAR_ENCODING);
                		value 	= new String(hdata, colonIndex + 2, len - 2 - colonIndex,
                                    HTTPData.HEADER_DEFAULT_CHAR_ENCODING);
                	}
                    colonIndex = -1;
                    
                /** response status line */
                } else {
                    name = new String(hdata, 0, len,
                                    HTTPData.HEADER_DEFAULT_CHAR_ENCODING);
                    value = "";
                }
                
                /** put request line / response status line at 
                 *  the first position in this Headers Hashtable */
                if (value=="") this.add(0, name, value);
                else this.put(name, value);
                len = 0;
                
				//System.out.println("name:" + name + ",\n value:" + value);

            }
        }
        
        return in;
	}
	
	
	/**
     *  New version of readHeaders. In this version bufferedReader will be used
     *  Reads in the HTTP request/response headers and stores them in this <code>OrderedHashtable</code>.
     *  Returns the remaining input stream for further processing.
     *  
     *  @param in is the <code>InputStream</code> the headers are retrieved from.
     *  @return the remaining <code>InputStream</code>
     */
	public InputStream readHeadersBufferedReader(InputStream in) throws IOException {
		
        String name, value;
        
        if (in == null)
			in = new BufferedInputStream(in);
        
        BufferedReader buffReader =
                new BufferedReader(
                    new InputStreamReader(in));
        
        
        /*
         * The inputStream will have this appearance:
         * GET /usaproxylolo/log?datatolog
         * Host: 130.88.193.26:2727
         * Connection: keep-alive
         * User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36
         * Origin: http://www.cs.man.ac.uk
         * Accept: *|*
         * Referer: http://www.cs.man.ac.uk/~apaolaza/TESTindex.html
         * Accept-Encoding: gzip,deflate,sdch
         * Accept-Language: en-GB,es-ES;q=0.8,es;q=0.6
         * 
         * We will read it line by line, split it by the colon, and put it into the orderedHashTable.
         * 
         */
        String tmpReadLine;
        while ((tmpReadLine = buffReader.readLine()) != null) {
        	//For each line we read
        	//System.err.println(tmpReadLine);
        
			// To be executed at the end

			if (tmpReadLine.contains(":")) {
				/** if ":" exists in header */

				/**
				 * generate a name/value pair; in the case of the request line
				 * value is left empty
				 */
				if (HTTPData.isRequestLine(tmpReadLine)) {
					name = tmpReadLine;
					value = "";

					/**
					 * all other request or response headers will be referenced
					 * by the header field name and are assigned the right part
					 * next to ":" as value
					 */
				} else {
					
					name = tmpReadLine.substring(0, tmpReadLine.indexOf(":")).trim();
					value = tmpReadLine.substring(tmpReadLine.indexOf(":")+1, tmpReadLine.length()).trim();
				}

				/** response status line */
			} else {
				name = tmpReadLine;
				value = "";
			}

			/**
			 * put request line / response status line at the first position in
			 * this Headers Hashtable
			 */
			if (value == "")
				this.add(0, name, value);
			else
				this.put(name, value);

			//System.out.println("name:" + name + ",\n value:" + value);

		}

		return in;
	}

	/**
     *  Prints the entries of the <code>OrderedHashtable</code> headers.
     */
	public void printHeaders() {
		System.err.println(this.toStringBuffer());
    }
	
	/** 
	 * Returns a <code>StringBuffer</code> representation of the request/response headers.
	 * 
	 * @return the headers <code>StringBuffer</code>
	 */
	public StringBuffer toStringBuffer() {
		
		StringBuffer headers = new StringBuffer();
		
		for (Iterator e = this.entrySet().iterator(); e.hasNext();) {
	
	        Entry me 	= (Entry) e.next();
	        String key 	= (String) me.getKey();
	        
	        if (null == key) continue; /** if empty entry */
	        
	        /** put request line in front of the rest */
	        if (HTTPData.isRequestLine(key.trim()))
	        	headers.insert(0,key + HTTPData.CRLF);
	        /** put response status line in front of the rest */
	        else if (HTTPData.isStatusLine(key.trim()))
	        	headers.insert(0,key + HTTPData.CRLF);
	        /** all other headers: insert ":" beween name and value 
	         *  and append header to the StringBuffer */
			else {
	        	String value = (String)me.getValue();
	        	headers.append(key).append(": ").append(value).append(HTTPData.CRLF);
	        }
	    }
		/** append an additional newline */
		headers.append(HTTPData.CRLF);
		
		return headers;
	}
}
