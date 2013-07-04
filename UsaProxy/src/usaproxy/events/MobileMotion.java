package usaproxy.events;

import com.google.gson.Gson;

/**
 * Event is fired at a regular interval and indicates the amount of physical
 * motion of the device that has occurred during this interval
 * https://developer.mozilla.org/en-US/docs/Web/Reference/Events/devicemotion
 * 
 */
public class MobileMotion extends GenericEvent {

	/**
	 * Empty constructor
	 */
	public MobileMotion() {
		super();
		this.accelX = "";
		this.accelY = "";
		this.accelZ = "";
		this.maxAccel = "";
		this.maxAccelInclGrav = "";
	}

	/**
	 * Deserialise given JSON and creates a MobileMotion element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public MobileMotion(String json) {
		this(new Gson().fromJson(json, MobileMotion.class));

	}

	public MobileMotion(MobileMotion tempClass) {
		super(tempClass);

		this.accelX = tempClass.accelX;
		this.accelY = tempClass.accelY;
		this.accelZ = tempClass.accelZ;
		this.maxAccel = tempClass.maxAccel;
		this.maxAccelInclGrav = tempClass.maxAccelInclGrav;

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
	public static MobileMotion parseFromHash(EventDataHashMap eventData) {

		return new MobileMotion(eventData);

	}

	private MobileMotion(EventDataHashMap eventData) {
		super(eventData);

		this.accelX = eventData.get(EventConstants.MOBILEMOTIONACCELX);
		this.accelY = eventData.get(EventConstants.MOBILEMOTIONACCELY);
		this.accelZ = eventData.get(EventConstants.MOBILEMOTIONACCELZ);
		this.maxAccel = eventData.get(EventConstants.MOBILEMOTIONACCELMAX);
		this.maxAccelInclGrav = eventData
				.get(EventConstants.MOBILEMOTIONACCELMAXINCLGRAV);

	}

	/**
	 * device acceleration along the X axis
	 */
	private String accelX;

	/**
	 * device acceleration along the Y axis
	 */
	private String accelY;

	/**
	 * device acceleration along the Z axis
	 */
	private String accelZ;

	/**
	 * maximum acceleration among the three dimensions
	 */
	private String maxAccel;

	/**
	 * maximum acceleration among the three dimensions plus gravity It may be
	 * the only value available on devices that don't have a gyroscope to allow
	 * them to properly remove gravity from the data. Read only.
	 */
	private String maxAccelInclGrav;

}
