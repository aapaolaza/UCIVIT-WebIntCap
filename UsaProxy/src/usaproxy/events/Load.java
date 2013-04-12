package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the page is loaded and the Javascript is loaded
 * 
 */
public class Load extends GenericEvent{
	
	/**
	 * Empty constructor
	 */
	public Load(){
		super();
		
		this.size = "";
		
	}
	
//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param size
//	 * @param browser
//	 * @param url
//	 */
//	public Load(String ip, String timestamp, String sd, String sid,
//			String event, String size, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.size = size;
//		this.browser = browser;
//		this.url = url;
//	}
	
	/** Deserialise given JSON and creates a Load element with the result
	 * @param serialised class in JSON
	 */
	
	public Load (String json){
		this(new Gson().fromJson(json, Load.class));
	}
	
	public Load (Load tempClass){
		super(tempClass);
		
		this.size = tempClass.size;
		
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
	 * size --> size
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	
	public static Load parseFromHash(EventDataHashMap eventData) {

		return new Load(eventData);
	}
	
	private Load(EventDataHashMap eventData) {
		super(eventData);
		
		this.size = eventData.get(EventConstants.SIZE);
	}

	
	/**
	 * Client's browser's window size
	 */
	private String size;
}
