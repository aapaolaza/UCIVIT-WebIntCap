package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user cuts text from a text area.
 * It captures the text that was cut. 
 * 
 */
public class Cut extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Cut(){
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
//	 * @param platform
//	 * @param browser
//	 * @param url
//	 */
//	public Cut(String ip, String timestamp, String sd, String sid,
//			String event, String content, NodeInfo nodeInfo, 
//			String platform, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.content = content;
//		this.nodeInfo = nodeInfo;
//		this.platform = platform;
//		this.browser = browser;
//		this.url = url;
//	}
	
	/** Deserialise given JSON and creates a Cut element with the result
	 * @param serialised class in JSON
	 */
	public Cut (String json){
		this(new Gson().fromJson(json, Cut.class));
	}
	
	public Cut (Cut tempClass){
		super(tempClass);
		
		this.content = tempClass.content;
		this.nodeInfo = tempClass.nodeInfo;
		
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
	
	public static Cut parseFromHash(EventDataHashMap eventData) {

		return new Cut(eventData);
	}
	
	private Cut(EventDataHashMap eventData) {
		super(eventData);
		
		this.content = eventData.get(EventConstants.CONTENT);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

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
	 * Text content which is being cut
	 */
	private String content;
	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;
	
}
