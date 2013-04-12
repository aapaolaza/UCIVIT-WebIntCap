package usaproxy.events;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;
/**
 * The system periodically checks the scroll state of the browser.
 * If there is a difference, it records either the x or y measure.
 * 
 */

public class Scroll extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Scroll(){
		super();
		this.scrollX = null;
		this.scrollY = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param scrollX
//	 * @param scrollY
//	 * @param browser
//	 * @param url
//	 */
//	public Scroll(String ip, String timestamp, String sd, String sid,
//			String event, Float scrollX, Float scrollY, String browser, String url) {
//		super();
//		this.ip = ip;
//		this.timestamp = timestamp;
//		this.sd = sd;
//		this.sid = sid;
//		this.event = event;
//		this.scrollX = scrollX;
//		this.scrollY = scrollY;
//		this.browser = browser;
//		this.url = url;
//	}

	/** Deserialise given JSON and creates a Scroll element with the result
	 * @param serialised class in JSON
	 */
	
	public Scroll (String json){
		this(new Gson().fromJson(json, Scroll.class));
	}
	
	public Scroll (Scroll tempClass){
		super(tempClass);
		
		this.scrollX = tempClass.scrollX;
		this.scrollY = tempClass.scrollY;
		
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
	 * scrollx --> scrollX
	 * scrolly --> scrollY
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */

	public static Scroll parseFromHash(EventDataHashMap eventData) {

		return new Scroll(eventData);
	}
	
	private Scroll(EventDataHashMap eventData) {
		super(eventData);
		
		//This is a special case, only one of scrollX or scrollY will be different than null
		//if both are, or if one of them triggers an error without being null, then we record an error
		if (eventData.get(EventConstants.SCROLLX)==null && eventData.get(EventConstants.SCROLLY)==null)
		{
			ErrorLogging.logError("Scroll.java/parseScrollObject", 
					"Omitted the parsing of scrollX and scrollY values, both were null", null);
		}
		else{

			try{
				this.scrollX = Float.parseFloat(eventData.get(EventConstants.SCROLLX));
			}
			catch(Exception e){
				//we only log an error if the reading was not null (it was something unexpected)
				if (eventData.get(EventConstants.SCROLLX)!=null)
					ErrorLogging.logError("Scroll.java/parseScrollObject", 
							"Error parsing the scrollX value", e);
			}

			try{
				this.scrollY = Float.parseFloat(eventData.get(EventConstants.SCROLLY));
			}
			catch(Exception e){
				//we only log an error if the reading was not null (it was something unexpected)
				if (eventData.get(EventConstants.SCROLLY)!=null)
					ErrorLogging.logError("Scroll.java/parseScrollObject", 
							"Error parsing the scrollY value", e);
			}
		}


	}


	/**
	 * Percentage of scroll in the X axis
	 */
	private Float scrollX;

	/**
	 * Percentage of scroll in the Y axis
	 */
	private Float scrollY;
	
}
