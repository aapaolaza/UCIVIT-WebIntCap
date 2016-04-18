package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the user copies text from a text area.
 * It captures the copied text. 
 * 
 */
public class Copy extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Copy(){
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
//	public Copy(String ip, String timestamp, String sd, String sid,
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
	
	/** Deserialise given JSON and creates a Copy element with the result
	 * @param serialised class in JSON
	 */
	public Copy (String json){
		this(new Gson().fromJson(json, Copy.class));
	}
	
	public Copy (Copy tempClass){
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
	public static Copy parseFromHash(EventDataHashMap eventData) {

		return new Copy(eventData);
	}
	
	private Copy(EventDataHashMap eventData) {
		super(eventData);
		
		this.content = eventData.get(EventConstants.CONTENT);
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);

	}

	/**
	 * Text content which is being copied
	 */
	private String content;
	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}
}
