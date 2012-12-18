package usaproxy.events;

import com.google.gson.Gson;
/*
 * Event triggered when the user release the  mouse button. It records which button was pressed.
 * Together with mousedown it represents the whole cycle of a click action, being mouseup the 
 * end. 
 * 
 */
public class Mouseup {
	

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param button
	 * @param nodeInfo
	 * @param browser
	 * @param url
	 */
	public Mouseup(String ip, String timestamp, String sd, String sid,
			String event, String button, NodeInfo nodeInfo, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.button = button;
		this.nodeInfo = nodeInfo;
		this.browser = browser;
		this.url = url;
	}
	
	/** Deserialise given JSON and creates a Mouseup element with the result
	 * @param serialised class in JSON
	 */

	public Mouseup(String json){
		Gson gson = new Gson();
		Mouseup tempClass = gson.fromJson(json, Mouseup.class);
		
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.button = tempClass.button;
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
	 * Nodeinfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/*
	 * Name of the browser
	 */
	private String browser;
	
	/*
	 * URL wheree the event happened
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
