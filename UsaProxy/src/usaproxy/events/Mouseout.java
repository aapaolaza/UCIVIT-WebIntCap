package usaproxy.events;

import com.google.gson.Gson;

/*
 * Event triggered when the mouse gets out of the hovering area of a certain element.
 */

public class Mouseout {

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param nodeId
	 * @param dom
	 * @param nodeType
	 * @param textValue
	 * @param browser
	 * @param url
	 */
	public Mouseout(String ip, String timestamp, String sd, String sid,
			String event, String nodeId, String dom, String nodeType,
			String textValue, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.nodeId = nodeId;
		this.dom = dom;
		this.nodeType = nodeType;
		this.textValue = textValue;
		this.browser = browser;
		this.url = url;
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
	 * Deserialise given JSON and loads the result into this class
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public void fromGson(String json) {
		Gson gson = new Gson();
		Mouseout tempClass = gson.fromJson(json, Mouseout.class);
		
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.nodeId = tempClass.nodeId;
		this.dom = tempClass.dom;
		this.nodeType = tempClass.nodeType;
		this.textValue = tempClass.textValue;
		this.browser = tempClass.browser;
		this.url = tempClass.url;

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
	 * ID of the hovered element
	 */
	private String nodeId;

	/*
	 * DOM location of the hovered element
	 */
	private String dom;

	/*
	 * Node type of the hovered element
	 */
	private String nodeType;

	/*
	 * Text value of the node in case it's a text node
	 */
	private String textValue;

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
	 * @param ip
	 *            the ip to set
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
	 * @param timestamp
	 *            the timestamp to set
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
	 * @param sd
	 *            the sd to set
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
	 * @param sid
	 *            the sid to set
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
	 * @param event
	 *            the event to set
	 */
	public void setEvent(String event) {
		this.event = event;
	}

	/**
	 * @return the nodeId
	 */
	public String getNodeId() {
		return nodeId;
	}

	/**
	 * @param nodeId the nodeId to set
	 */
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	/**
	 * @return the dom
	 */
	public String getDom() {
		return dom;
	}

	/**
	 * @param dom
	 *            the dom to set
	 */
	public void setDom(String dom) {
		this.dom = dom;
	}

	/**
	 * @return the nodeType
	 */
	public String getNodeType() {
		return nodeType;
	}

	/**
	 * @param nodeType
	 *            the nodeType to set
	 */
	public void setNodeType(String nodeType) {
		this.nodeType = nodeType;
	}

	/**
	 * @return the textValue
	 */
	public String getTextValue() {
		return textValue;
	}

	/**
	 * @param textValue
	 *            the textValue to set
	 */
	public void setTextValue(String textValue) {
		this.textValue = textValue;
	}

	/**
	 * @return the browser
	 */
	public String getBrowser() {
		return browser;
	}

	/**
	 * @param browser
	 *            the browser to set
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
	 * @param url
	 *            the url to set
	 */
	public void setUrl(String url) {
		this.url = url;
	}

}
