package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user pastes text into a text area.
 * It captures the text that was pasted. 
 * 
 */
public class Paste extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Paste(){
		super();
	
		this.content = "";
		this.nodeInfo = null;
	}
	
//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param content
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 */
//	public Paste(String ip, String timestamp, String sd, String sid,
//			String event, String content, NodeInfo nodeInfo, 
//			String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.content = content;
//		this.nodeInfo = nodeInfo;
//		this.browser = browser;
//		this.url = url;
//	}
	
	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */

	public Paste (String json){
		this(new Gson().fromJson(json, Paste.class));
	}
	
	public Paste (Paste tempClass){
		super(tempClass);
		
		this.content = tempClass.content;
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
	 * Constructs the class with an IP address obtained as a parameter and a
	 * string with the rest of the information. The string will need to be parsed
	 * in order to get the values for each attribute.
	 * 
	 * The mapping of HashMap keys to variables is the following: 
	 * text log --> variable name
	 * 
	 * from variable --> ip
	 * time --> timestamp
	 * sd --> sd
	 * sid --> sid
	 * event --> event
	 * content --> content
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
	

	public static Paste parseFromHash(EventDataHashMap eventData) {

		return new Paste(eventData);
	}
	
	private Paste(EventDataHashMap eventData) {
		super(eventData);
		
		this.content = eventData.get(EventConstants.CONTENT);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}
	/**
	 * Text content which is being pasted
	 */
	private String content;
	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

}
