package usaproxy.events;


import java.util.ArrayList;

import com.google.gson.Gson;
/**
 * Event triggered when the user using a mobile device touches the screen with one or more fingers.
 * 
 */
public class MobileTouchStart extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public MobileTouchStart(){
		super();
		this.numberOfTouches = "";
		this.nodeInfo = null;
		this.isCtrlKey = "";
		this.isShiftKey = "";
		this.isAltKey = "";
		this.isMetaKey = "";
	}

	/** Deserialise given JSON and creates a MobileTouchStart element with the result
	 * @param serialised class in JSON
	 */

	public MobileTouchStart(String json){
		this(new Gson().fromJson(json, MobileTouchStart.class));

	}
	
	public MobileTouchStart (MobileTouchStart tempClass){
		super(tempClass);
		this.numberOfTouches = tempClass.numberOfTouches;
		this.nodeInfo = tempClass.nodeInfo;
		this.isCtrlKey = tempClass.isCtrlKey;
		this.isShiftKey = tempClass.isShiftKey;
		this.isAltKey = tempClass.isAltKey;
		this.isMetaKey = tempClass.isMetaKey;
		
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
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static MobileTouchStart parseFromHash(EventDataHashMap eventData) {

		return new MobileTouchStart(eventData);

	}
	
	private MobileTouchStart(EventDataHashMap eventData) {
		super(eventData);
		
		this.numberOfTouches = eventData.get(EventConstants.MOBILENUMBEROFTOUCHES);
		this.nodeInfo = NodeInfo.parseFromHash(eventData);
		this.isCtrlKey = eventData.get(EventConstants.MOBILEISCTRLKEY);
		this.isShiftKey = eventData.get(EventConstants.MOBILEISSHIFTKEY);
		this.isAltKey = eventData.get(EventConstants.MOBILEISALTKEY);
		this.isMetaKey = eventData.get(EventConstants.MOBILEISMETAKEY);
		
		this.touchList = new ArrayList<>();
		int numberOfTouchesInt = Integer.parseInt(this.numberOfTouches);
		
		for (int touchObjectIndex = 0; touchObjectIndex < numberOfTouchesInt; touchObjectIndex++){
			this.touchList.add(MobileTouchObject.parseFromHash(eventData, touchObjectIndex));
		}

	}

	/**
	 * Number of Touches in the screen at the current event
	 */
	private String numberOfTouches;

	/**
	 * Nodeinfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * True if the control key was down when the event was fired
	 */
	private String isCtrlKey;
	
	/**
	 * True if the shift key was down when the event was fired
	 */
	private String isShiftKey;

	/**
	 * True if the alt key was down when the event was fired
	 */
	private String isAltKey;

	/**
	 * True if the meta key was down when the event was fired
	 */
	private String isMetaKey;
	
	/**
	 * List of all the touches active during this event
	 */
	private ArrayList<MobileTouchObject> touchList;
	
}
