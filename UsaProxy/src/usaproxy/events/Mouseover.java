package usaproxy.events;


import com.google.gson.Gson;

/**
 * Event triggered when the mouse gets into the hovering area of a certain element.
 * 
 */

public class Mouseover extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Mouseover(){
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
//	 * @param browser
//	 * @param url
//	 */
//	public Mouseover(String ip, String timestamp, String sd, String sid,
//			String event, NodeInfo nodeInfo, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
//	}

	/**
	 * Deserialise given JSON and creates a new Mouseout element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public Mouseover (String json){
		this(new Gson().fromJson(json, Mouseover.class));
	}
	
	public Mouseover (Mouseover tempClass){
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
	 * from variable --> ip
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
		
	public static Mouseover parseFromHash(EventDataHashMap eventData) {

		return new Mouseover(eventData);
	}
	
	private Mouseover(EventDataHashMap eventData) {
		super(eventData);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

}
