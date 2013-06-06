package usaproxy.events;

import java.net.URLDecoder;
import java.util.HashMap;

import usaproxy.ErrorLogging;

/**
 * This class will provide a HashMap in which to put all the data from the
 * events, this will speed up the process of getting the relevant data for each
 * event type, preventing the continuous split of the same strings.
 */
public class EventDataHashMap {

	HashMap<String, String> dataMap;

	/**
	 * Constructor. It will take the event data as an argument, and it will
	 * parse it and store it in the HashMap.
	 * 
	 * @param String
	 *            with the unparsed event data
	 */
	public EventDataHashMap(String eventData) {
		dataMap = new HashMap<String, String>(30);

		String[] paramList = eventData.split(" ");
		// I need to split the event String using first spaces and then "="

		String[] paramItemPair;

		for (int i = 0; i < paramList.length; i++) {
			paramItemPair = paramList[i].split("=");
			// System.out.println(paramList[i]);
			// System.out.println(paramItemPair[0]);
			// System.out.println(paramItemPair[1]);
			// for each pair we will store the second element using the first
			// one as the key
			try {
				if (paramItemPair.length == 1)
					dataMap.put(paramItemPair[0], "");
				else
					dataMap.put(paramItemPair[0],  decodeValue(paramItemPair[1]));
			} catch (Exception e) {
				ErrorLogging.logCriticalError(
						"EventDataHashMap.java/EventDataHashMap()",
						"Error trying to add the following keypair to the HashMap: "
								+ paramList[i], e);
			}
		}
	}

	/**
	 * Returns the value corresponding to the given key
	 * 
	 * @param String
	 *            with the key to search for
	 * @return String with the value contained in that key space
	 */
	public String get(String key) {
		return dataMap.get(key);
	}

	/**
	 * Enters the given key and value in the HashMap
	 * 
	 * @param String
	 *            with the key of the given value
	 * @param String
	 *            with the value to be introduced in the HashMap
	 */
	public String put(String key, String value) {
		return dataMap.put(key, decodeValue(value));
	}

	/**
	 * Decodes the input, using  URLDecoder.decode()
	 * @param value
	 * @return decoded value. It will be the same as input if an error occurs.
	 */
	public String decodeValue(String value) {
		try {
			value = URLDecoder.decode(value, "UTF-8");
			return value;

		} catch (Exception e) {
			ErrorLogging.logCriticalError("EventManager.java/logEventToDB()",
					"An error occurred trying to decode the event data string. Its value is: \n"
							+ value, e);
		}
		return value;
	}

}
