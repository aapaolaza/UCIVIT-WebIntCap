package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user double clicks.
 * Two single mouseclick events will be recorded even if this event is triggered.
 * 
 */
public class Dblclick extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Dblclick(){
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
//	public Dblclick(String ip, String timestamp, String sd, String sid,
//			String event, MouseCoordinates mouseCoordinates,
//			NodeInfo nodeInfo, String platform, String browser, String url) {
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

	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */
	public Dblclick (String json){
		this(new Gson().fromJson(json, Dblclick.class));
	}
	
	public Dblclick (Dblclick tempClass){
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
	
	public static Dblclick parseFromHash(EventDataHashMap eventData) {

		return new Dblclick(eventData);
	}
	
	private Dblclick(EventDataHashMap eventData) {
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

}
