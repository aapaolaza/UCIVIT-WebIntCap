package usaproxy.events;

import com.google.gson.Gson;
/*
 * The system periodically checks the scroll state of the browser.
 * If there is a difference, it records either the x or y measure.
 * 
 * The mapping of text logs to variables is the following: 
 * text log --> variable name
 * 
 * from variable --> ip
 * time --> timestamp
 * sd --> sd
 * sid --> sid
 * event --> event
 * x --> scrollX
 * y --> scrollY
 * browser --> browser
 * url --> url
 */

public class Scroll {

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param scrollX
	 * @param scrollY
	 * @param browser
	 * @param url
	 */
	public Scroll(String ip, String timestamp, String sd, String sid,
			String event, Float scrollX, Float scrollY, String browser, String url) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.scrollX = scrollX;
		this.scrollY = scrollY;
		this.browser = browser;
		this.url = url;
	}
	
	/** Deserialise given JSON and creates a Scroll element with the result
	 * @param serialised class in JSON
	 */

	public Scroll(String json){
		Gson gson = new Gson();
		Scroll tempClass = gson.fromJson(json, Scroll.class);
		
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.scrollX = tempClass.scrollX;
		this.scrollY = tempClass.scrollY;
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
	 * X coordinate of the scroll
	 */
	private Float scrollX;
	
	/*
	 * Y coordinate of the scroll
	 */
	private Float scrollY;
	
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
	 * @return the X scroll value
	 */
	public Float getScrollX() {
		return scrollX;
	}

	/**
	 * @param key the X scroll value to set
	 */
	public void setScrollX(Float scrollX) {
		this.scrollX = scrollX;
	}

	/**
	 * @return the Y scroll value
	 */
	public Float getScrollY() {
		return scrollY;
	}

	/**
	 * @param key the Y scroll value to set
	 */
	public void setScrollY(Float scrollY) {
		this.scrollY = scrollY;
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
