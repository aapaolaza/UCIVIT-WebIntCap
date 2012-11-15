package usaproxy.domchanges;


import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import usaproxy.domchanges.DOMChangesLogList.DOMChangeLogElement;
import usaproxy.domchanges.diff_match_patch.Diff;

public class DOMdiff {
	final static Charset ENCODING = StandardCharsets.UTF_8;


	/**
	 * Returns a JSON string with an element of type DOMChangesLogList with the
	 * list of differences between the two strings 
	 * @param origDOM, the original DOM
	 * @param newDOM, the new DOM from which the changes will be calculated
	 * @param clientIP, the IP of the client being observed
	 * @param time, the timestamp
	 * @param sd, web page identifier
	 * @param sid, session identifier
	 * @return A JSON representing a serialised DOMChangesLogList, ready to be written to a text file
	 */
	public static String getChangesLogJSON(String origDOM, String newDOM, String clientIP, String time, String sd, String sid){

		///Recording differences to a DOMChangesLogList element////////////////////
		diff_match_patch dmp = new diff_match_patch();

		LinkedList<Diff> diffList = dmp.diff_main(origDOM, newDOM);

		System.out.println("DOMdiff.java/getChangesLogJSON: Amount of differences:" + diffList.size());

		dmp.diff_cleanupSemantic(diffList);

		System.out.println("DOMdiff.java/getChangesLogJSON: Amount of semantic differences:" + diffList.size());

		//System.out.println(dmp.diff_prettyHtml(diffList));

		DOMChangesLogList domChangesLogList = new DOMChangesLogList();

		int charIndex=0;
		for (int i = 0; i < diffList.size();i++){
			Diff diffElem = diffList.get(i);

			switch (diffElem.operation) {

			case EQUAL:
				//the text remained the same, so we just increase the 
				//charIndex in order to omit this text
				charIndex += diffElem.text.length();
				break;

			case DELETE:
				//A deletion occurred, store the "charIndexStart" and the "charIndexEnd" 
				//in order to know HOW MUCH text should be deleted
				domChangesLogList.addDOMChangeElement("DELETE", String.valueOf(charIndex), String.valueOf(charIndex + diffElem.text.length()));

				//We do not need to update the index as it will just remain the same

				break;

			case INSERT:
				//An insertion occurred, store the "charIndexStart" and the "insertionText"
				//in order to know WHERE and WHAT text should be injected
				domChangesLogList.addDOMChangeElement("INSERT", String.valueOf(charIndex), diffElem.text);

				//We also need to update the index, as after the text injection there will be more text
				charIndex += diffElem.text.length();
				break;

			default:
				break;
			}
		}
		
		domChangesLogList.setContextInfo(clientIP, time, sd, sid);

		//converting the Java object to JSON
		return domChangesLogList.toGson();
	}

	/**
	 * Returns a Java representation of a serialised JSON
	 *  
	 * @param serialJson, the serialised JSON of a DOMChangesLogList element
	 * @return A deserialised DOMChangesLogList that was contained in serialJson
	 */
	public DOMChangesLogList getJavaDOMChangeList(String serialJson){

		DOMChangesLogList tempDomChangeList = new DOMChangesLogList();
		tempDomChangeList.fromGson(serialJson);

		return tempDomChangeList;
	}

	/**
	 * Looks for the first DOM available at the current timeStamp (it may be before the time,
	 * but never after the time)
	 *  
	 * @param sessionID, the session ID from which we want the DOM from
	 * @param timeStamp, a Date object with the timestamp it's been looked for.
	 * @return String representing the DOM corresponding to that timestamp and sesionIDE
	 */
	public String computeLastDOM (String sessionID, Date timestamp){
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd,HH:mm:ss:SSS");
		//dateFormat.format(parseFormat.parse(timestampTest))

		File sessionFolder = new File(sessionID);//, sd + ";" + time

		File[] filesInFolder = sessionFolder.listFiles();

		//we want them ordered by timestamp, which is the first part of the filename
		java.util.Arrays.sort(filesInFolder);

		ArrayList<File> filesBeforeTimeStamp= new ArrayList<File>();
		String fileName;

		//As the files are sorted according to their timestamp, 
		//this boolean will prevent looking into files that are known to be too new  
		boolean indexFileBeforeTime=true;

		for (int i = 0; i < filesInFolder.length && indexFileBeforeTime; i++) 
		{
			if (filesInFolder[i].isFile()) 
			{
				fileName = filesInFolder[i].getName();
				//the filename format should be time + ";" + sd 
				//we will split it via ; and get the first element: "split(";")[0]" should be the date

				//if the date of the file is before the timestamp, then we want it
				try {
					if (dateFormat.parse(fileName.split(";")[0]).compareTo(timestamp)<0)
						filesBeforeTimeStamp.add(filesInFolder[i]);
					else
						indexFileBeforeTime = false;//we know the next one will be too knew as well

				} catch (ParseException e) {
					System.out.println("DOMdiff.java/computeLastDOM(): There was a problem when parsing the date");
					e.printStackTrace();
				}
			}
		}

		/*
		 * At this point we have a list of files "filesBeforeTimeStamp" whose combination (in order) 
		 * will result in the DOM we are looking for.
		 * Now we need to recreate the final DOM from the original one plus the differences.
		 */
		for (int i = 0; i < filesBeforeTimeStamp.size() && indexFileBeforeTime; i++) 
		{
			if (filesBeforeTimeStamp.get(i).isFile()) 
			{
				
			}
		}
		
		return "";
	}

