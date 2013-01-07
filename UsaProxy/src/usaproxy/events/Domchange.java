package usaproxy.events;

import com.google.gson.Gson;
/*
 * Event triggered when a DOM change is recorded, the content of the DOM change is stored to a text file.
 * The text file is stored in a folder with the name of the sid, and timestamped with this same timestamp
 * 
 * The mapping of text logs to variables is the following: 
 * text log --> variable name
 * 
 * from variable --> ip
 * time --> timestamp
 * sd --> sd
 * sid --> sid
 * event --> event
 * numberofchanges --> numberOfChanges
 */
public class Domchange {

	/**
	 * @param ip
	 * @param timestamp
	 * @param sd
	 * @param sid
	 * @param event
	 * @param numberOfChanges
	 */
	public Domchange(String ip, String timestamp, String sd, String sid,
			String event, Integer numberOfChanges) {
		super();
		this.ip = ip;
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.event = event;
		this.numberOfChanges = numberOfChanges;
	}
	
	/** Deserialise given JSON and creates a Domchange element with the result
	 * @param serialised class in JSON
	 */

	public Domchange(String json){
		Gson gson = new Gson();
		Domchange tempClass = gson.fromJson(json, Domchange.class);
		
		this.ip = tempClass.ip;
		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.event = tempClass.event;
		this.numberOfChanges = tempClass.numberOfChanges;
		
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
	 * Number of changes since the last DOM change
	 */
	private Integer numberOfChanges;
	

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
	 * @return the numberOfChanges
	 */
	public Integer getNumberOfChanges() {
		return numberOfChanges;
	}

	/**
	 * @param numberOfChanges the numberOfChanges to set
	 */
	public void setNumberOfChanges(Integer numberOfChanges) {
		this.numberOfChanges = numberOfChanges;
	}
}
