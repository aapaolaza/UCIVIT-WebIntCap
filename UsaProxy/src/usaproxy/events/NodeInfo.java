package usaproxy.events;

import com.google.gson.Gson;

/*
 * This class will contain all the information of the node the event may be referring to.
 * It will have plenty of optional fields, like img in case the element referes to an image
 * or link and text in the case the node is an link.
 * All element whose information was not set, should be empty strings.
 */
public class NodeInfo {
	/**
	 * @param nodeId
	 * @param nodeName
	 * @param nodeDom
	 * @param nodeImg
	 * @param nodeLink
	 * @param nodeText
	 * @param nodeType
	 * @param nodeTextValue
	 */
	public NodeInfo(String nodeId, String nodeName, String nodeDom,
			String nodeImg, String nodeLink, String nodeText, String nodeType,
			String nodeTextValue) {
		super();
		this.nodeId = nodeId;
		this.nodeName = nodeName;
		this.nodeDom = nodeDom;
		this.nodeImg = nodeImg;
		this.nodeLink = nodeLink;
		this.nodeText = nodeText;
		this.nodeType = nodeType;
		this.nodeTextValue = nodeTextValue;
	}

	public NodeInfo(String json) {
		
		Gson gson = new Gson();
		NodeInfo tempClass = gson.fromJson(json, NodeInfo.class);
		this.nodeId = tempClass.nodeId;
		this.nodeName = tempClass.nodeName;
		this.nodeDom = tempClass.nodeDom;
		this.nodeImg = tempClass.nodeImg;
		this.nodeLink = tempClass.nodeLink;
		this.nodeText = tempClass.nodeText;
		this.nodeType = tempClass.nodeType;
		this.nodeTextValue = tempClass.nodeTextValue;
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
	 * Id of the node if available
	 */
	private String nodeId;
	/*
	 * Name of the node if available
	 */
	private String nodeName;
	/*
	 * DOM location of the hovered element
	 */
	private String nodeDom;
	/*
	 * The filename the node may be referring to 
	 */
	private String nodeImg;
	/*
	 * The link the node may be pointing at
	 */
	private String nodeLink;
	/*
	 * Text the node may contain
	 */
	private String nodeText;
	/*
	 * Node type of the hovered element
	 */
	private String nodeType;
	
	/*
	 * Possible text value of the node 
	 */
	private String nodeTextValue;

	/**
	 * @return the nodeId
	 */
	public String getNodeId() {
		return nodeId;
	}

	/**
	 * @param nodeId the nodeId to set
	 */
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	/**
	 * @return the nodeName
	 */
	public String getNodeName() {
		return nodeName;
	}

	/**
	 * @param nodeName the nodeName to set
	 */
	public void setNodeName(String nodeName) {
		this.nodeName = nodeName;
	}

	/**
	 * @return the nodeDom
	 */
	public String getNodeDom() {
		return nodeDom;
	}

	/**
	 * @param nodeDom the nodeDom to set
	 */
	public void setNodeDom(String nodeDom) {
		this.nodeDom = nodeDom;
	}

	/**
	 * @return the nodeImg
	 */
	public String getNodeImg() {
		return nodeImg;
	}

	/**
	 * @param nodeImg the nodeImg to set
	 */
	public void setNodeImg(String nodeImg) {
		this.nodeImg = nodeImg;
	}

	/**
	 * @return the nodeLink
	 */
	public String getNodeLink() {
		return nodeLink;
	}

	/**
	 * @param nodeLink the nodeLink to set
	 */
	public void setNodeLink(String nodeLink) {
		this.nodeLink = nodeLink;
	}

	/**
	 * @return the nodeText
	 */
	public String getNodeText() {
		return nodeText;
	}

	/**
	 * @param nodeText the nodeText to set
	 */
	public void setNodeText(String nodeText) {
		this.nodeText = nodeText;
	}

	/**
	 * @return the nodeType
	 */
	public String getNodeType() {
		return nodeType;
	}

	/**
	 * @param nodeType the nodeType to set
	 */
	public void setNodeType(String nodeType) {
		this.nodeType = nodeType;
	}

	/**
	 * @return the nodeTextValue
	 */
	public String getNodeTextValue() {
		return nodeTextValue;
	}

	/**
	 * @param nodeTextValue the nodeTextValue to set
	 */
	public void setNodeTextValue(String nodeTextValue) {
		this.nodeTextValue = nodeTextValue;
	}
}
