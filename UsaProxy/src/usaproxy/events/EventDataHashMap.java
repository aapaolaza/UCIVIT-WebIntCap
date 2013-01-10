package usaproxy.events;

import java.util.HashMap;

/**
 * This class will provide a HashMap in which to put all the data from the events,
 * this will speed up the process of getting the relevant data for each event type,
 * preventing the continuous split of the same strings. 
 */
public class EventDataHashMap {
	
	HashMap<String, String> dataMap;
	
	/**
	 * Constructor. It will take the event data as an argument, and it will parse it and store
	 * it in the HashMap.
	 * @param String with the unparsed event data
	 */
	public EventDataHashMap(String eventData){
		dataMap = new HashMap<String, String>(30);
		
		String[] paramList = eventData.split(" ");
		// I need to split the event String using first spaces and then "="
System.out.println(eventData);
		String[] paramItemPair;
		System.out.println("EventDataHashMap: initializing HashMap with the following number of elements:" +paramList.length);
		for (int i = 0; i < paramList.length; i++) {
			paramItemPair = paramList[i].split("=");
			System.out.println(paramList[i]);
			System.out.println(paramItemPair[0]);
			System.out.println(paramItemPair[1]);
			//for each pair we will store the second element using the first one as the key
			
			dataMap.put(paramItemPair[0], paramItemPair[1]);
		}
	}
	
	/**
	 * Returns the value corresponding to the given key
	 * @param String with the key to search for
	 * @return String with the value contained in that key space
	 */
	public String get(String key){
		return dataMap.get(key);
	}
	
	/**
	 * Enters the given key and value in the HashMap
	 * @param String with the key of the given value
	 * @param String with the value to be introduced in the HashMap
	 */
	public String put(String key, String value){
		return dataMap.put(key, value);
	}	

}
