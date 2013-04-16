package usaproxy.events;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;
/**
 * Event triggered when a DOM change is recorded, the content of the DOM change is stored to a text file.
 * The text file is stored in a folder with the name of the sid, and timestamped with this same timestamp
 * 
 */
public class Domchange extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Domchange(){
		super();
		this.numberOfChanges = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param numberOfChanges
// 	 * @param platform
//	 * @param browser
//	 * @param url
//	 */
//	public Domchange(String ip, String timestamp, String sd, String sid,
//			String event, Integer numberOfChanges, String platform, 
//			String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.numberOfChanges = numberOfChanges;
//		this.platform = platform;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Domchange element with the result
	 * @param serialised class in JSON
	 */
	
	public Domchange (String json){
		this(new Gson().fromJson(json, Domchange.class));
	}
	
	public Domchange (Domchange tempClass){
		super(tempClass);

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
	 * numberofchanges --> numberOfChanges
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	
	public static Domchange parseFromHash(EventDataHashMap eventData) {

		return new Domchange(eventData);
	}
	
	private Domchange(EventDataHashMap eventData) {
		super(eventData);
		try{
			this.numberOfChanges = Integer.parseInt(eventData.get(EventConstants.NUMBEROFCHANGES));
		}
		catch(Exception e){
			ErrorLogging.logCriticalError("Domchange.java/parseDomchangeObject", 
					"Error parsing the number of changes", e);
		}

	}

	/**
	 * Number of changes since the last DOM change
	 */
	private Integer numberOfChanges;
}
