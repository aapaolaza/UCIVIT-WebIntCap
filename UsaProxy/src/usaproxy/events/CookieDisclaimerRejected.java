package usaproxy.events;


import com.google.gson.Gson;
/**
 * Event triggered when the cookie disclaimer is rejected.
 * 
 */
public class CookieDisclaimerRejected extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public CookieDisclaimerRejected(){
		super();
	}

	/** Deserialise given JSON and creates a CookieDisclaimerRejected element with the result
	 * @param serialised class in JSON
	 */
	
	public CookieDisclaimerRejected (String json){
		this(new Gson().fromJson(json, CookieDisclaimerRejected.class));
	}
	
	public CookieDisclaimerRejected (CookieDisclaimerRejected tempClass){
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
	
	public static CookieDisclaimerRejected parseFromHash(EventDataHashMap eventData) {

		return new CookieDisclaimerRejected(eventData);
	}
	
	private CookieDisclaimerRejected(EventDataHashMap eventData) {
		super(eventData);
	}

}
