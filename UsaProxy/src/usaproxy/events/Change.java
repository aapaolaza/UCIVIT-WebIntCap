package usaproxy.events;

import com.google.gson.Gson;
/*
 * Event triggered when the user changes the state of one of the following types of 
 * elements: select-one, select-multiple, text, textarea, file, checkbox, password or radio.
 * Its content depends on the type of element.
 * 
 *The mapping of text logs to variables is the following: 
 * text log --> variable name
 * 
 * from variable --> ip
 * time --> timestamp
 * sd --> sd
 * sid --> sid
 * event --> event
 * type --> type
 * checked --> checked
 * from variable --> nodeInfo
 * value --> value
 * selected --> selected
 * browser --> browser
 * url --> url

 */
public class Change {
	

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param type
	 * @param checked //in case of checkbox
	 * @param nodeInfo
	 * @param value //in case of text or file field and selection menus
	 * @param selected //in case of single selection menus
	 * @param browser
	 * @param url
	 */
	public Change(String ip, String timestamp, String sd, String sid,
			String event, String button, MouseCoordinates mouseCoordinates, NodeInfo nodeInfo,
			String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.button = button;
		this.mouseCoordinates = mouseCoordinates;
		this.nodeInfo = nodeInfo;
		this.browser = browser;
		this.url = url;
	}
	
	/** Deserialise given JSON and creates a Mousedown element with the result
	 * @param serialised class in JSON
	 */

	public Change(String json){
		Gson gson = new Gson();
		Change tempClass = gson.fromJson(json, Change.class);
		
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.button = tempClass.button;
		this.mouseCoordinates = tempClass.mouseCoordinates;
		this.nodeInfo = tempClass.nodeInfo;
		this.browser = tempClass.browser;
		this.url = tempClass.url;
		
	}

	/** Serialise the class into a JSON, and returns the String containing it 
	 * @return serialised class in JSON
	 */

	public String toGson(){
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}
	
	/*
	 * User's IP
	 */
	private String ip;
	
	/*
	 * Timestamp of the event
	 */
	private String timestamp;

	/*
	 * Id of the website
	 */
	private String sd;
	
	/*
	 * User's ID
	 */
	private String sid;

	/*
	 * Event's name
	 */
	private String event;
	
	/*
	 * Which button was pressed (l for left, r for right and m for middle)
	 */
	private String button;
	/*
	 * MouseCoordinates element with all the information available of the mouse coordinates
	 */
	private MouseCoordinates mouseCoordinates;
	/*
	 * Nodeinfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;
	
	/*
	 * Name of the browser
	 */
	private String browser;
	
	/*
	 * URL where the event happened
	 */
	private String url;

	/**
	 * @return the ip
	 */
	public String getIp() {
		return ip;
	}

	/**
	 * @param ip the ip to set
	 */
	public void setIp(String ip) {
		this.ip = ip;
	}

	/**
	 * @return the timestamp
	 */
	public String getTimestamp() {
		return timestamp;
	}

	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	/**
	 * @return the sd
	 */
	public String getSd() {
		return sd;
	}

	/**
	 * @param sd the sd to set
	 */
	public void setSd(String sd) {
		this.sd = sd;
	}

	/**
	 * @return the sid
	 */
	public String getSid() {
		return sid;
	}

	/**
	 * @param sid the sid to set
	 */
	public void setSid(String sid) {
		this.sid = sid;
	}

	/**
	 * @return the event
	 */
	public String getEvent() {
		return event;
	}

	/**
	 * @param event the event to set
	 */
	public void setEvent(String event) {
		this.event = event;
	}

	/**
	 * @return the button
	 */
	public String getButton() {
		return button;
	}

	/**
	 * @param button the button to set
	 */
	public void setButton(String button) {
		this.button = button;
	}
	/**
	 * @return the nodeInfo
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

	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return browser;
	}

	/**
	 * @param browser the browser to set
	 */
	public void setBrowser(String browser) {
		this.browser = browser;
	}

	/**
	 * @return the url
	 */
	public String getUrl() {
		return url;
	}

	/**
	 * @param url the url to set
	 */
	public void setUrl(String url) {
		this.url = url;
	}			

	
}
