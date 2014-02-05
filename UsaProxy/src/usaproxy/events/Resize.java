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
		this.resolution = "";
		this.htmlSize = "";
		this.usableSize = "";
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
		this.resolution = tempClass.resolution;
		this.htmlSize = tempClass.htmlSize;
		this.usableSize = tempClass.usableSize;
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

		this.resolution = eventData.get(EventConstants.RESOLUTION);

		this.htmlSize = eventData.get(EventConstants.HTMLSIZE);

		this.usableSize = eventData.get(EventConstants.USABLESIZE);
	}


	/**
	 * String representing the size of the new screen (in the format 1440x900)
	 */
	private String size;

	/**
	 * Client's screen resolution
	 */
	private String resolution;

	/**
	 * Size of the HTML page
	 */
	private String htmlSize;
	
	/**
	 * Client's viewport size obtained with jQuery. More precise, takes into
	 * account the space taken by elements such as scrollbars
	 */
	private String usableSize;

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getResolution() {
		return resolution;
	}

	public void setResolution(String resolution) {
		this.resolution = resolution;
	}

	public String getHtmlSize() {
		return htmlSize;
	}

	public void setHtmlSize(String htmlSize) {
		this.htmlSize = htmlSize;
	}

	public String getUsableSize() {
		return usableSize;
	}

	public void setUsableSize(String usableSize) {
		this.usableSize = usableSize;
	}

}
