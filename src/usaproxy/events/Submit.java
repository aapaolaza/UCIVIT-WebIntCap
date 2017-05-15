package usaproxy.events;


import java.util.ArrayList;

import com.google.gson.Gson;
/**
 * Event triggered when the user moves the mouse. It's not recorded every time the mouse is moved.
 * Instead the position is checked periodically, and stored when it's different. 
 * 
 */
public class Submit extends GenericEvent{

	/**
	 * Empty constructor
	 */
	public Submit(){
		super();
		this.nodeInfo = null;
	}

//	/**
//	 * @param ip
//	 * @param timestamp
//	 * @param sd
//	 * @param sid
//	 * @param event
//	 * @param nodeInfo
//	 * @param browser
//	 * @param url
//	 */
//	public Mousemove(String ip, String timestamp, String sd, String sid,
//			String event, double coordX, double coordY, double offsetX,
//			double offsetY, MouseCoordinates mouseCoordinates,NodeInfo nodeInfo,
//			String browser, String url) {
//		
//		super( ip,  timestamp,  sd,  sid,
//				 event,  browser,  url);
//		
//		this.mouseCoordinates = mouseCoordinates;
//		this.nodeInfo = nodeInfo;
//	}


	/** Deserialise given JSON and creates a new Mousemove element with the result
	 * @param serialised class in JSON
	 */

	public Submit (String json){
		this(new Gson().fromJson(json, Submit.class));
	}
	
	public Submit (Submit tempClass){
		super(tempClass);
		
		this.nodeInfo = tempClass.nodeInfo;
		
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
	 * from variable --> nodeInfo
	 * browser --> browser
	 * url --> url
	 * 
	 * @param eventData
	 *            {@link EventDataHashMap} with all the information about the event.
	 *            It is a Hashmap that has all the values stored with the standard mapping obtained from the JavaScript.
	 * 
	 * 
	 */
	public static Submit parseFromHash(EventDataHashMap eventData) {
		
		return new Submit(eventData);
	}
	
	private Submit(EventDataHashMap eventData) {
		super(eventData);
		
		//Add the form input parsing functionality here
		this.formInputs = new ArrayList<FormValue>();
		
		String formInputString = eventData.get(EventConstants.FORMINPUTS);
		String[] formInputList = formInputString.split(";");
		
		for (int i=0; i< formInputList.length; i++){
			/* For each formInput field, split it using ":" into label and value
			 * and store it into the formInputs ArrayList
			 */
			String[] formInputItem = formInputList[i].split(":");
			if (formInputItem.length > 1){
				this.formInputs.add(new FormValue(formInputItem[0], formInputItem[1]));
			}
			//If any of the inputs is empty, we can either report it as empty or discard it completely 
			else if (formInputItem.length > 0){
				this.formInputs.add(new FormValue(formInputItem[0], ""));
			}
		}
		
		this.nodeInfo = NodeInfo.parseFromHash(eventData);
	}


	/**
	 * NodeInfo element with all the information available of the node
	 */
	private NodeInfo nodeInfo;

	/**
	 * @return the NodeInfo
	 */
	public NodeInfo getNodeInfo() {
		return nodeInfo;
	}

	/**
	 * @param nodeInfo the nodeinfo to set
	 */
	public void setNodeInfo(NodeInfo nodeInfo) {
		this.nodeInfo = nodeInfo;
	}
	
	private ArrayList<FormValue> formInputs;
	
	/**
	 * @return the formInputs
	 */
	public ArrayList<FormValue> getFormInputs() {
		return formInputs;
	}

	/**
	 * @param the formInputs to set
	 */
	public void setFormInputs(ArrayList<FormValue> formInputs) {
		this.formInputs = formInputs;
	}
	
	public class FormValue {
		private String label;
		private String value;
		
		public FormValue(String label, String value){
			this.label = label;
		    this.value = value;
		}
		
		public String getLabel(){ return label; }
		public String getValue(){ return value; }
		public void setLabel(String label){ this.label = label; }
		public void setValue(String value){ this.value = value; }
	}
}
