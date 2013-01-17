package usaproxy.events;

/**
 * This class contains all (or the majority) of constants used throughout the document.
 * This includes the taxonomy employed by the JavaScript to name different attributes,
 * like "event" for the type of event recorded, or "time" for the timestamp.
 * 
 */
public class EventConstants {
	/**
	public static enum EventsEnum{
	    blur, change, contextmenu, copy,
	    cut, dblclick, domchange, focus,
	    keydown, keypress, keyup,
	    load, mousedown, mousemove,
	    mouseout, mouseover, mouseup,
	    mousewheel, paste, resize,
	    scroll, 
	    select_Extra, select, selectextra,
	    //This different select events occur due to a strange behaviour when detecting selection, which results in different events
	    unload
	}
	*/
	//Generic attribute names
	
	public final static String IPADDRESS = "ip";
	
	public final static String TIMESTAMP = "time";
	
	public final static String SD = "sd";
	
	public final static String SID = "sid";
	
	public final static String EVENTNAME = "event";

	public final static String BROWSER = "browser";
	
	public final static String URL = "url";
	
	///Particular to NodeInfo
	
	public final static String NODEID = "id";
	
	public final static String NODENAME = "name";
	
	public final static String NODEDOM = "dom";
	
	public final static String NODEIMG = "img";
	
	public final static String NODELINK = "link";

	public final static String NODETEXT = "text";
	
	public final static String NODETYPE = "nodeType";
	
	public final static String NODETEXTVALUE = "textValue";

	//Particular to MouseCoordinates
	
	public final static String MOUSECOORD = "coord";
	
	public final static String MOUSEOFFSET = "offset";
	 
	//Particular to the "change" event
	public final static String TYPE = "type";
	
	public final static String CHECKED = "checked";
	
	public final static String VALUE = "value";
	
	public final static String SELECTED = "selected";
	
	//particular to copy, cut and paste
	public final static String CONTENT = "content";	
	
	//particular to DomChange
	public final static String NUMBEROFCHANGES = "numberofchanges";
	
	//particular to Keydown, keypress and keyup
	public final static String KEY = "key";
	
	//particular to Load and resize
	public final static String SIZE = "size";

	//particular to mousedown and mouse up
	public final static String BUTTON = "but";

	//particular to mousewheel
	public final static String DELTA = "delta";
	
	//particular to scroll
	public final static String SCROLLX = "scrollx";

	public final static String SCROLLY = "scrolly";
	
	//particular to selectContent
	public final static String SELECTIONTOOL= "selectionTool";
	public final static String SELECTEDCONTENT= "selectedContent";
	
}
