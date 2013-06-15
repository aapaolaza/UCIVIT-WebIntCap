package usaproxy.events;


import java.text.SimpleDateFormat;
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
	
	
//	///TODO This function needs to be finished 
//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 * 
//	 * @param type
//	 * @param checked //in case of checkbox
//	 * @param value //in case of text or file field and selection menus
//	 * @param selected //in case of single selection menus
//	 * 
//	 * @param selectionTool
//	 * @param selectedContent
//	 * 
//	 * @param scrollX
//	 * @param scrollY
//	 * 
//	 * @param size
//	 * 
//	 * @param content
//	 * 
//	 * @param delta
//	 * 
//	 * @param button
//	 * @param mouseCoordinates
//
//	 */
//	public GenericEvent(String ip, String timestamp, String sd, String sid,
//			String event, String browser, String url) {
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.browser = browser;
//		this.url = url;
//
//	}

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

		
				
		this.timestamp = formatDateFromMs(eventData.get(EventConstants.TIMESTAMP));
		
		this.sessionstartms = eventData.get(EventConstants.SESSIONSTARTMS);
		
		this.sessionstartparsed = formatDateFromMs(eventData.get(EventConstants.SESSIONSTARTMS));

		this.sd = eventData.get(EventConstants.SD);

		this.sid = eventData.get(EventConstants.SID);

		this.event = eventData.get(EventConstants.EVENTNAME);

		this.platform = eventData.get(EventConstants.PLATFORM);
		
		this.browser = eventData.get(EventConstants.BROWSER);

		this.url = eventData.get(EventConstants.URL);

	}
	
	public GenericEvent(GenericEvent tempClass){
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
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
	public String formatDateFromMs(String timestamp){
		
		try{
			SimpleDateFormat parserSDF=new SimpleDateFormat("yyyy-MM-dd,HH:mm:ss:SSS");
		
			timestamp = parserSDF.format(new Date(Long.parseLong(timestamp)));
		}catch (Exception e){
			
			ErrorLogging.logCriticalError("GenericEvent.java:formatDateFromMs", 
					"A problem occurred when trying to format the following string from milliseconds to a readable date:/n" + timestamp, e);
		}
		
		return timestamp;
		
	}


	/**
	 * User's IP
	 */
	protected String ip ="";

	/**
	 * Timestamp of the event
	 */
	protected String timestamp ="";

	/**
	 * Timestamp in milisecons of the start of the session
	 */
	protected String sessionstartms ="";

	/**
	 * Timestamp parsed of the start of the session
	 */
	protected String sessionstartparsed ="";

	
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
		return "";
	}


	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return this.timestamp;
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
		return "";
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


	public void setIp(String ip) {
		this.ip = ip;
	}


	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
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
