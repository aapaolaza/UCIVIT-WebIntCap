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
		this.nodeInfo = null;
	}
//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param nodeInfo
//	 * @param platform
//	 * @param browser
//	 * @param url
//	 */
//	public Blur(String ip, String timestamp, String sd, String sid,
//			String event, NodeInfo nodeInfo, String platform,
//			String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.nodeInfo = nodeInfo;
//		this.platform = platform;
//		this.browser = browser;
//		this.url = url;
//	}

	/**
	 * Deserialise given JSON and creates a Blur element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public Blur(String json) {
		this(new Gson().fromJson(json, Blur.class));

	}
	
	public Blur (Blur tempClass){
		super(tempClass);
		
		this.nodeInfo = tempClass.nodeInfo;
		
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

		return new Blur(eventData);
	}
	
	private Blur(EventDataHashMap eventData) {
		super(eventData);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

}
