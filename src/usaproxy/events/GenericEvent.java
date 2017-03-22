package usaproxy.events;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;

/**
 * Generic event 
 * 
 */
public class GenericEvent {
	
	/**
	 * Empty constructor
	 */
	
	public GenericEvent(){
		super();

	}

//	/**
//	 * Deserialise given JSON and creates a generic element with the result
//	 * 
//	 * @param serialised
//	 *            class in JSON
//	 */
//
//	public GenericEvent(String json) {
//		
//	}

	/**
	 * Serialise the class into a JSON, and returns the String containing it
	 * 
	 * @return serialised class in JSON
	 */

	public String toGson() {
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}
	
	/**
	 * Constructs the class getting the information from a HashMap.
	 * 
	 * The mapping of HashMap keys to variables is the following: 
	 * text log --> variable name
	 * 
	 * ip --> ip
	 * time --> timestamp
	 * sd --> sd
	 * sid --> sid
	 * event --> event
	 * from variable --> nodeInfo
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	protected GenericEvent(EventDataHashMap eventData) {
		
		this.ip = eventData.get(EventConstants.IPADDRESS);

		
		this.timestampms = eventData.get(EventConstants.TIMESTAMP);
		
		this.timestamp = formatDateFromMs(eventData.get(EventConstants.TIMESTAMP));

	    this.episodecount = eventData.get(EventConstants.EPISODECOUNT);

		this.sessionstartms = eventData.get(EventConstants.SESSIONSTARTMS);
		
		this.sessionstartparsed = formatDateFromMs(eventData.get(EventConstants.SESSIONSTARTMS));
		
		this.usertimezoneoffset = eventData.get(EventConstants.USERTIMEZONEOFFSET);

		this.sd = eventData.get(EventConstants.SD);

		this.sid = eventData.get(EventConstants.SID);

		this.event = eventData.get(EventConstants.EVENTNAME);

		this.platform = eventData.get(EventConstants.PLATFORM);
		
		this.browser = eventData.get(EventConstants.BROWSER);

		this.url = eventData.get(EventConstants.URL);

	}
	
	public GenericEvent(GenericEvent tempClass){
		this.ip = tempClass.ip;
		this.timestampms = tempClass.timestampms;
		this.timestamp = tempClass.timestamp;
	    this.episodecount = tempClass.episodecount;
		this.sessionstartms = tempClass.sessionstartms;
		this.sessionstartparsed = tempClass.sessionstartparsed;	
		this.usertimezoneoffset = tempClass.usertimezoneoffset;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.platform = tempClass.platform;
		this.browser = tempClass.browser;
		this.url = tempClass.url;
	}
	
	/**
	 * Takes a string containing a timestamp in milliseconds and try to 
	 * parse it into the following format: yyyy-MM-dd,HH:mm:ss:SSS
	 * 
	 * @param timestamp
	 * @return formatted string with timestamp, or the input if parsing exception occurs
	 */
	public static String formatDateFromMs(String timestamp){
		
		try{
			SimpleDateFormat parserSDF=new SimpleDateFormat("yyyy-MM-dd,HH:mm:ss:SSS");
		
			timestamp = parserSDF.format(new Date(Long.parseLong(timestamp)));
		}catch (Exception e){
			
			ErrorLogging.logCriticalError("GenericEvent.java:formatDateFromMs", 
					"A problem occurred when trying to format the following string from milliseconds to a readable date:\n" + timestamp, e);
		}
		
		return timestamp;
		
	}


	/**
	 * User's IP
	 */
	protected String ip ="";


	/**
	 * Timestamp of the event in milliseconds
	 */
	protected String timestampms ="";
	
	/**
	 * Timestamp of the event
	 */
	protected String timestamp ="";

	/**
	 * Episode count as provided by the client
	 */
	protected String episodecount = "";

	/**
	 * Timestamp in millisecons of the start of the session
	 */
	protected String sessionstartms ="";

	/**
	 * Timestamp parsed of the start of the session
	 */
	protected String sessionstartparsed ="";

	/**
	 * User's timezoneoffset
	 */
	protected String usertimezoneoffset ="";
	
	/**
	 * Id of the website
	 */
	protected String sd ="";

	/**
	 * User's ID
	 */
	protected String sid ="";

	/**
	 * Event's name
	 */
	protected String event ="";
	
	/**
	 * Name of the operating system
	 */
	protected String platform ="";
	
	/**
	 * Name of the browser
	 */
	protected String browser ="";

	/**
	 * URL wheree the event happened
	 */
	protected String url ="";
	
