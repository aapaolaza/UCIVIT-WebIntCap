package usaproxy.events;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;
/**
 * The system periodically checks the scroll state of the browser.
 * If there is a difference, it records either the x or y measure.
 * 
 */

public class Scroll extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Scroll(){
		super();
		this.ip = "";
		this.timestamp = "";
		this.sd = "";
		this.sid = "";
		this.event = "";
		this.scrollX = null;
		this.scrollY = null;
		this.browser = "";
		this.url = "";
	}

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param scrollX
	 * @param scrollY
	 * @param browser
	 * @param url
	 */
	public Scroll(String ip, String timestamp, String sd, String sid,
			String event, Float scrollX, Float scrollY, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.scrollX = scrollX;
		this.scrollY = scrollY;
		this.browser = browser;
		this.url = url;
	}

	/** Deserialise given JSON and creates a Scroll element with the result
	 * @param serialised class in JSON
	 */

	public Scroll(String json){
		Gson gson = new Gson();
		Scroll tempClass = gson.fromJson(json, Scroll.class);

		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.scrollX = tempClass.scrollX;
		this.scrollY = tempClass.scrollY;
		this.browser = tempClass.browser;
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
	 * Constructs the class getting the information from a HashMap.
	 * 
	 * The mapping of HashMap keys to variables is the following: 
	 * text log --> variable name
	 * 
	 * from variable --> ip
	 * time --> timestamp
	 * sd --> sd
	 * sid --> sid
	 * event --> event
	 * scrollx --> scrollX
	 * scrolly --> scrollY
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static Scroll parseFromHash(EventDataHashMap eventData) {

		Scroll classObject = new Scroll();

		classObject.ip = eventData.get(EventConstants.IPADDRESS);

		classObject.timestamp = eventData.get(EventConstants.TIMESTAMP);

		classObject.sd = eventData.get(EventConstants.SD);

		classObject.sid = eventData.get(EventConstants.SID);

		classObject.event = eventData.get(EventConstants.EVENTNAME);

		//This is a special case, only one of scrollX or scrollY will be different than null
		//if both are, or if one of them triggers an error without being null, then we record an error
		if (eventData.get(EventConstants.SCROLLX)==null && eventData.get(EventConstants.SCROLLY)==null)
		{
			ErrorLogging.logError("Scroll.java/parseScrollObject", 
					"Omitted the parsing of scrollX and scrollY values, both were null", null);
		}
		else{

			try{
				classObject.scrollX = Float.parseFloat(eventData.get(EventConstants.SCROLLX));
			}
			catch(Exception e){
				//we only log an error if the reading was not null (it was something unexpected)
				if (eventData.get(EventConstants.SCROLLX)!=null)
					ErrorLogging.logError("Scroll.java/parseScrollObject", 
							"Error parsing the scrollX value", e);
			}

			try{
				classObject.scrollY = Float.parseFloat(eventData.get(EventConstants.SCROLLY));
			}
			catch(Exception e){
				//we only log an error if the reading was not null (it was something unexpected)
				if (eventData.get(EventConstants.SCROLLY)!=null)
					ErrorLogging.logError("Scroll.java/parseScrollObject", 
							"Error parsing the scrollY value", e);
			}
		}

		classObject.browser = eventData.get(EventConstants.BROWSER);

		classObject.url = eventData.get(EventConstants.URL);

		return classObject;
	}

	/**
	 * User's IP
	 */
	private String ip;

	/**
	 * Timestamp of the event
	 */
	private String timestamp;

	/**
	 * Id of the website
	 */
	private String sd;

	/**
	 * User's ID
	 */
	private String sid;

	/**
	 * Event's name
	 */
	private String event;

	/**
	 * Percentage of scroll in the X axis
	 */
	private Float scrollX;

	/**
	 * Percentage of scroll in the Y axis
	 */
	private Float scrollY;

	/**
	 * Name of the browser
	 */
	private String browser;

	/**
	 * URL where the event happened
	 */
	private String url;



	/**
	 * @return the ip
	 */
	public String getIp() {
		return ip;
	}

	/**
	 * @param ip the ip to set
	 */
	public void setIp(String ip) {
		this.ip = ip;
	}

	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return timestamp;
	}

	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	/**
	 * @return the sd
	 */
	public String getSd() {
		return sd;
	}

	/**
	 * @param sd the sd to set
	 */
	public void setSd(String sd) {
		this.sd = sd;
	}

	/**
	 * @return the sid
	 */
	public String getSid() {
		return sid;
	}

	/**
	 * @param sid the sid to set
	 */
	public void setSid(String sid) {
		this.sid = sid;
	}

	/**
	 * @return the event
	 */
	public String getEvent() {
		return event;
	}

	/**
	 * @param event the event to set
	 */
	public void setEvent(String event) {
		this.event = event;
	}

	/**
	 * @return the X scroll value
	 */
	public Float getScrollX() {
		return scrollX;
	}

	/**
	 * @param key the X scroll value to set
	 */
	public void setScrollX(Float scrollX) {
		this.scrollX = scrollX;
	}

	/**
	 * @return the Y scroll value
	 */
	public Float getScrollY() {
		return scrollY;
	}

	/**
	 * @param key the Y scroll value to set
	 */
	public void setScrollY(Float scrollY) {
		this.scrollY = scrollY;
	}

	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return browser;
	}

	/**
	 * @param browser the browser to set
	 */
	public void setBrowser(String browser) {
		this.browser = browser;
	}

	/**
	 * @return the url
	 */
	public String getUrl() {
		return url;
	}

	/**
	 * @param url the url to set
	 */
	public void setUrl(String url) {
		this.url = url;
	}
}
