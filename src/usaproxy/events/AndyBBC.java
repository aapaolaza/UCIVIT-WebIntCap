package usaproxy.events;


import com.google.gson.Gson;

/**
 * Event triggered when an element in the page loses its focus 
 * 
 
 */
public class AndyBBC extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public AndyBBC(){
		super();
		this.title = "";
	}

	/**
	 * Deserialise given JSON and creates a Blur element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public AndyBBC(String json) {
		this(new Gson().fromJson(json, AndyBBC.class));

	}
	
	public AndyBBC (AndyBBC tempClass){
		super(tempClass);
		this.title = tempClass.title;
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
	 * Constructs the class getting the information from a HashMap.
	 * 
	 * The mapping of HashMap keys to variables is the following: 
	 * text log --> variable name
	 * 
	 * ip --> ip
	 * time --> timestamp
	 * sd --> sd
	 * sid --> sid
	 * event --> event
	 * from variable --> nodeInfo
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */	
	public static AndyBBC parseFromHash(EventDataHashMap eventData) {

		return new AndyBBC(eventData);
	}
	
	private AndyBBC(EventDataHashMap eventData) {
		super(eventData);
		this.title = eventData.get(EventConstants.ANDYBBCTITLE);

	}
	
	/**
	 * Title to store from the page
	 */
	private String title;
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
}
