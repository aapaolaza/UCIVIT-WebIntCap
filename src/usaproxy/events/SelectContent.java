package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event that collects the selection of text or html content by the user.
 * 
 */
public class SelectContent extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public SelectContent(){
		super();

		this.selectionTool = "";
		this.nodeInfo = null;
		this.selectedContent = "";
		
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param selectionTool
//	 * @param nodeInfo
//	 * @param selectedContent
//	 * @param browser
//	 * @param url
//	 */
//	public SelectContent(String ip, String timestamp, String sd, String sid,
//			String event, String selectionTool,	NodeInfo nodeInfo, 
//			String selectedContent, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.selectionTool = selectionTool;
//		this.nodeInfo = nodeInfo;
//		this.selectedContent = selectedContent;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */
	
	public SelectContent (String json){
		this(new Gson().fromJson(json, SelectContent.class));
	}
	
	public SelectContent (SelectContent tempClass){
		super(tempClass);
		
		this.selectionTool = tempClass.selectionTool;
		this.nodeInfo = tempClass.nodeInfo;
		this.selectedContent = tempClass.selectedContent;
		
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
	 * text log --> variable name
	 * 
	 * from variable --> ip
	 * time --> timestamp
	 * sd --> sd
	 * sid --> sid
	 * event --> event
	 * selectionTool -->selectionTool
	 * from variable --> nodeInfo
	 * selectedContent --> selectedContent
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	
	public static SelectContent parseFromHash(EventDataHashMap eventData) {
		return new SelectContent(eventData);
	}
	
	private SelectContent(EventDataHashMap eventData) {
		super(eventData);
		
		this.selectionTool = eventData.get(EventConstants.SELECTIONTOOL);

		this.nodeInfo = NodeInfo.parseFromHash(eventData);

		this.selectedContent = eventData.get(EventConstants.SELECTEDCONTENT);

	}
	
	/**
	 * Name of the tool employed for the selection of the content (at the moment only mouse).
	 * It may not be available.
	 * 
	 */
	private String selectionTool;

	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * String with the selected content.
	 * 
	 */
	private String selectedContent;

	public String getSelectionTool() {
		return selectionTool;
	}

	public void setSelectionTool(String selectionTool) {
		this.selectionTool = selectionTool;
	}

	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}

	public String getSelectedContent() {
		return selectedContent;
	}

	public void setSelectedContent(String selectedContent) {
		this.selectedContent = selectedContent;
	}

}
