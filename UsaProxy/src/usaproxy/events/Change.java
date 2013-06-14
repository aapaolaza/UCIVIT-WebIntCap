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
		this.type = "";
		this.checked = "";
		this.nodeInfo = null;
		this.value = "";
		this.selected = "";
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param type
//	 * @param checked //in case of checkbox
//	 * @param nodeInfo
//	 * @param value //in case of text or file field and selection menus
//	 * @param selected //in case of single selection menus
//	 * @param platform
//	 * @param browser
//	 * @param url
//	 */
//	public Change(String ip, String timestamp, String sd, String sid,
//			String event, String type, String checked, NodeInfo nodeInfo,
//			String value, String selected, String platform, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.type = type;
//		this.checked = checked;
//		this.nodeInfo = nodeInfo;
//		this.value = value;
//		this.selected = selected;
//		this.platform = platform; 
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Change element with the result
	 * @param serialised class in JSON
	 */

	public Change(String json){
		this(new Gson().fromJson(json, Change.class));

	}
	
	public Change (Change tempClass){
		super(tempClass);
		this.type = tempClass.type;
		this.checked = tempClass.checked;
		this.nodeInfo = tempClass.nodeInfo;
		this.value = tempClass.value;
		this.selected = tempClass.selected;
		
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

		return new Change(eventData);

	}
	
	private Change(EventDataHashMap eventData) {
		super(eventData);
		
		this.type = eventData.get(EventConstants.TYPE);
		this.checked = eventData.get(EventConstants.CHECKED);
		this.nodeInfo = NodeInfo.parseFromHash(eventData);
		this.value = eventData.get(EventConstants.VALUE);
		this.selected = eventData.get(EventConstants.SELECTED);
	}

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

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getChecked() {
		return checked;
	}

	public void setChecked(String checked) {
		this.checked = checked;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public String getSelected() {
		return selected;
	}

	public void setSelected(String selected) {
		this.selected = selected;
	}
}
