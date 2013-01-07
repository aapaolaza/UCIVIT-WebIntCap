package usaproxy.events;

import com.google.gson.Gson;

/*
 * This class will contain the information about the mouse coordinates.
 * coordX and coordY will represent the coordinates of the mouse in the screen, while 
 * offsetX and offsetY will represent the coordinates with respect to the node the event
 * is related with.
 * 
 * The mapping of text logs to variables is the following: 
 * text log --> variable name
 * 
 * coord --> coords separated by commas ("coordX, coordY")
 * offset --> offset coords separated by commas ("offsetX, offsetY")
 */
public class MouseCoordinates {
	/**
	 * @param coordX
	 * @param coordY
	 * @param offsetX
	 * @param offsetY
	 */
	public MouseCoordinates(String coordX, String coordY, String offsetX, String offsetY) {
		super();
		this.coordX = coordX;
		this.coordY = coordY;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}

	public MouseCoordinates(String json) {
		
		Gson gson = new Gson();
		MouseCoordinates tempClass = gson.fromJson(json, MouseCoordinates.class);
		this.coordX = tempClass.coordX;
		this.coordY = tempClass.coordY;
		this.offsetX = tempClass.offsetX;
		this.offsetY = tempClass.offsetY;
	}
	
	/** Serialise the class into a JSON, and returns the String containing it 
	 * @return serialised class in JSON
	 */

	public String toGson(){
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}
	
	/*
	 * Coordinates X of the mouse
	 */
	private String coordX;
	
	/*
	 * Coordinates Y of the mouse
	 */
	private String coordY;
	
	/*
	 * Offset coordinate X inside the node object of the event
	 */
	private String offsetX;
	
	/*
	 * Offset coordinate Y inside the node object of the event
	 */
	private String offsetY;

	/**
	 * @return the coordX
	 */
	public String getCoordX() {
		return coordX;
	}

	/**
	 * @param coordX the coordX to set
	 */
	public void setCoordX(String coordX) {
		this.coordX = coordX;
	}

	/**
	 * @return the coordY
	 */
	public String getCoordY() {
		return coordY;
	}

	/**
	 * @param coordY the coordY to set
	 */
	public void setCoordY(String coordY) {
		this.coordY = coordY;
	}

	/**
	 * @return the offsetX
	 */
	public String getOffsetX() {
		return offsetX;
	}

	/**
	 * @param offsetX the offsetX to set
	 */
	public void setOffsetX(String offsetX) {
		this.offsetX = offsetX;
	}

	/**
	 * @return the offsetY
	 */
	public String getOffsetY() {
		return offsetY;
	}

	/**
	 * @param offsetY the offsetY to set
	 */
	public void setOffsetY(String offsetY) {
		this.offsetY = offsetY;
	}
	
}
