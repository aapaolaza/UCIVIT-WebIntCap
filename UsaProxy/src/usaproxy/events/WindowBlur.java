package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the page is unloaded. It doesn't usually get recorded as
 * the Javascript doesn't have time to submit the event before being stopped. 
 * 
 */
public class WindowBlur extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public WindowBlur(){
		super();
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param browser
//	 * @param url
//	 */
//	public Unload(String ip, String timestamp, String sd, String sid,
//			String event, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a WindowBlur element with the result
	 * @param serialised class in JSON
	 */
	
	public WindowBlur (String json){
		this(new Gson().fromJson(json, WindowBlur.class));
	}
	
	public WindowBlur (WindowBlur tempClass){
		super(tempClass);
		
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
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	
	public static WindowBlur parseFromHash(EventDataHashMap eventData) {

		return new WindowBlur(eventData);
	}
	
	private WindowBlur(EventDataHashMap eventData) {
		super(eventData);

	}

}
