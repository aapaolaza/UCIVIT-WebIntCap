package usaproxy.events;


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
//		this.ip = "";
//		this.timestamp = "";
//		this.sd = "";
//		this.sid = "";
//		this.event = "";
//		this.mouseCoordinates = null;
//		this.nodeInfo = null;
//		this.browser = "";
//		this.url = "";
//		//Change
//		this.type = "";
//		this.checked = "";
//		this.value = "";
//		this.selected = "";
//		
//		//SelectContent
//		this.selectionTool = "";
//		this.selectedContent = "";
//		
//		//Scroll
//		this.scrollX = null;
//		this.scrollY = null;
//		
//		//Resize
//		this.size = "";
//		
//		//Cut, Copy & Paste
//		this.content = "";
//		
//		//mousewheel
//		this.delta = null;
//		
//		//mousedown, mouseup
//		this.button = "";
//		
//		//keyboard event
//		this.key = "";
//		
//		//domchange
//		this.numberOfChanges = null;

	}
	
	
	///TODO This function needs to be finished 
	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param nodeInfo
	 * @param browser
	 * @param url
	 * 
	 * @param type
	 * @param checked //in case of checkbox
	 * @param value //in case of text or file field and selection menus
	 * @param selected //in case of single selection menus
	 * 
	 * @param selectionTool
	 * @param selectedContent
	 * 
	 * @param scrollX
	 * @param scrollY
	 * 
	 * @param size
	 * 
	 * @param content
	 * 
	 * @param delta
	 * 
	 * @param button
	 * @param mouseCoordinates

	 */
	public GenericEvent(String ip, String timestamp, String sd, String sid,
			String event, NodeInfo nodeInfo, String browser, String url) {
		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
	}

	/**
	 * Deserialise given JSON and creates a generic element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public GenericEvent(String json) {
		
//		Gson gson = new Gson();
//		GenericEvent tempClass = gson.fromJson(json, GenericEvent.class);
//
//		this.ip = tempClass.ip;
//		this.timestamp = tempClass.timestamp;
//		this.sd = tempClass.sd;
//		this.sid = tempClass.sid;
//		this.event = tempClass.event;
//		this.nodeInfo = tempClass.nodeInfo;
//		this.browser = tempClass.browser;
//		this.url = tempClass.url;
//		
//		//Change
//		this.type = tempClass.type;
//		this.checked = tempClass.checked;
//		this.value = tempClass.value;
//		this.selected = tempClass.selected;
//
//		//SelectContent
//		this.selectionTool = tempClass.selectionTool;
//		this.selectedContent = tempClass.selectedContent;
//
//		//Scroll
//		this.scrollX = tempClass.scrollX;
//		this.scrollY = tempClass.scrollY;
//		
//		//Resize
//		this.size = tempClass.size;
//		
//		//Cut, Copy & Paste
//		this.content = tempClass.content;
//		
//		//Mousewheel
//		this.delta = tempClass.delta;
		
		//I stopped writing here as it made no sense
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
	public static GenericEvent parseFromHash(EventDataHashMap eventData) {

//		GenericEvent classObject = new GenericEvent();
//		
//		classObject.ip = eventData.get(EventConstants.IPADDRESS);
//
//		classObject.timestamp = eventData.get(EventConstants.TIMESTAMP);
//
//		classObject.sd = eventData.get(EventConstants.SD);
//
//		classObject.sid = eventData.get(EventConstants.SID);
//
//		classObject.event = eventData.get(EventConstants.EVENTNAME);
//		
//		classObject.nodeInfo = NodeInfo.parseFromHash(eventData);
//
//		classObject.browser = eventData.get(EventConstants.BROWSER);
//
//		classObject.url = eventData.get(EventConstants.URL);
//
//		return classObject;
		return null;
	}

//	
//	/**
//	 * User's IP
//	 */
//	private String ip;
//
//	/**
//	 * Timestamp of the event
//	 */
//	private String timestamp;
//
//	/**
//	 * Id of the website
//	 */
//	private String sd;
//
//	/**
//	 * User's ID
//	 */
//	private String sid;
//
//	/**
//	 * Event's name
//	 */
//	private String event;
//
//	/**
//	 * NodeInfo element with all the information available of the node
//	 */
//	private NodeInfo nodeInfo;
//
//	/**
//	 * Name of the browser
//	 */
//	private String browser;
//
//	/**
//	 * URL wheree the event happened
//	 */
//	private String url;
//	
//	//Change
//	
//	/**
//	 * Type of element susceptible to a "change" event
//	 */
//	private String type;
//
//	/**
//	 * In the case of a checkbox, indicates if it's checked or not
//	 */
//	private String checked;
//	/**
//	 * In the case of text or file field and selection menus, indicates the value of the element
//	 */
//	private String value;
//
//	/**
//	 * In the case of single selection menus, indicates the index of the selected element
//	 */
//	private String selected;
//
//	//SelectContent
//	/**
//	 * Name of the tool employed for the selection of the content (at the moment only mouse).
//	 * It may not be available.
//	 * 
//	 */
//	private String selectionTool;
//
//	/**
//	 * String with the selected content.
//	 * 
//	 */
//	private String selectedContent;
//	
//	//Scroll
//
//	/**
//	 * X coordinate of the scroll
//	 */
//	private Integer scrollX;
//
//	/**
//	 * Y coordinate of the scroll
//	 */
//	private Integer scrollY;
//
//	//size
//	/**
//	 * String representing the size of the new screen (in the format 1440x900)
//	 */
//	private String size;
//	
//	//Cut, Copy & Paste
//	/**
//	 * Text content which is being pasted
//	 */
//	private String content;
//	
//	//Mousewheel
//
//	/**
//	 * Value of the delta indicates the amount of wheel movement
//	 */
//	private Integer delta;
//	
//	//mousedown mouseup
//	/**
//	 * Which button was pressed (l for left, r for right and m for middle)
//	 */
//	private String button;
//	/**
//	 * MouseCoordinates element with all the information available of the mouse coordinates
//	 */
//	private MouseCoordinates mouseCoordinates;
//	
//	//Keyboard
//	/**
//	 * Name of the key involved in the event
//	 */
//	private String key;
//	
//	//Domchange
//	/**
//	 * Number of changes since the last DOM change
//	 */
//	private Integer numberOfChanges;

	/**
	 * @return the ip
	 */
	public String getIp() {
		return "";
	}


	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return "";
	}


	/**
	 * @return the sd
	 */
	public String getSd() {
		return "";
	}


	/**
	 * @return the sid
	 */
	public String getSid() {
		return "";
	}


	/**
	 * @return the event
	 */
	public String getEvent() {
		return "";
	}


	/**
	 * @return the nodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return null;
	}


	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return "";
	}


	/**
	 * @return the url
	 */
	public String getUrl() {
		return "";
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
	public Integer getDelta() {
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

//
//	/**
//	 * @param ip the ip to set
//	 */
//	public void setIp(String ip) {
//		this.ip = ip;
//	}
//
//
//	/**
//	 * @param timestamp the timestamp to set
//	 */
//	public void setTimestamp(String timestamp) {
//		this.timestamp = timestamp;
//	}
//
//
//	/**
//	 * @param sd the sd to set
//	 */
//	public void setSd(String sd) {
//		this.sd = sd;
//	}
//
//
//	/**
//	 * @param sid the sid to set
//	 */
//	public void setSid(String sid) {
//		this.sid = sid;
//	}
//
//
//	/**
//	 * @param event the event to set
//	 */
//	public void setEvent(String event) {
//		this.event = event;
//	}
//
//
//	/**
//	 * @param nodeInfo the nodeInfo to set
//	 */
//	public void setNodeInfo(NodeInfo nodeInfo) {
//		this.nodeInfo = nodeInfo;
//	}
//
//
//	/**
//	 * @param browser the browser to set
//	 */
//	public void setBrowser(String browser) {
//		this.browser = browser;
//	}
//
//
//	/**
//	 * @param url the url to set
//	 */
//	public void setUrl(String url) {
//		this.url = url;
//	}
//
//
//	/**
//	 * @param type the type to set
//	 */
//	public void setType(String type) {
//		this.type = type;
//	}
//
//
//	/**
//	 * @param checked the checked to set
//	 */
//	public void setChecked(String checked) {
//		this.checked = checked;
//	}
//
//
//	/**
//	 * @param value the value to set
//	 */
//	public void setValue(String value) {
//		this.value = value;
//	}
//
//
//	/**
//	 * @param selected the selected to set
//	 */
//	public void setSelected(String selected) {
//		this.selected = selected;
//	}
//
//
//	/**
//	 * @param selectionTool the selectionTool to set
//	 */
//	public void setSelectionTool(String selectionTool) {
//		this.selectionTool = selectionTool;
//	}
//
//
//	/**
//	 * @param selectedContent the selectedContent to set
//	 */
//	public void setSelectedContent(String selectedContent) {
//		this.selectedContent = selectedContent;
//	}
//
//
//	/**
//	 * @param scrollX the scrollX to set
//	 */
//	public void setScrollX(Integer scrollX) {
//		this.scrollX = scrollX;
//	}
//
//
//	/**
//	 * @param scrollY the scrollY to set
//	 */
//	public void setScrollY(Integer scrollY) {
//		this.scrollY = scrollY;
//	}
//
//
//	/**
//	 * @param size the size to set
//	 */
//	public void setSize(String size) {
//		this.size = size;
//	}
//
//
//	/**
//	 * @param content the content to set
//	 */
//	public void setContent(String content) {
//		this.content = content;
//	}
//
//
//	/**
//	 * @param delta the delta to set
//	 */
//	public void setDelta(Integer delta) {
//		this.delta = delta;
//	}
//
//
//	/**
//	 * @param button the button to set
//	 */
//	public void setButton(String button) {
//		this.button = button;
//	}
//
//
//	/**
//	 * @param mouseCoordinates the mouseCoordinates to set
//	 */
//	public void setMouseCoordinates(MouseCoordinates mouseCoordinates) {
//		this.mouseCoordinates = mouseCoordinates;
//	}
//
//
//	/**
//	 * @param key the key to set
//	 */
//	public void setKey(String key) {
//		this.key = key;
//	}
//
//
//	/**
//	 * @param numberOfChanges the numberOfChanges to set
//	 */
//	public void setNumberOfChanges(Integer numberOfChanges) {
//		this.numberOfChanges = numberOfChanges;
//	}

}
