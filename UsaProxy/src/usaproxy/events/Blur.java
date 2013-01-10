package usaproxy.events;


import com.google.gson.Gson;

/**
 * Event triggered when an element in the page loses its focus 
 * 
 
 */
public class Blur extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Blur(){
		super();
		this.ip = "";
		this.timestamp = "";
		this.sd = "";
		this.sid = "";
		this.event = "";
		this.nodeInfo = null;
		this.browser = "";
		this.url = "";
	}
	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param nodeInfo
	 * @param browser
	 * @param url
	 */
	public Blur(String ip, String timestamp, String sd, String sid,
			String event, NodeInfo nodeInfo, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.nodeInfo = nodeInfo;
		this.browser = browser;
		this.url = url;
	}

	/**
	 * Deserialise given JSON and creates a Blur element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public Blur(String json) {
		Gson gson = new Gson();
		Blur tempClass = gson.fromJson(json, Blur.class);

		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.nodeInfo = tempClass.nodeInfo;
		this.browser = tempClass.browser;
		this.url = tempClass.url;

	}

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
	public static Blur parseFromHash(EventDataHashMap eventData) {

		Blur classObject = new Blur();
		
		classObject.ip = eventData.get(EventConstants.IPADDRESS);

		classObject.timestamp = eventData.get(EventConstants.TIMESTAMP);

		classObject.sd = eventData.get(EventConstants.SD);

		classObject.sid = eventData.get(EventConstants.SID);

		classObject.event = eventData.get(EventConstants.EVENTNAME);
		
		classObject.nodeInfo = NodeInfo.parseFromHash(eventData);

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
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * Name of the browser
	 */
	private String browser;

	/**
	 * URL wheree the event happened
	 */
	private String url;

	/**
	 * @return the ip
	 */
	public String getIp() {
		return ip;
	}

	/**
	 * @param ip
	 *            the ip to set
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
	 * @param timestamp
	 *            the timestamp to set
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
	 * @param sd
	 *            the sd to set
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
	 * @param sid
	 *            the sid to set
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
	 * @param event
	 *            the event to set
	 */
	public void setEvent(String event) {
		this.event = event;
	}

	/**
	 * @return the nodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	/**
	 * @param nodeinfo
	 *            the nodeInfo to set
	 */
	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return browser;
	}

	/**
	 * @param browser
	 *            the browser to set
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
	 * @param url
	 *            the url to set
	 */
	public void setUrl(String url) {
		this.url = url;
	}

}
