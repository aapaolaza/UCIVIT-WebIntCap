package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user presses a key. Together with keyup and keypress they conform
 * the cycle of pressing and releasing a key, being keydown the end.
 * The difference with this event is that it records the physical key that corresponds
 * to that action.
 * 
 */
public class Keydown extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Keydown(){
		super();
		this.key = "";
		this.nodeInfo = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param key
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 */
//	public Keydown(String ip, String timestamp, String sd, String sid,
//			String event, String key,  NodeInfo nodeInfo,
//			String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.key = key;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Keydown element with the result
	 * @param serialised class in JSON
	 */
	
	public Keydown (String json){
		this(new Gson().fromJson(json, Keydown.class));
	}
	
	public Keydown (Keydown tempClass){
		super(tempClass);
		
		this.key = tempClass.key;
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
	 * key --> key
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
		
	public static Keydown parseFromHash(EventDataHashMap eventData) {

		return new Keydown(eventData);
	}
	
	private Keydown(EventDataHashMap eventData) {
		super(eventData);
		
		this.key = eventData.get(EventConstants.KEY);

		this.nodeInfo = NodeInfo.parseFromHash(eventData);
	}

	/**
	 * Name of the key involved in the event
	 */
	private String key;
	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

}
