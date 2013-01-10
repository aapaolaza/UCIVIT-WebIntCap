package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user changes the state of one of the following types of 
 * elements: select-one, select-multiple, text, textarea, file, checkbox, password or radio.
 * Its content depends on the type of element.
 * 
 */
public class Change extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Change(){
		super();
		this.ip = "";
		this.timestamp = "";
		this.sd = "";
		this.sid = "";
		this.event = "";
		this.type = "";
		this.checked = "";
		this.nodeInfo = null;
		this.value = "";
		this.selected = "";
		this.browser = "";
		this.url = "";
	}

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param type
	 * @param checked //in case of checkbox
	 * @param nodeInfo
	 * @param value //in case of text or file field and selection menus
	 * @param selected //in case of single selection menus
	 * @param browser
	 * @param url
	 */
	public Change(String ip, String timestamp, String sd, String sid,
			String event, String type, String checked, NodeInfo nodeInfo,
			String value, String selected, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.type = type;
		this.checked = checked;
		this.nodeInfo = nodeInfo;
		this.value = value;
		this.selected = selected;
		this.browser = browser;
		this.url = url;
	}

	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */

	public Change(String json){
		Gson gson = new Gson();
		Change tempClass = gson.fromJson(json, Change.class);

		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.type = tempClass.type;
		this.checked = tempClass.checked;
		this.nodeInfo = tempClass.nodeInfo;
		this.value = tempClass.value;
		this.selected = tempClass.selected;
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
	 * type --> type
	 * checked --> checked
	 * from variable --> nodeInfo
	 * value --> value
	 * selected --> selected
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static Change parseFromHash(EventDataHashMap eventData) {

		Change classObject = new Change();
		
		classObject.ip = eventData.get(EventConstants.IPADDRESS);

		classObject.timestamp = eventData.get(EventConstants.TIMESTAMP);

		classObject.sd = eventData.get(EventConstants.SD);

		classObject.sid = eventData.get(EventConstants.SID);

		classObject.event = eventData.get(EventConstants.EVENTNAME);

		classObject.type = eventData.get(EventConstants.TYPE);

		classObject.checked = eventData.get(EventConstants.CHECKED);

		classObject.nodeInfo = NodeInfo.parseFromHash(eventData);

		classObject.value = eventData.get(EventConstants.VALUE);

		classObject.selected = eventData.get(EventConstants.SELECTED);

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
	 * Type of element susceptible to a "change" event
	 */
	private String type;

	/**
	 * In the case of a checkbox, indicates if it's checked or not
	 */
	private String checked;

	/**
	 * Nodeinfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * In the case of text or file field and selection menus, indicates the value of the element
	 */
	private String value;

	/**
	 * In the case of single selection menus, indicates the index of the selected element
	 */
	private String selected;


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
	 * @return the type
	 */
	public String getType() {
		return type;
	}

	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * @return the checked
	 */
	public String getChecked() {
		return checked;
	}

	/**
	 * @param checked the checked to set
	 */
	public void setChecked(String checked) {
		this.checked = checked;
	}

	/**
	 * @return the nodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	/**
	 * @param nodeInfo the nodeInfo to set
	 */
	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

	/**
	 * @return the value
	 */
	public String getValue() {
		return value;
	}

	/**
	 * @param value the value to set
	 */
	public void setValue(String value) {
		this.value = value;
	}

	/**
	 * @return the selected
	 */
	public String getSelected() {
		return selected;
	}

	/**
	 * @param selected the selected to set
	 */
	public void setSelected(String selected) {
		this.selected = selected;
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
