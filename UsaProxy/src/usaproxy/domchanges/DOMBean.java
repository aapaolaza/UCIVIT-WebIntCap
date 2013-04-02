package usaproxy.domchanges;


import com.google.gson.Gson;
/**
 * This class will store the "milestone" DOMs. 
 * It will contain information about the timestamp, the web page it refers to (sd and url),
 * the user (sid) and the domContent
 */
public class DOMBean{

	/**
	 * Empty constructor
	 */
	public DOMBean(){
		super();
		this.timestamp = "";
		this.sd = "";
		this.sid = "";
		this.domContent = "";
		this.url = "";
	}

	public DOMBean(String timestamp, String sd, String sid,
			String domContent, String url) {
		super();
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
//		try {
//			ErrorLogging.logError("DOMBean.java:DOMBean", 
//					"The following DOM should not be encoded: \n"+domContent, null);
//			
//			this.domContent = URLEncoder.encode(domContent, "UTF-8");
//		} catch (UnsupportedEncodingException e) {
//			ErrorLogging.logError("DOMBean.java:DOMBean",
//					"There was an error trying to encode the DOM content", e);
//		}
		
		this.domContent = domContent;
		this.url = url;
	}

	/** Deserialise given JSON and creates a DOMBean element with the result
	 * @param serialised class in JSON
	 */

	public DOMBean(String json){
		Gson gson = new Gson();
		DOMBean tempClass = gson.fromJson(json, DOMBean.class);

		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.domContent = tempClass.domContent;
		this.url = tempClass.url;

	}

	/** Serialise the class into a JSON, and returns the String containing it 
	 * @return serialised class in JSON
	 */

	public String toGson(){
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}

	
	/**
	 * Timestamp of the DOM
	 */
	private String timestamp;

	/**
	 * Web page ID
	 */
	private String sd;
	/**
	 * User's ID
	 */
	private String sid;
	
	/**
	 * Client's IP
	 */
	public String clientIP; 

	/**
	 * Web page url
	 */
	private String url;
	
	/**
	 * Content of the DOM, it would be either 
	 */
	private String domContent;

	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public String getSd() {
		return sd;
	}

	public void setSd(String sd) {
		this.sd = sd;
	}

	public String getSid() {
		return sid;
	}

	public void setSid(String sid) {
		this.sid = sid;
	}

	public String getDomContent() {
//		String decodedDomContent = "";
//		try {
//			decodedDomContent = URLDecoder.decode(domContent, "UTF-8");
//		
//		} catch (UnsupportedEncodingException e) {
//			ErrorLogging.logError("DOMBean.java:getDomContent()", 
//					"There was an error trying to decode the DOM from the database. Content of the DOM to DECODE: " + domContent, e);
//		}
//		
//		return decodedDomContent;
		return domContent;
	}

	public void setDomContent(String domContent) {
//		try {
//			this.domContent = URLEncoder.encode(domContent, "UTF-8");
//		} catch (UnsupportedEncodingException e) {
//			ErrorLogging.logError("DOMBean.java:setDomContent()", 
//					"There was an error trying to encode the DOM from regular input. Content of the DOM to ENCODE: " + domContent, e);
//		}
		this.domContent = domContent;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
}
