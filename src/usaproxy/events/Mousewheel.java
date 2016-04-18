package usaproxy.events;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;
/**
 * Event triggered when the mouse wheel gets activated  
 * 
 */
public class Mousewheel extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Mousewheel(){
		super();
		this.delta = null;
		this.nodeInfo = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param delta
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 */
//	public Mousewheel(String ip, String timestamp, String sd, String sid,
//			String event, Integer delta, NodeInfo nodeInfo, String browser,
//			String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.delta = delta;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Mousewheel element with the result
	 * @param serialised class in JSON
	 */
	public Mousewheel (String json){
		this(new Gson().fromJson(json, Mousewheel.class));
	}
	
	public Mousewheel (Mousewheel tempClass){
		super(tempClass);

		this.delta = tempClass.delta;
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
	 * delta --> delta
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
	
	public static Mousewheel parseFromHash(EventDataHashMap eventData) {

		return new Mousewheel(eventData);
	}
	
	private Mousewheel(EventDataHashMap eventData) {
		super(eventData);
		
		try{
			this.delta = eventData.get(EventConstants.DELTA);
		}
		catch(Exception e){
			ErrorLogging.logError("Mousewheel.java/parseMousewheelObject", 
					"Error parsing the delta value", e);
		}

		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * Value of the delta indicates the amount of wheel movement
	 */
	private String delta;

	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	public String getDelta() {
		return delta;
	}

	public void setDelta(String delta) {
		this.delta = delta;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}


}
