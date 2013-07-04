package usaproxy.events;

import com.google.gson.Gson;

/**
 * Event triggered when the device has changed its physical orientation. Mainly used to detect portrait vs landscape
 * https://developer.mozilla.org/en-US/docs/Web/Reference/Events/orientationchange
 * 
 */
public class MobileOrientationChange extends GenericEvent {

	/**
	 * Empty constructor
	 */
	public MobileOrientationChange() {
		super();
		this.orientation = "";
		this.orientationRaw = "";
	}

	/**
	 * Deserialise given JSON and creates a MobileOrientationChange element with the
	 * result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public MobileOrientationChange(String json) {
		this(new Gson().fromJson(json, MobileOrientationChange.class));

	}

	public MobileOrientationChange(MobileOrientationChange tempClass) {
		super(tempClass);
		this.orientation = tempClass.orientation;
		this.orientationRaw = tempClass.orientationRaw;

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
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the
	 *            event. It is a Hashmap that has all the values stored with the
	 *            standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static MobileOrientationChange parseFromHash(EventDataHashMap eventData) {

		return new MobileOrientationChange(eventData);

	}

	private MobileOrientationChange(EventDataHashMap eventData) {
		super(eventData);

		this.orientation = eventData.get(EventConstants.MOBILEORIENTATION);
		this.orientationRaw = eventData.get(EventConstants.MOBILEORIENTATIONRAW);
	}

	/**
	 * Describes the orientation of the screen in portrait, or landscape
	 */
	private String orientation;

	/**
	 * Raw value of the orientation value
	 */
	private String orientationRaw;

}