	/**
	 * Given the original DOM and a string containing a JSON with the changes,
	 * it returns a modified DOM applying the changes to it.
	 * @param origDOM, the original DOM to be changed
	 * @param tmodifications, a JSON object containing a DOMChangesLogList Java class with
	 * the list of required changes
	 * @return String with the new DOM
	 */
	public String computeNewDOM(String domString, String modifications){

		DOMChangesLogList domChangesLogList = new DOMChangesLogList();
		domChangesLogList.fromGson(domChangesLogList.toGson());

		for (int i=0;i < domChangesLogList.list.size();i++){

			DOMChangeLogElement domChange = domChangesLogList.list.get(i);

			switch (domChange.getOperation()) {
			case "DELETE":
				//We remove all the characters between "charIndexStart" and "charIndexEnd" 
				domString = domString.substring(0, domChange.getCharIndexStart())
						+ domString.substring(domChange.getCharIndexEnd(), domString.length());
				break;

			case "INSERT":
				//We inject text between "getCharIndexStart" and "getCharIndexStart" + 1
				domString = domString.substring(0, domChange.getCharIndexStart()) 
						+ domChange.getInsertionText()
						+ domString.substring(domChange.getCharIndexStart(), domString.length());
				break;

			default:
				break;
			}
		}

		return domString;
	}

	/**
	 * Main program that tests the functions in this file.
	 * It compares the files named "a" and "b" and returns the differences 
	 */
	
	public static void main(String[] args) throws IOException{

		Path path = Paths.get("a");
		List<String> lineList = Files.readAllLines(path, ENCODING);

		String aFileString="", bFileString="";

		for (int i = 0; i < lineList.size(); i++){
			aFileString += lineList.get(i);
		}


		path = Paths.get("b");
		lineList = Files.readAllLines(path, ENCODING);

		for (int i = 0; i < lineList.size(); i++){
			bFileString += lineList.get(i);
		}

		System.out.println(aFileString + "\n");

		System.out.println(bFileString);


		///Recording differences////////////////////
		diff_match_patch dmp = new diff_match_patch();

		LinkedList<Diff> diffList = dmp.diff_main(aFileString, bFileString);

		System.out.println("Differences:" + diffList);

		dmp.diff_cleanupSemantic(diffList);

		System.out.println("Semantic differences:" + diffList);

		System.out.println(dmp.diff_prettyHtml(diffList));

		DOMChangesLogList domChangesLogList = new DOMChangesLogList();

		int charIndex=0;
		for (int i = 0; i < diffList.size();i++){
			Diff diffElem = diffList.get(i);

			switch (diffElem.operation) {

			case EQUAL:
				//the text remained the same, so we just increase the 
				//charIndex in order to omit this text
				charIndex += diffElem.text.length();
				break;

			case DELETE:
				//A deletion occurred, store the "charIndexStart" and the "charIndexEnd" 
				//in order to know HOW MUCH text should be deleted
				domChangesLogList.addDOMChangeElement("DELETE", String.valueOf(charIndex), String.valueOf(charIndex + diffElem.text.length()));

				//We do not need to update the index as it will just remain the same

				break;

			case INSERT:
				//An insertion occurred, store the "charIndexStart" and the "insertionText"
				//in order to know WHERE and WHAT text should be injected
				domChangesLogList.addDOMChangeElement("INSERT", String.valueOf(charIndex), diffElem.text);

				//We also need to update the index, as after the text injection there will be more text
				charIndex += diffElem.text.length();
				break;

			default:
				break;
			}
		}


		/////TESTING GSON////////////////////
		System.out.println();
		System.out.println(domChangesLogList);
		System.out.println(domChangesLogList.toGson());
		System.out.println("THe following strings should be the same");

		for (int i=0;i < domChangesLogList.list.size();i++){
			System.out.print(domChangesLogList.list.get(i).printInfo()+";");
		}
		System.out.println();

		domChangesLogList.fromGson(domChangesLogList.toGson());
		for (int i=0;i < domChangesLogList.list.size();i++){
			System.out.print(domChangesLogList.list.get(i).printInfo()+";");
		}
		System.out.println();

		/////////Recreating the second DOM from the original one plus differences.
		String aFileStringOrig = aFileString;

		for (int i=0;i < domChangesLogList.list.size();i++){

			DOMChangeLogElement domChange = domChangesLogList.list.get(i);

			switch (domChange.getOperation()) {
			case "DELETE":
				//We remove all the characters between "charIndexStart" and "charIndexEnd" 
				aFileString = aFileString.substring(0, domChange.getCharIndexStart())
				+ aFileString.substring(domChange.getCharIndexEnd(), aFileString.length());
				break;

			case "INSERT":
				//We inject text between "getCharIndexStart" and "getCharIndexStart" + 1
				aFileString = aFileString.substring(0, domChange.getCharIndexStart()) 
				+ domChange.getInsertionText()
				+ aFileString.substring(domChange.getCharIndexStart(), aFileString.length());
				break;

			default:
				break;
			}
		}
		System.out.println("These should be the same");
		System.out.println(bFileString);
		System.out.println(aFileString);
		System.out.println();
		System.out.println("This is the original string");
		System.out.println(aFileStringOrig);
	}
}
