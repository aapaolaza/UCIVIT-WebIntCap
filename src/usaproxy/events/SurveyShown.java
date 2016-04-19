package usaproxy.events;


import com.google.gson.Gson;

/**
 * Event triggered when an element in the page loses its focus 
 * 
 
 */
public class SurveyShown extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public SurveyShown(){
		super();
		this.surveyState = "";
	}

	/**
	 * Deserialise given JSON and creates a Blur element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public SurveyShown(String json) {
		this(new Gson().fromJson(json, SurveyShown.class));

	}
	
	public SurveyShown (SurveyShown tempClass){
		super(tempClass);
		this.surveyState = tempClass.surveyState;
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
	public static SurveyShown parseFromHash(EventDataHashMap eventData) {

		return new SurveyShown(eventData);
	}
	
	private SurveyShown(EventDataHashMap eventData) {
		super(eventData);
		this.surveyState = eventData.get(EventConstants.SURVEYSTATE);

	}
	
	/**
	 * Title to store from the page
	 */
	private String surveyState;

	public String getSurveyState() {
		return surveyState;
	}

	public void setSurveyState(String surveyState) {
		this.surveyState = surveyState;
	}

}
