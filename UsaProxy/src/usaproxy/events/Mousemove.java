package usaproxy.events;

import com.google.gson.Gson;
/*
 * Event triggered when the user moves the mouse. It's not recorded every time the mouse is moved.
 * Instead the position is checked periodically, and stored when it's different. 
 * 
 */
public class Mousemove {

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param coordX
	 * @param coordY
	 * @param offsetX
	 * @param offsetY
	 * @param nodeInfo
	 * @param browser
	 * @param url
	 */
	public Mousemove(String ip, String timestamp, String sd, String sid,
			String event, double coordX, double coordY, double offsetX,
			double offsetY, NodeInfo nodeInfo,
			String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.coordX = coordX;
		this.coordY = coordY;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.nodeInfo = nodeInfo;
		this.browser = browser;
		this.url = url;
	}
	

	/** Deserialise given JSON and creates a new Mousemove element with the result
	 * @param serialised class in JSON
	 */

	public Mousemove(String json){
		Gson gson = new Gson();
		Mousemove tempClass = gson.fromJson(json, Mousemove.class);
		
		this.coordX = tempClass.coordX;
		this.coordY = tempClass.coordY;
		this.offsetX = tempClass.offsetX;
		this.offsetY = tempClass.offsetY;
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
	 * Location of the mouse in the X axis
	 */
	private double coordX;
	/*
	 * Location of the mouse in the Y axis
	 */
	private double coordY;
	
	/*
	 * Location of the mouse with respect to the hovered element in the X axis
	 */
	private double offsetX;
	
	/*
	 * Location of the mouse with respect to the hovered element in the Y axis
	 */
	private double offsetY;
	/*
	 * NodeInfo element with all the information available of the node
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
	 * @return the coordX
	 */
	public double getCoordX() {
		return coordX;
	}

	/**
	 * @param coordX the coordX to set
	 */
	public void setCoordX(double coordX) {
		this.coordX = coordX;
	}

	/**
	 * @return the coordY
	 */
	public double getCoordY() {
		return coordY;
	}

	/**
	 * @param coordY the coordY to set
	 */
	public void setCoordY(double coordY) {
		this.coordY = coordY;
	}

	/**
	 * @return the offsetX
	 */
	public double getOffsetX() {
		return offsetX;
	}

	/**
	 * @param offsetX the offsetX to set
	 */
	public void setOffsetX(double offsetX) {
		this.offsetX = offsetX;
	}

	/**
	 * @return the offsetY
	 */
	public double getOffsetY() {
		return offsetY;
	}

	/**
	 * @param offsetY the offsetY to set
	 */
	public void setOffsetY(double offsetY) {
		this.offsetY = offsetY;
	}
	
	/**
	 * @return the NodeInfo
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
