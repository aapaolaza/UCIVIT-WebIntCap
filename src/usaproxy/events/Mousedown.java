package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user clicks the mouse button. It records which button was pressed.
 * Together with mouseup it represents the whole cycle of a click action, being mousedown the start. 
 * 
 */
public class Mousedown extends GenericEvent{
	
	/**
	 * Empty constructor
	 */
	public Mousedown(){
		super();
		this.button = "";
		this.mouseCoordinates = null;
		this.nodeInfo = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param button
//	 * @param mouseCoordinates
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 */
//	public Mousedown(String ip, String timestamp, String sd, String sid,
//			String event, String button,MouseCoordinates mouseCoordinates,
//			NodeInfo nodeInfo, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.button = button;
//		this.mouseCoordinates = mouseCoordinates;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */

	public Mousedown (String json){
		this(new Gson().fromJson(json, Mousedown.class));
	}
	
	public Mousedown (Mousedown tempClass){
		super(tempClass);
		
		this.button = tempClass.button;
		this.mouseCoordinates = tempClass.mouseCoordinates;
		this.nodeInfo = tempClass.nodeInfo;
		
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
	 * but --> button
	 * from variable --> mouseCoordinates
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
		
	public static Mousedown parseFromHash(EventDataHashMap eventData) {

		return new Mousedown(eventData);
	}
	
	private Mousedown(EventDataHashMap eventData) {
		super(eventData);
		
		this.button = eventData.get(EventConstants.BUTTON);
		
		this.mouseCoordinates = MouseCoordinates.parseFromHash(eventData);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * Which button was pressed (l for left, r for right and m for middle)
	 */
	private String button;
	/**
	 * MouseCoordinates element with all the information available of the mouse coordinates
	 */
	private MouseCoordinates mouseCoordinates;
	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;
	
	public String getButton(){
		return button;
	}

	public MouseCoordinates getMouseCoordinates() {
		return mouseCoordinates;
	}

	public void setMouseCoordinates(MouseCoordinates mouseCoordinates) {
		this.mouseCoordinates = mouseCoordinates;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

	public void setButton(String button) {
		this.button = button;
	}

}