	/**
	 * @return the ip
	 */
	public String getIp() {
		return this.ip;
	}


	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return this.timestamp;
	}

	public String getEpisodecount() {
		return this.episodecount;
	}
	
	/**
	 * @return the sd
	 */
	public String getSd() {
		return this.sd;
	}


	/**
	 * @return the sid
	 */
	public String getSid() {
		return this.sid;
	}


	/**
	 * @return the event
	 */
	public String getEvent() {
		return this.event;
	}


	/**
	 * @return the nodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return null;
	}

	/**
	 * @return the platform
	 */
	public String getPlatform() {
		return this.platform;
	}


	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return this.browser;
	}


	/**
	 * @return the url
	 */
	public String getUrl() {
		return this.url;
	}


	/**
	 * @return the type
	 */
	public String getType() {
		return "";
	}


	/**
	 * @return the checked
	 */
	public String getChecked() {
		return "";
	}


	/**
	 * @return the value
	 */
	public String getValue() {
		return "";
	}


	/**
	 * @return the selected
	 */
	public String getSelected() {
		return "";
	}


	/**
	 * @return the selectionTool
	 */
	public String getSelectionTool() {
		return "";
	}


	/**
	 * @return the selectedContent
	 */
	public String getSelectedContent() {
		return "";
	}


	/**
	 * @return the scrollX
	 */
	public Float getScrollX() {
		return null;
	}


	/**
	 * @return the scrollY
	 */
	public Float getScrollY() {
		return null;
	}


	/**
	 * @return the size
	 */
	public String getSize() {
		return "";
	}


	/**
	 * @return the content
	 */
	public String getContent() {
		return "";
	}


	/**
	 * @return the delta
	 */
	public String getDelta() {
		return null;
	}


	/**
	 * @return the button
	 */
	public String getButton() {
		return "";
	}


	/**
	 * @return the mouseCoordinates
	 */
	public MouseCoordinates getMouseCoordinates() {
		return null;
	}


	/**
	 * @return the key
	 */
	public String getKey() {
		return "";
	}


	/**
	 * @return the numberOfChanges
	 */
	public Integer getNumberOfChanges() {
		return null;
	}


	public void setIp(String ip) {
		this.ip = ip;
	}


	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}
	
	public void setEpisodecount(String episodecount) {
		this.episodecount = episodecount;
	}

	public void setSd(String sd) {
		this.sd = sd;
	}


	public void setSid(String sid) {
		this.sid = sid;
	}


	public void setEvent(String event) {
		this.event = event;
	}


	public void setPlatform(String platform) {
		this.platform = platform;
	}


	public void setBrowser(String browser) {
		this.browser = browser;
	}


	public void setUrl(String url) {
		this.url = url;
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

	public String getTimestampms() {
		return timestampms;
	}

	public void setTimestampms(String timestampms) {
		this.timestampms = timestampms;
	}

	
	////////MOBILE EVENTS
	
	public String getAlpha() {
		return "";
	}

	public String getBeta() {
		return "";
	}


	public String getGamma() {
		return "";
	}
	
	public String getAccelX() {
		return "";
	}

	public String getAccelY() {
		return "";
	}

	public String getAccelZ() {
		return "";
	}

	public String getMaxAccel() {
		return "";
	}

	public String getMaxAccelInclGrav() {
		return "";
	}
	
	public String getOrientation() {
		return "";
	}

	public String getOrientationRaw() {
		return "";
	}

	public String getNumberOfTouches() {
		return "";
	}

	public String getIsCtrlKey() {
		return "";
	}

	public String getIsShiftKey() {
		return "";
	}

	public String getIsAltKey() {
		return "";
	}

	public String getIsMetaKey() {
		return "";
	}

	public ArrayList<MobileTouchObject> getTouchList() {
		return null;
	}

	public String getUsertimezoneoffset() {
		return usertimezoneoffset;
	}

	public void setUsertimezoneoffset(String usertimezoneoffset) {
		this.usertimezoneoffset = usertimezoneoffset;
	}

	@Override
	public String toString() {
		return "GenericEvent [ip=" + ip + ", timestampms=" + timestampms
				+ ", timestamp=" + timestamp + ", sessionstartms="
				+ sessionstartms + ", episodecount=" + episodecount +
				", sessionstartparsed=" + sessionstartparsed
				+ ", usertimezoneoffset=" + usertimezoneoffset + ", sd=" + sd
				+ ", sid=" + sid + ", event=" + event + ", platform="
				+ platform + ", browser=" + browser + ", url=" + url + "]";
	}

	public boolean equals(GenericEvent event) {
		if (this.sid.equals(event.getSid()) && this.sd.equals(event.getSd())
				&& this.event.equals(event.getEvent())
				&& this.timestamp.equals(event.getTimestamp())
				&& this.timestampms.equals(event.getTimestampms())
				&& this.platform.equals(event.getPlatform())) {
			return true;
		}
		return false;
		
	}	

}
