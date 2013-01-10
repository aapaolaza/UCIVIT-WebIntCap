package usaproxy.events;

import usaproxy.ErrorLogging;

import com.google.gson.Gson;

/**
 * This class will contain the information about the mouse coordinates.
 * coordX and coordY will represent the coordinates of the mouse in the screen, while 
 * offsetX and offsetY will represent the coordinates with respect to the node the event
 * is related with.
 * 
 */
public class MouseCoordinates {

	/*
	 * Empty constructor
	 */
	public MouseCoordinates() {
		super();
		this.coordX = null;
		this.coordX = null;
		this.offsetX = null;
		this.offsetY = null;
	}

	/**
	 * @param coordX
	 * @param coordY
	 * @param offsetX
	 * @param offsetY
	 */
	public MouseCoordinates(Integer coordX, Integer coordY, Integer offsetX,
			Integer offsetY) {
		super();
		this.coordX = coordX;
		this.coordY = coordY;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}

	public MouseCoordinates(String json) {

		Gson gson = new Gson();
		MouseCoordinates tempClass = gson
				.fromJson(json, MouseCoordinates.class);
		this.coordX = tempClass.coordX;
		this.coordY = tempClass.coordY;
		this.offsetX = tempClass.offsetX;
		this.offsetY = tempClass.offsetY;
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
	 *  text log --> variable name
	 * 
	 * coord --> coords separated by commas ("coordX, coordY") 
	 * offset --> offset coords separated by commas ("offsetX, offsetY")
	 * 
	 * @param mouseCoordData
	 *            {@link EventDataHashMap} with all the information about the mouse coordinates.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static MouseCoordinates parseFromHash(EventDataHashMap mouseCoordData) {

		MouseCoordinates classObject = new MouseCoordinates();

		String[] coordPair;
		coordPair = mouseCoordData.get(EventConstants.MOUSECOORD).split(",");

		try {
			classObject.coordX = Integer.parseInt(coordPair[0]);
			classObject.coordY = Integer.parseInt(coordPair[1]);
		} catch (Exception e) {
			ErrorLogging
			.logError(
					"MouseCoordinates.java/parseNodeInfoObject",
					"There was an error while parsing the coordinates to Integer",
					e);
		}

		coordPair = mouseCoordData.get(EventConstants.MOUSEOFFSET).split(",");

		try {
			classObject.offsetX = Integer.parseInt(coordPair[0]);
			classObject.offsetY = Integer.parseInt(coordPair[1]);
		} catch (Exception e) {
			ErrorLogging
			.logError(
					"MouseCoordinates.java/parseNodeInfoObject",
					"There was an error while parsing the offset coordinates to Integer",
					e);
		}

	return classObject;
}

/*
 * Coordinates X of the mouse
 */
private Integer coordX;

/*
 * Coordinates Y of the mouse
 */
private Integer coordY;

/*
 * Offset coordinate X inside the node object of the event
 */
private Integer offsetX;

/*
 * Offset coordinate Y inside the node object of the event
 */
private Integer offsetY;

/**
 * @return the coordX
 */
public Integer getCoordX() {
	return coordX;
}

/**
 * @param coordX
 *            the coordX to set
 */
public void setCoordX(Integer coordX) {
	this.coordX = coordX;
}

/**
 * @return the coordY
 */
public Integer getCoordY() {
	return coordY;
}

/**
 * @param coordY
 *            the coordY to set
 */
public void setCoordY(Integer coordY) {
	this.coordY = coordY;
}

/**
 * @return the offsetX
 */
public Integer getOffsetX() {
	return offsetX;
}

/**
 * @param offsetX
 *            the offsetX to set
 */
public void setOffsetX(Integer offsetX) {
	this.offsetX = offsetX;
}

/**
 * @return the offsetY
 */
public Integer getOffsetY() {
	return offsetY;
}

/**
 * @param offsetY
 *            the offsetY to set
 */
public void setOffsetY(Integer offsetY) {
	this.offsetY = offsetY;
}

}
