package usaproxy.events;


import com.google.gson.Gson;
/**
 * This event gets triggered when the user changes the size of the screen.
 * 
 */
public class Resize extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Resize(){
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
//	public Resize(String ip, String timestamp, String sd, String sid,
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

	/** Deserialise given JSON and creates a Resize element with the result
	 * @param serialised class in JSON
	 */

	public Resize (String json){
		this(new Gson().fromJson(json, Resize.class));
	}
	
	public Resize (Resize tempClass){
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
	
	public static Resize parseFromHash(EventDataHashMap eventData) {

		return new Resize(eventData);
	}
	
	private Resize(EventDataHashMap eventData) {
		super(eventData);
		
		this.size =  eventData.get(EventConstants.SIZE);

	}


	/**
	 * String representing the size of the new screen (in the format 1440x900)
	 */
	private String size;

}
