package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user moves the mouse. It's not recorded every time the mouse is moved.
 * Instead the position is checked periodically, and stored when it's different. 
 * 
 */
public class Mousemove extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Mousemove(){
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
//	 * @param browser
//	 * @param url
//	 */
//	public Mousemove(String ip, String timestamp, String sd, String sid,
//			String event, double coordX, double coordY, double offsetX,
//			double offsetY, MouseCoordinates mouseCoordinates,NodeInfo nodeInfo,
//			String browser, String url) {
//		
//		super( ip,  timestamp,  sd,  sid,
//				 event,  browser,  url);
//		
//		this.mouseCoordinates = mouseCoordinates;
//		this.nodeInfo = nodeInfo;
//	}


	/** Deserialise given JSON and creates a new Mousemove element with the result
	 * @param serialised class in JSON
	 */

	public Mousemove (String json){
		this(new Gson().fromJson(json, Mousemove.class));
	}
	
	public Mousemove (Mousemove tempClass){
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
	public static Mousemove parseFromHash(EventDataHashMap eventData) {

		return new Mousemove(eventData);
	}
	
	private Mousemove(EventDataHashMap eventData) {
		super(eventData);
		
		this.mouseCoordinates = MouseCoordinates.parseFromHash(eventData);

		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}


	/**
	 * MouseCoordinates element with all the information available of the mouse coordinates
	 */
	private MouseCoordinates mouseCoordinates;

	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * @return the ip

	/**
	 * @return the mouseCoordinates
	 */
	public MouseCoordinates getMouseCoordinates() {
		return mouseCoordinates;
	}


	/**
	 * @param mouseCoordinates the mouseCoordinates to set
	 */
	public void setMouseCoordinates(MouseCoordinates mouseCoordinates) {
		this.mouseCoordinates = mouseCoordinates;
	}


	/**
	 * @return the NodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	/**
	 * @param nodeInfo the button to set
	 */
	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}
}
