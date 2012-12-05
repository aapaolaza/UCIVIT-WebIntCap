package usaproxy.domchanges;


import java.util.ArrayList;

import com.google.gson.Gson;

/**
 * A list of elements with the data structure representing an element containing the necessary actions to perform
 * to transform the previous DOM into the current one. There are two possibilities: INSERT and DELETE 
 * (INSERT, “charIndexStart”, “insertionText”)
 * (DELETE, “charIndexStart”, “charIndexEnd”)
 * The second parameter "charIndexEndORinsertionText" will contain the charIndexEnd in the case of DELETE
 * and the insertionText in the case of INSERT
 * It also provides serialization and deserialization functionality via GSON library (https://code.google.com/p/google-gson/)
 */
public class DOMChangesLogList{

	public ArrayList<DOMChangeLogElement> list = new ArrayList<DOMChangeLogElement>();

	public String clientIP; 
	public String time;
	public String sd;
	public String sid;

	/**
	 * Adds the necessary context information to the  DOM change list element
	 * @param clientIP, the IP of the client being observed
	 * @param time, the timestamp
	 * @param sd, web page identifier
	 * @param sid, session identifier
	 */
	public void setContextInfo (String clientIP, String time, String sd, String sid){
		this.clientIP = clientIP; 
		this.time = time;
		this.sd = sd;
		this.sid = sid;
	}
	
	
	/**
	 * The data structure representing an element containing the necessary actions to perform
	 * to transform the previous DOM into the current one. There are two possibilities: INSERT and DELETE 
	 * (INSERT, “charIndexStart”, “insertionText”)
	 * (DELETE, “charIndexStart”, “charIndexEnd”)
	 * The second parameter "charIndexEndORinsertionText" will contain the charIndexEnd in the case of DELETE
	 * and the insertionText in the case of INSERT
	 */
	class DOMChangeLogElement {
		private String operation;
		private String charIndexStart;
		private String charIndexEndORinsertionText;

		/** Constructor: creates a n element describing one DOM change operation 
		 * 
		 * @param Operation is the operation to store (INSERT or DELETE)
		 * @param charIndexStart indicates the index where the change starts
		 * @param charIndexEndORinsertionText can be one of these two values: the index where the change ends in the case of DELETE
		 * or the insertionText in the case of INSERT
		 */
		DOMChangeLogElement(String operation, String charIndexStart, String charIndexEndORinsertionText) {
			this.operation = operation;
			this.charIndexStart = charIndexStart;
			this.charIndexEndORinsertionText = charIndexEndORinsertionText;
		}
		public String getOperation() {
			return operation;
		}

		public void setOperation(String operation) {
			this.operation = operation;
		}

		public int getCharIndexStart() {
			try{
				return Integer.parseInt(charIndexStart);
			}catch (Exception e){
				return -1;
			}
		}

		public void setCharIndexStart(String charIndexStart) {
			this.charIndexStart = charIndexStart;
		}

		public int getCharIndexEnd() {
			try{
				return Integer.parseInt(charIndexEndORinsertionText);
			}catch (Exception e){
				//in case "charIndexEndORinsertionText" is a string and not a number 
				return -1;
			}
		}

		public String getInsertionText() {

			return charIndexEndORinsertionText;
		}

		public void setCharIndexEndORinsertionText(String charIndexEndORinsertionText) {
			this.charIndexEndORinsertionText = charIndexEndORinsertionText;
		}

		public String printInfo(){
			return (this.operation + "," + this.charIndexStart + "," + this.charIndexEndORinsertionText);
		}


	}

	public void addDOMChangeElement (String operation, String charIndexStart, String charIndexEndORinsertionText){
		list.add(new DOMChangeLogElement(operation, charIndexStart, charIndexEndORinsertionText));
	}

	/** Serialise the class into a JSON, and returns the String containing it 
	 * @return serialised class in JSON
	 */

	public String toGson(){
		Gson gson = new Gson();
		String json = gson.toJson(this);
		return json;
	}
 
	/** Deserialise given JSON and assigns the resulting class list to "domChangesLogList"
	 * @param serialised class in JSON
	 */

	public void fromGson(String json){
		Gson gson = new Gson();
		System.out.println(json);
		this.list = gson.fromJson(json, DOMChangesLogList.class).list;
		System.out.println("Deserializing from json this many elements: "+ this.list.size());
	}

}