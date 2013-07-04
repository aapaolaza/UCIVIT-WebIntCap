package usaproxy.events;

import com.google.gson.Gson;

/**
 * Event triggered when the device has changed its physical orientation
 * https://developer.mozilla.org/en-US/docs/WebAPI/Detecting_device_orientation
 * 
 */
public class MobileGyroscope extends GenericEvent {

	/**
	 * Empty constructor
	 */
	public MobileGyroscope() {
		super();
		this.alpha = "";
		this.beta = "";
		this.gamma = "";
	}

	/**
	 * Deserialise given JSON and creates a MobileGyroscope element with the
	 * result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public MobileGyroscope(String json) {
		this(new Gson().fromJson(json, MobileGyroscope.class));

	}

	public MobileGyroscope(MobileGyroscope tempClass) {
		super(tempClass);
		this.alpha = tempClass.alpha;
		this.beta = tempClass.beta;
		this.gamma = tempClass.gamma;

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
	public static MobileGyroscope parseFromHash(EventDataHashMap eventData) {

		return new MobileGyroscope(eventData);

	}

	private MobileGyroscope(EventDataHashMap eventData) {
		super(eventData);

		this.alpha = eventData.get(EventConstants.MOBILEGYROSCOPEALPHA);
		this.beta = eventData.get(EventConstants.MOBILEGYROSCOPEBETA);
		this.gamma = eventData.get(EventConstants.MOBILEGYROSCOPEGAMMA);

	}

	/**
	 * Motion of the device around the z axis, represented in degrees with
	 * values ranging from 0 to 360
	 */
	private String alpha;

	/**
	 * Motion of the device around the x axis, represented in degrees with
	 * values ranging from -180 to 180. This represents a front to back motion
	 * of the device.
	 */
	private String beta;

	/**
	 * Motion of the device around the y axis, represented in degrees with
	 * values ranging from -90 to 90. This represents a left to right motion of
	 * the device
	 */
	private String gamma;

}
