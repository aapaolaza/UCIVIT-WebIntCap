package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user release the  mouse button. It records which button was pressed.
 * Together with mousedown it represents the whole cycle of a click action, being mouseup the 
 * end. 
 * 
 */
public class Contextmenu extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Contextmenu(){
		super();
		this.mouseCoordinates = null;
		this.nodeInfo = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param mouseCoordinates
//	 * @param nodeInfo
//	 * @param platform
//	 * @param browser
//	 * @param url
//	 */
//	public Contextmenu(String ip, String timestamp, String sd, String sid,
//			String event,MouseCoordinates mouseCoordinates, NodeInfo nodeInfo,
//			String platform, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.mouseCoordinates = mouseCoordinates;
//		this.nodeInfo = nodeInfo;
//		this.platform = platform;
//		this.browser = browser;
//		this.url = url;
//	}
	
	/** Deserialise given JSON and creates a Contextmenu element with the result
	 * @param serialised class in JSON
	 */

	public Contextmenu(String json){
		this(new Gson().fromJson(json, Contextmenu.class));
	}
	
	public Contextmenu (Contextmenu tempClass){
		super(tempClass);
		
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
	public static Contextmenu parseFromHash(EventDataHashMap eventData) {


		return new Contextmenu(eventData);
	}
	
	private Contextmenu(EventDataHashMap eventData) {
		super(eventData);
		
		this.mouseCoordinates = MouseCoordinates.parseFromHash(eventData);

		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * MouseCoordinates element with all the information available of the mouse coordinates
	 */
	private MouseCoordinates mouseCoordinates;
	/**
	 * Nodeinfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;
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
	
		
}