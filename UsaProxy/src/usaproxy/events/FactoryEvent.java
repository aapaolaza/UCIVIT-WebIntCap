package usaproxy.events;

import com.mongodb.DBObject;

import usaproxy.ErrorLogging;

/**
 * This class will serve as an interface to the rest of events.
 * Its functions will discern what event class should be called
 * to then call the approppiate class' function
 * 
 */
public class FactoryEvent {

	/**
	 * Obtains a Json serialising the event data contained in a HashMap.
	 * In order to do that it will discern the kind of event that's stored
	 * in the HashMap and will call the correspondent class' serializing method. 
	 * 
	 * @param eventHashMap
	 *          {@link EventDataHashMap} with all the information about the event
	 * @return String with the event data serialized in a Json
	 * 
	 */
	
	public static String getJsonFromEventHashMap(EventDataHashMap eventHashMap){
		String jsonObject = "";
		
		switch (eventHashMap.get(EventConstants.EVENTNAME)) {
			case "blur":
				jsonObject = Blur.parseFromHash(eventHashMap).toGson();
				break;
			case "change":
				jsonObject = Change.parseFromHash(eventHashMap).toGson();
				break;
			case "contextmenu":
				jsonObject = Contextmenu.parseFromHash(eventHashMap).toGson();
				break;
			case "copy":
				jsonObject = Copy.parseFromHash(eventHashMap).toGson();
				break;
			case "cut":
				jsonObject = Cut.parseFromHash(eventHashMap).toGson();
				break;
			case "dblclick":
				jsonObject = Dblclick.parseFromHash(eventHashMap).toGson();
				break;
			case "domchange":
				jsonObject = Domchange.parseFromHash(eventHashMap).toGson();
				break;
			case "focus":
				jsonObject = Focus.parseFromHash(eventHashMap).toGson();
				break;
			case "keydown":
				jsonObject = Keydown.parseFromHash(eventHashMap).toGson();
				break;
			case "keypress":
				jsonObject = Keypress.parseFromHash(eventHashMap).toGson();
				break;
			case "keyup":
				jsonObject = Keyup.parseFromHash(eventHashMap).toGson();
				break;
			case "load":
				jsonObject = Load.parseFromHash(eventHashMap).toGson();
				break;
			case "mousedown":
				jsonObject = Mousedown.parseFromHash(eventHashMap).toGson();
				break;
			case "mousemove":
				jsonObject = Mousemove.parseFromHash(eventHashMap).toGson();
				break;
			case "mouseout":
				jsonObject = Mouseout.parseFromHash(eventHashMap).toGson();
				break;
			case "mouseover":
				jsonObject = Mouseover.parseFromHash(eventHashMap).toGson();
				break;
			case "mouseup":
				jsonObject = Mouseup.parseFromHash(eventHashMap).toGson();
				break;
			case "mousewheel":
				jsonObject = Mousewheel.parseFromHash(eventHashMap).toGson();
				break;
			case "paste":
				jsonObject = Paste.parseFromHash(eventHashMap).toGson();
				break;
			case "resize":
				jsonObject = Resize.parseFromHash(eventHashMap).toGson();
				break;
			case "scroll":
				jsonObject = Scroll.parseFromHash(eventHashMap).toGson();
				break;
			case "select_Extra":
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case "select":
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case "selectextra":
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case "unload":
				jsonObject = Unload.parseFromHash(eventHashMap).toGson();
				break;
	
			default:
				ErrorLogging
				.logError(
						"EventManager.java/logEventToDB",
						"This error most likely appears because the following string "
								+ "doesn't relate to any registered event: "
								+ eventHashMap.get(EventConstants.EVENTNAME),null);
				break;
	}
		
		return jsonObject;
	}
	

	/**
	 * 
	 * Deserializes a Json contained in a Mongo DBObject into a Java class of the corresponding Event
	 * In order to do that it will discern the kind of event that's stored
	 * in the HashMap and will call the correspondent class' deserializing method. 
	 * 
	 * @param DBObject
	 *          {@link DBObject} element obtained from the database with the information about the event
	 * @return GenericEvent class with the corresponding event
	 * 
	 */
	
	public static GenericEvent getEventFromDBObject(DBObject dbObject){
		GenericEvent classObject = null;
		
		switch (dbObject.get(EventConstants.EVENTNAME).toString()) {
			case "blur":
				classObject = new Blur(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "change":
				classObject = new Change(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "contextmenu":
				classObject = new Contextmenu(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "copy":
				classObject = new Copy(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "cut":
				classObject = new Cut(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "dblclick":
				classObject = new Dblclick(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "domchange":
				classObject = new Domchange(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "focus":
				classObject = new Focus(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "keydown":
				classObject = new Keydown(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "keypress":
				classObject = new Keypress(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "keyup":
				classObject = new Keyup(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "load":
				classObject = new Load(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mousedown":
				classObject = new Mousedown(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mousemove":
				classObject = new Mousemove(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mouseout":
				classObject = new Mouseout(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mouseover":
				classObject = new Mouseover(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mouseup":
				classObject = new Mouseup(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "mousewheel":
				classObject = new Mousewheel(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "paste":
				classObject = new Paste(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "resize":
				classObject = new Resize(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "scroll":
				classObject = new Scroll(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "select_Extra":
				classObject = new SelectContent(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "select":
				classObject = new SelectContent(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "selectextra":
				classObject = new SelectContent(com.mongodb.util.JSON.serialize(dbObject));
				break;
			case "unload":
				classObject = new Unload(com.mongodb.util.JSON.serialize(dbObject));
				break;
	
			default:
				ErrorLogging
				.logError(
						"EventManager.java/logEventToDB",
						"This error most likely appears because the following string "
								+ "doesn't relate to any registered event: "
								+ dbObject.get(EventConstants.EVENTNAME).toString(),null);
				break;
	}
		return classObject;
	}
	
}
