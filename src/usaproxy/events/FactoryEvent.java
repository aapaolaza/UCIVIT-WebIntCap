package usaproxy.events;

import usaproxy.ErrorLogging;

import org.bson.Document;

import com.mongodb.DBObject;

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
		
		case EventConstants.BLUR:
				jsonObject = Blur.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.CHANGE:
				jsonObject = Change.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.CONTEXTMENU:
				jsonObject = Contextmenu.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.COPY:
				jsonObject = Copy.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.CUT:
				jsonObject = Cut.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.DBLCLICK:
				jsonObject = Dblclick.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.DOMCHANGE:
				jsonObject = Domchange.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.FOCUS:
				jsonObject = Focus.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.KEYDOWN:
				jsonObject = Keydown.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.KEYPRESS:
				jsonObject = Keypress.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.KEYUP:
				jsonObject = Keyup.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.LOAD:
				jsonObject = Load.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEDOWN:
				jsonObject = Mousedown.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEMOVE:
				jsonObject = Mousemove.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEOUT:
				jsonObject = Mouseout.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEOVER:
				jsonObject = Mouseover.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEUP:
				jsonObject = Mouseup.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.MOUSEWHEEL:
				jsonObject = Mousewheel.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.PASTE:
				jsonObject = Paste.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.RESIZE:
				jsonObject = Resize.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.SCROLL:
				jsonObject = Scroll.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.SELECT_EXTRA:
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.SELECT:
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.SELECTEXTRA:
				jsonObject = SelectContent.parseFromHash(eventHashMap).toGson();
				break;
			case EventConstants.UNLOAD:
				jsonObject = Unload.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.WINDOWFOCUS:
				jsonObject = WindowFocus.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.WINDOWBLUR:
				jsonObject = WindowBlur.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.MOBILETOUCHSTART:
				jsonObject = MobileTouchStart.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.MOBILETOUCHEND:
				jsonObject = MobileTouchEnd.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.MOBILEORIENTATIONCHANGE:
				jsonObject = MobileOrientationChange.parseFromHash(eventHashMap).toGson();
				break;

			case EventConstants.MOBILEGYROSCOPE:
				jsonObject = MobileGyroscope.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.MOBILEMOTION:
				jsonObject = MobileMotion.parseFromHash(eventHashMap).toGson();
				break;
				
				
			case EventConstants.COOKIEDISCLAIMERSHOWN:
				jsonObject = CookieDisclaimerShown.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.COOKIEDISCLAIMERACCEPTED:
				jsonObject = CookieDisclaimerAccepted.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.COOKIEDISCLAIMERREJECTED:
				jsonObject = CookieDisclaimerAccepted.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.WINDOWQUERYFOCUS:
				jsonObject = WindowQueryFocus.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.WINDOWQUERYBLUR:
				jsonObject = WindowQueryBlur.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.ANDYBBC:
				jsonObject = AndyBBC.parseFromHash(eventHashMap).toGson();
				break;
				
			case EventConstants.SURVEYSHOWN:
				jsonObject = SurveyShown.parseFromHash(eventHashMap).toGson();
				break;

			case EventConstants.SUBMIT:
				jsonObject = Submit.parseFromHash(eventHashMap).toGson();
				break;
				
			default:
				ErrorLogging
				.logError(
						"FactoryEvent.java/getJsonFromEventHashMap()",						"This error most likely appears because the following string "
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
	
	public static GenericEvent getEventFromDBObject(Document dbObject){
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
				
			case "windowfocus":
				classObject = new WindowFocus(com.mongodb.util.JSON.serialize(dbObject));
				break;
				
			case "windowblur":
				classObject = new WindowBlur(com.mongodb.util.JSON.serialize(dbObject));
				break;

			case "mobileTouchStart":
				classObject = new MobileTouchStart(com.mongodb.util.JSON.serialize(dbObject));
				break;

			case "mobileTouchEnd":
				classObject = new MobileTouchEnd(com.mongodb.util.JSON.serialize(dbObject));
				break;
				
			case "mobileOrientationChange":
				classObject = new MobileOrientationChange(com.mongodb.util.JSON.serialize(dbObject));
				break;
				
			case "mobileGyroscope":
				classObject = new MobileGyroscope(com.mongodb.util.JSON.serialize(dbObject));
				break;

			case "mobileMotion":
				classObject = new MobileMotion(com.mongodb.util.JSON.serialize(dbObject));
				break;

				
			case "cookiedisclaimershown":
				classObject = new CookieDisclaimerShown(com.mongodb.util.JSON.serialize(dbObject));
				break;
					
			case "cookiedisclaimeraccepted":
				classObject = new CookieDisclaimerAccepted(com.mongodb.util.JSON.serialize(dbObject));
				break;
				
			case "cookiedisclaimerrejected":
				classObject = new CookieDisclaimerRejected(com.mongodb.util.JSON.serialize(dbObject));
				break;
					
			default:
				ErrorLogging
				.logError(
						"FactoryEvent.java/getEventFromDBObject",
						"This error most likely appears because the following string "
								+ "doesn't relate to any registered event: "
								+ dbObject.get(EventConstants.EVENTNAME).toString(),null);
				break;
	}
		return classObject;
	}
	
}
