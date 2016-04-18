package usaproxy.events;

import com.google.gson.Gson;

/**
 * Touch object. It's used by the MobileTouchStart and MObileTouchEnd events.
 * All the javadoc descriptions were taken on the 02/07/2013 from:
 * https://developer
 * .mozilla.org/en-US/docs/Web/API/Touch?redirectlocale=en-US&redirectslug
 * =DOM%2FTouch
 * 
 * @author apaolaza
 * 
 */
public class MobileTouchObject {

	/**
	 * Empty constructor
	 */
	public MobileTouchObject() {
		super();
		this.identifier = "";
		this.screenX = "";
		this.screenY = "";
		this.clientX = "";
		this.clientY = "";
		this.pageX = "";
		this.pageY = "";
		this.radiusX = "";
		this.radiusY = "";
		this.rotationAngle = "";
		this.force = "";
	}

	/**
	 * Deserialise given JSON and creates a MobileTouchObject element with the
	 * result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public MobileTouchObject(String json) {
		this(new Gson().fromJson(json, MobileTouchObject.class));

	}

	public MobileTouchObject(MobileTouchObject tempClass) {
		this.identifier = tempClass.identifier;
		this.screenX = tempClass.screenX;
		this.screenY = tempClass.screenY;
		this.clientX = tempClass.clientX;
		this.clientY = tempClass.clientY;
		this.pageX = tempClass.pageX;
		this.pageY = tempClass.pageY;
		this.radiusX = tempClass.radiusX;
		this.radiusY = tempClass.radiusY;
		this.rotationAngle = tempClass.rotationAngle;
		this.force = tempClass.force;

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
	 * Creates the class from the provided hashmap. As there may be more than
	 * one touch obejct, it also needs a parameter indicating the number of
	 * touch object it should look for.
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the
	 *            event. It is a Hashmap that has all the values stored with the
	 *            standard mapping obtained from the JavaScript.
	 * @param touchObjectIndex
	 */
	public static MobileTouchObject parseFromHash(EventDataHashMap eventData,
			int touchObjectIndex) {

		return new MobileTouchObject(eventData, touchObjectIndex);

	}

	/**
	 * Creates the class from the provided hashmap. As there may be more than
	 * one touch object, it also needs a parameter indicating the number of
	 * touch object it should look for.
	 * 
	 * @param eventData
	 * @param touchObjectIndex
	 */
	private MobileTouchObject(EventDataHashMap eventData, int touchObjectIndex) {
		this.identifier = eventData.get(EventConstants.MOBILETOUCHIDENTIFIER
				+ touchObjectIndex);
		this.screenX = eventData.get(EventConstants.MOBILETOUCHSCREENX
				+ touchObjectIndex);
		this.screenY = eventData.get(EventConstants.MOBILETOUCHSCREENY
				+ touchObjectIndex);
		this.clientX = eventData.get(EventConstants.MOBILETOUCHCLIENTX
				+ touchObjectIndex);
		this.clientY = eventData.get(EventConstants.MOBILETOUCHCLIENTY
				+ touchObjectIndex);
		this.pageX = eventData.get(EventConstants.MOBILETOUCHPAGEX
				+ touchObjectIndex);
		this.pageY = eventData.get(EventConstants.MOBILETOUCHPAGEY
				+ touchObjectIndex);
		this.radiusX = eventData.get(EventConstants.MOBILETOUCHRADIUSX
				+ touchObjectIndex);
		this.radiusY = eventData.get(EventConstants.MOBILETOUCHRADIUSY
				+ touchObjectIndex);
		this.rotationAngle = eventData
				.get(EventConstants.MOBILETOUCHROTATIONANGLE + touchObjectIndex);
		this.force = eventData.get(EventConstants.MOBILETOUCHFORCE
				+ touchObjectIndex);
	}

	/**
	 * A unique identifier for this Touch object. A given touch (say, by a
	 * finger) will have the same identifier for the duration of its movement
	 * around the surface. This lets you ensure that you're tracking the same
	 * touch all the time.
	 */
	private String identifier;

	/**
	 * The X coordinate of the touch point relative to the left edge of the screen. 
	 */
	private String screenX;

	/**
	 * The Y coordinate of the touch point relative to the top edge of the screen
	 */
	private String screenY;

	/**
	 * The X coordinate of the touch point relative to the left edge of the browser viewport, not including any scroll offset. 
	 */
	private String clientX;

	/**
	 * The Y coordinate of the touch point relative to the top edge of the browser viewport, not including any scroll offset.
	 */
	private String clientY;

	/**
	 * The X coordinate of the touch point relative to the left edge of the document. Unlike clientX, this value includes the horizontal scroll offset, if any.
	 */
	private String pageX;

	/**
	 * The Y coordinate of the touch point relative to the top of the document. Unlike clientY, this value includes the vertical scroll offset, if any. 
	 */
	private String pageY;

	/**
	 * The X radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenX.
	 */
	private String radiusX;

	/**
	 * The Y radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenY. 
	 */
	private String radiusY;

	/**
	 * The angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface. 
	 */
	private String rotationAngle;

	/**
	 * The amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure).
	 */
	private String force;

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getScreenX() {
		return screenX;
	}

	public void setScreenX(String screenX) {
		this.screenX = screenX;
	}

	public String getScreenY() {
		return screenY;
	}

	public void setScreenY(String screenY) {
		this.screenY = screenY;
	}

	public String getClientX() {
		return clientX;
	}

	public void setClientX(String clientX) {
		this.clientX = clientX;
	}

	public String getClientY() {
		return clientY;
	}

	public void setClientY(String clientY) {
		this.clientY = clientY;
	}

	public String getPageX() {
		return pageX;
	}

	public void setPageX(String pageX) {
		this.pageX = pageX;
	}

	public String getPageY() {
		return pageY;
	}

	public void setPageY(String pageY) {
		this.pageY = pageY;
	}

	public String getRadiusX() {
		return radiusX;
	}

	public void setRadiusX(String radiusX) {
		this.radiusX = radiusX;
	}

	public String getRadiusY() {
		return radiusY;
	}

	public void setRadiusY(String radiusY) {
		this.radiusY = radiusY;
	}

	public String getRotationAngle() {
		return rotationAngle;
	}

	public void setRotationAngle(String rotationAngle) {
		this.rotationAngle = rotationAngle;
	}

	public String getForce() {
		return force;
	}

	public void setForce(String force) {
		this.force = force;
	}

}
