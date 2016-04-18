package usaproxy.domchanges;


import usaproxy.events.EventConstants;
import usaproxy.events.EventDataHashMap;
import usaproxy.events.GenericEvent;

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
		this.timestampms = "";
		
		this.sessionstartms = "";
		
		this.sessionstartparsed = "";
		
		this.usertimezoneoffset = "";
		
		this.sd = "";
		this.sid = "";
		this.ip = "";
		this.url = "";
		this.browser = "";
		this.platform ="";
		this.domContent = "";
	}

//	public DOMBean(String timestamp, String timestampms, String sd, String sid, String clientIP, String url, String browser,
//			String platform, String domContent) {
//		super();
//		this.timestamp = timestamp;
//		this.timestampms = timestampms;
//		this.sd = sd;
//		this.sid = sid;
//		this.clientIP = clientIP;
//		this.url = url;
//		this.browser = browser;
//		this.platform = platform;
//		this.browser = browser;
//
////		try {
////			ErrorLogging.logError("DOMBean.java:DOMBean", 
////					"The following DOM should not be encoded: \n"+domContent, null);
////			
////			this.domContent = URLEncoder.encode(domContent, "UTF-8");
////		} catch (UnsupportedEncodingException e) {
////			ErrorLogging.logError("DOMBean.java:DOMBean",
////					"There was an error trying to encode the DOM content", e);
////		}
//		
//		this.domContent = domContent;
//
//	}
	
	
	public DOMBean(EventDataHashMap eventHashMap) {
		
		this.timestampms = eventHashMap.get(EventConstants.TIMESTAMP);
		
		this.timestamp = GenericEvent.formatDateFromMs(eventHashMap.get(EventConstants.TIMESTAMP));
		
		this.sessionstartms = eventHashMap.get(EventConstants.SESSIONSTARTMS);
		
		this.sessionstartparsed = GenericEvent.formatDateFromMs(eventHashMap.get(EventConstants.SESSIONSTARTMS));
		
		this.usertimezoneoffset = eventHashMap.get(EventConstants.USERTIMEZONEOFFSET);
		
		this.sd = eventHashMap.get(EventConstants.SD);
		
		this.sid = eventHashMap.get(EventConstants.SID);
		
		this.ip = eventHashMap.get(EventConstants.IPADDRESS);
		
		this.domContent = eventHashMap.get(EventConstants.DOMCONTENT);
		
		this.url = eventHashMap.get(EventConstants.URL);
		
		this.browser = eventHashMap.get(EventConstants.BROWSER);
		
		this.platform = eventHashMap.get(EventConstants.PLATFORM);
		
	}

	/** Deserialise given JSON and creates a DOMBean element with the result
	 * @param serialised class in JSON
	 */

	public DOMBean(String json){
		Gson gson = new Gson();
		DOMBean tempClass = gson.fromJson(json, DOMBean.class);

		this.timestamp = tempClass.timestamp;
		this.timestampms = tempClass.timestampms;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.ip = tempClass.ip;
		this.url = tempClass.url;
		this.browser = tempClass.browser;
		this.platform = tempClass.platform;
		this.domContent = tempClass.domContent;
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
	 * Timestamp of the DOM in ms
	 */
	private String timestampms;

	/**
	 * Timestamp in millisecons of the start of the session
	 */
	private String sessionstartms ="";

	/**
	 * Timestamp parsed of the start of the session
	 */
	private String sessionstartparsed ="";
	/**
	 * User's timezoneoffset
	 */
	private String usertimezoneoffset ="";
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
	private String ip;

	/**
	 * Web page url
	 */
	private String url;
	
	/**
	 * Client's browser
	 */
	private String browser;
	
	/**
	 * Client's operating system
	 */
	private String platform;
	
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

	public String getClientIP() {
		return ip;
	}

	public void setClientIP(String clientIP) {
		this.ip = clientIP;
	}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}

	public String getPlatform() {
		return platform;
	}

	public void setPlatform(String platform) {
		this.platform = platform;
	}

	public String getTimestampms() {
		return timestampms;
	}

	public void setTimestampms(String timestampms) {
		this.timestampms = timestampms;
	}

	public String getSessionstartms() {
		return sessionstartms;
	}

	public void setSessionstartms(String sessionstartms) {
		this.sessionstartms = sessionstartms;
	}

	public String getSessionstartparsed() {
		return sessionstartparsed;
	}

	public void setSessionstartparsed(String sessionstartparsed) {
		this.sessionstartparsed = sessionstartparsed;
	}

	public String getUsertimezoneoffset() {
		return usertimezoneoffset;
	}

	public void setUsertimezoneoffset(String usertimezoneoffset) {
		this.usertimezoneoffset = usertimezoneoffset;
	}
}
