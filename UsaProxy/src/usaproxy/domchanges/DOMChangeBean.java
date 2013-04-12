package usaproxy.domchanges;

import com.google.gson.Gson;

/**
 * This class will store the different changes over a milestone DOM
 * {@link DOMBean}.
 * 
 */
public class DOMChangeBean {

	/**
	 * Empty constructor
	 */
	public DOMChangeBean() {
		super();
		this.timestamp = "";
		this.sd = "";
		this.sid = "";
		this.url = "";
		this.browser = "";
		this.domChanges = "";

	}

	public DOMChangeBean(String timestamp, String sd, String sid, String url,
			String browser, String domContent) {
		super();
		this.timestamp = timestamp;
		this.sd = sd;
		this.sid = sid;
		this.url = url;
		this.browser = browser;
		this.domChanges = domContent;
	}

	/**
	 * Deserialise given JSON and creates a DOMBean element with the result
	 * 
	 * @param serialised
	 *            class in JSON
	 */

	public DOMChangeBean(String json) {
		Gson gson = new Gson();
		DOMChangeBean tempClass = gson.fromJson(json, DOMChangeBean.class);

		this.timestamp = tempClass.timestamp;
		this.sd = tempClass.sd;
		this.sid = tempClass.sid;
		this.url = tempClass.url;
		this.browser = tempClass.browser;
		this.domChanges = tempClass.domChanges;


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
	 * Timestamp of the DOM
	 */
	private String timestamp;

	/**
	 * Web page ID
	 */
	private String sd;
	/**
	 * User's ID
	 */
	private String sid;

	/**
	 * Web page url
	 */
	private String url;

	/**
	 * Client's browser
	 */
	private String browser;

	/**
	 * Differences to apply to the DOM, stored in Json
	 */
	private String domChanges;

	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public String getSd() {
		return sd;
	}

	public void setSd(String sd) {
		this.sd = sd;
	}

	public String getSid() {
		return sid;
	}

	public void setSid(String sid) {
		this.sid = sid;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}
	
	public String getDomChanges() {
		return domChanges;
	}

	public void setDomChanges(String domChanges) {
		this.domChanges = domChanges;
	}

}
