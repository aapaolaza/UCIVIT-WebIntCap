package usaproxy;

import java.io.File;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.bson.Document;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.MongoTimeoutException;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Indexes;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.UpdateOptions;

import usaproxy.domchanges.DOMBean;
import usaproxy.events.EventConstants;
import usaproxy.events.FactoryEvent;
import usaproxy.events.GenericEvent;

/**
 * This class will act as an interface to the MongoDatabase. It will return
 * GenericEvent {@link ArrayList}, Json strings or {@link DBObject}s
 * 
 * @author apaolaza
 * 
 */
public class MongoDAO {

	public static MongoClient mongoClient = null;
	public static MongoDatabase db = null;
	public static MongoCollection<Document> eventsColl = null;
	public static MongoCollection<Document> domColl = null;
	public static MongoCollection<Document> domChangeColl = null;
	public static MongoCollection<Document> domTempColl = null;


	private MongoDAO() throws UnknownHostException {

		// As they are static objects, if the database object exists already,
		// there is no need to create it again
		if (eventsColl == null) {

			System.out.println("initialising DB connection");

			mongoClient = new MongoClient(getDbIP());


			// if the user is an empty string, no authentication is used
			if (getDbUser() != "") {
				MongoCredential credential = MongoCredential.createCredential(getDbUser(),
						getDbName(),
						getDbPassword().toCharArray());
				mongoClient = new MongoClient(new ServerAddress("localhost", 27017),
						Arrays.asList(credential));
			}

			db = mongoClient.getDatabase(getDbName());

			try {
				db.runCommand(new Document("ping", 1));
			} catch (MongoTimeoutException e) {
				System.out.println("Error authenticating to DB (is it running?");
				ErrorLogging.logError("MongoDAO.java/MongoDAO()",
						"There was an error trying to connect to the MongoDB database", null);
			}

			System.out.println("initialising DB collections");
			eventsColl = db.getCollection(getDbEventsCollection());
			domColl = db.getCollection(getDbDOMCollection());
			domChangeColl = db.getCollection(getDbDOMChangeCollection());
			domTempColl = db.getCollection(getDbDOMTempCollection());
			
			//Create unique index (if doesn't exist) to prevent duplicates
			createUniqueIndex();
			System.out.println("Unique index created");
		}
	}

	/**
	 * Static constructor of the MongoDAO class that enables the access to
	 * Database functions without the need of declaring the initialisation of a
	 * new MongoDAO object.
	 * 
	 * @return MongoDAO object that gives access to all MongoDAO functionalities
	 */
	public static MongoDAO MongoDAO() {
		try {
			return new MongoDAO();
		} catch (UnknownHostException e) {
			ErrorLogging.logError("MongoDAO.java/MongoDAO()", "Error initializing the MongoDAO object", e);
		}
		return null;
	}


	// ////////DATABASE ACCESS DATA

	private final static String dbInfoFilename = "dbAccessData.txt";

	private static String dbIP = null;
	private static String dbName = null;
	private static String dbEventsCollection = null;
	private static String dbDOMCollection = null;
	private static String dbDOMChangeCollection = null;
	private static String dbDOMTempCollection = null;
	private static String dbUser = null;
	private static String dbPassword = null;

	public static String getDbIP() {
		if (dbIP == null) {
			getDBInfoFromFile();
		}
		return dbIP;
	}

	public static String getDbName() {
		if (dbName == null) {
			getDBInfoFromFile();
		}
		return dbName;
	}

	public static String getDbEventsCollection() {
		if (dbEventsCollection == null) {
			getDBInfoFromFile();
		}
		return dbEventsCollection;
	}

	public static String getDbDOMCollection() {
		if (dbDOMCollection == null) {
			getDBInfoFromFile();
		}
		return dbDOMCollection;
	}

	public static String getDbDOMChangeCollection() {
		if (dbDOMChangeCollection == null) {
			getDBInfoFromFile();
		}
		return dbDOMChangeCollection;
	}

	public static String getDbDOMTempCollection() {
		if (dbDOMTempCollection == null) {
			getDBInfoFromFile();
		}
		return dbDOMTempCollection;
	}

	public static String getDbUser() {
		if (dbUser == null) {
			getDBInfoFromFile();
			System.out.println("getDbUser():" + dbUser);
		}
		return dbUser;
	}

	public static String getDbPassword() {
		if (dbPassword == null) {
			getDBInfoFromFile();
		}
		return dbPassword;
	}

	/**
	 * Initialise an index that prevents duplicates in the database
	 */
	public boolean createUniqueIndex(){
		try {
			eventsColl.createIndex(Indexes.ascending("sid","sd","sessionstartms","event","timestampms"));
			return true;
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/createUniqueIndex()",
					"Error trying to create the unique index", e);
		}
		return false;
	}

	/**
	 * Obtain the connection info for the database from a text file. It will
	 * store in the variables all the required information for the connection
	 */

	public static void getDBInfoFromFile() {
		try {

			List<String> lineList;
			File dataInfoFile = new File(dbInfoFilename);
			lineList = Files.readAllLines(Paths.get(dataInfoFile.getPath()), StandardCharsets.UTF_8);

			/*
			 * The info in the file can be in any order, as long as is in the
			 * format label=value Without spaces. The information required is IP
			 * (location of the database), DBNAME (name of the database),
			 * EVENTSCOLL (collection where the events are stored), DOMCOLL
			 * (collection where the DOM milestones are stored),
			 * DOMCHANGECOLL(collection where the DOM changes are stored),
			 * DOMTEMPCOLL(collection where the temporary DOM milestones are
			 * stored), USER (database user), PASSWORD (database password).
			 */
			// System.out.println("Database info was:");
			//
			// for (int i = 0; i < lineList.size(); i++) {
			// System.out.println(lineList.get(i));
			// }

			for (int i = 0; i < lineList.size(); i++) {
				String[] dbInfoPair = lineList.get(i).split("=");

				System.out.println("getDBInfoFromFile():checking the following field" + dbInfoPair[0]);

				switch (dbInfoPair[0]) {
				case "IP":
					dbIP = dbInfoPair[1];
					break;
				case "DBNAME":
					dbName = dbInfoPair[1];
					break;
				case "EVENTSCOLL":
					dbEventsCollection = dbInfoPair[1];
					break;
				case "DOMCOLL":
					dbDOMCollection = dbInfoPair[1];
					break;
				case "DOMCHANGECOLL":
					dbDOMChangeCollection = dbInfoPair[1];
					break;
				case "DOMTEMPCOLL":
					dbDOMTempCollection = dbInfoPair[1];
					break;
				case "USER":
					// if the length of the resulting array is smaller than 2,
					// then the value parameter was empty
					if (dbInfoPair.length < 2) {
						System.out.println("MongoDAO.java: no user credentials found, authentication is off");
						dbUser = "";
					} else
						dbUser = dbInfoPair[1];
					break;
				case "PASSWORD":
					// if the length of the resulting array is smaller than 2,
					// then the value parameter was empty
					if (dbInfoPair.length < 2) {
						System.out.println("MongoDAO.java: no password credentials found, authentication is off");
						dbPassword = "";
					} else
						dbPassword = dbInfoPair[1];
					break;
				case "":
					// we do nothing, an empty value may slip in the switch
					break;
				default:
					// As free text is permitted, this case should be ignored.
					/*
					 * ErrorLogging.logError(
					 * "MongoDAO.java:getDBInfoFromFile()",
					 * "This switch case should never happen: " + dbInfoPair[0]
					 * +"\n the original paramstring was: \n" + lineList.get(i),
					 * null);
					 */
					break;
				}
			}

			System.out.println("MongoDAO.java:getDBInfoFromFile():  Database info is:" + dbIP + "," + dbName + ","
					+ dbEventsCollection + "," + dbDOMCollection + "," + dbDOMChangeCollection + ","
					+ dbDOMTempCollection + "," + dbUser + "," + dbPassword);

			ErrorLogging.logError("MongoDAO.java:getDBInfoFromFile()",
					"Database info is:" + dbIP + "," + dbName + "," + dbEventsCollection + "," + dbDOMCollection + ","
							+ dbDOMChangeCollection + "," + dbDOMTempCollection + "," + dbUser + "," + dbPassword,
							null);

		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java:getDBInfoFromFile()",
					"Error obtaining the database user and password, is the file there?", e);
		}
	}

	/**
	 * Commits a Json document to the events collection in the database
	 * 
	 * @param jsonString
	 *            Json document to commit
	 * 
	 * @return boolean indicating if the operation was succesfull
	 */
	public boolean commitJsonToEvents(String jsonString) {

		try {
			Document doc = Document.parse(jsonString);
			eventsColl.insertOne(doc);

			return true;
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/commitJson()",
					"Error trying to commit the following Json to the Database: \n" + jsonString, e);
		}
		return false;
	}

	/**
	 * Commits a Json document to the DOM milestone collection in the database
	 * 
	 * @param jsonString
	 *            Json document to commit
	 * 
	 * @return boolean indicating if the operation was succesfull
	 */
	public boolean commitJsonToDOM(String jsonString) {

		try {
			Document doc = Document.parse(jsonString);
			domColl.insertOne(doc);

			return true;
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/commitJson()",
					"Error trying to commit the following Json to the Database", e);
		}
		return false;
	}

	/**
	 * Commits a Json document to the DOM TEMPORAL milestone collection in the
	 * database
	 * 
	 * @param jsonString
	 *            Json document to commit
	 * 
	 * @return boolean indicating if the operation was succesfull
	 */
	public boolean commitJsonToDOMTemp(String jsonString) {

		try {
			Document doc = Document.parse(jsonString);
			domTempColl.insertOne(doc);

			return true;
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/commitJson()",
					"Error trying to commit the following Json to the Database", e);
		}
		return false;
	}

	/**
	 * Commits a Json document to the DOM Changes collection in the database
	 * 
	 * @param jsonString
	 *            Json document to commit
	 * 
	 * @return boolean indicating if the operation was succesfull
	 */
	public boolean commitJsonToDOMChange(String jsonString) {

		try {
			Document doc = Document.parse(jsonString);
			domChangeColl.insertOne(doc);

			return true;
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/commitJson()",
					"Error trying to commit the following Json to the Database", e);
		}
		return false;
	}

	// ////////QUERIES
	/**
	 * Queries and returns all the events in the collection in a
	 * {@link ArrayList}
	 * 
	 * @return {@link ArrayList} to all the events in the collection
	 */
	public ArrayList<GenericEvent> getAllEvents() {
		ArrayList<GenericEvent> eventList = new ArrayList<GenericEvent>();

		MongoCursor<Document> cursor = eventsColl.find().iterator();
		try {
			while (cursor.hasNext()) {
				eventList.add(FactoryEvent.getEventFromDBObject(cursor.next()));
			}
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAo.java/getAllDocuments()",
					"Error occurred when querying for all documents in the collection", e);
		} finally {
			cursor.close();
		}
		return eventList;
	}

	/**
	 * Queries and returns all the events from a particular type in a
	 * {@link ArrayList}
	 * 
	 * @param String
	 *            type of the event to retrieve the documents for
	 * 
	 * @return {@link ArrayList} to all the events of the specified type
	 */
	public ArrayList<GenericEvent> getAllEventsByType(String eventType) {
		ArrayList<GenericEvent> eventList = new ArrayList<GenericEvent>();

		BasicDBObject query = new BasicDBObject(EventConstants.EVENTNAME, eventType);
		MongoCursor<Document> cursor = eventsColl.find(query).iterator();

		try {
			while (cursor.hasNext()) {
				eventList.add(FactoryEvent.getEventFromDBObject(cursor.next()));
			}
		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAo.java/getAllDocuments()",
					"Error occurred when querying for all documents in the collection", e);
		} finally {
			cursor.close();
		}
		return eventList;
	}

	/*
	 * Functions I need:
	 * 
	 * Last event recorded for a certain sid
	 * 
	 * Count the number of milestones recorded for a certain user to be used as
	 * the interaction index
	 * 
	 * Update tempMilestone for a certain sid
	 */

	/**
	 * Returns the number of recorded DOMmilestones for a certain sid to be used
	 * as the interaction index
	 * 
	 * @param String
	 *            sid of the user
	 * 
	 * @return Integer with the count of unique milestones recorded so far
	 */
	public Integer getCountOfUserDomMilestones(String sid) {

		try {
			BasicDBObject query = new BasicDBObject("sid", sid);

			return (int) eventsColl.count(query);

		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/getCountOfUserDomMilestones()",
					"Error occurred when counting the number of DOM milestones for a user", e);
		}

		return 0;
		// finally {
		// cursor.close();
		// }
		// return eventList;
	}

	/**
	 * Returns the value of the DOM temp milestone for the given user
	 * 
	 * @param String
	 *            sid of the user
	 * @param String
	 *            sessionstartms
	 * 
	 * @return {@link DOMBean} with the corresponding DOM temp milestone for the
	 *         given user
	 */
	public DOMBean getTempMilestoneForSid(String sid, String sessionstartms) {

		Document queryResult = null;
		DOMBean tempDOM = null;
		try {

			BasicDBObject query = new BasicDBObject("sid", sid);
			query.append("sessionstartms", sessionstartms);

			MongoCursor<Document> cursor = domTempColl.find(query).iterator();

			while (cursor.hasNext()) {
				queryResult = cursor.next();
				tempDOM = new DOMBean(queryResult.toString());
				ErrorLogging.logError("MongoDAO.java: getLastTempMilestoneForSid()",
						"The last temp milestone was: " + queryResult, null);
			}

		} catch (Exception e) {
			ErrorLogging.logError("MongoDAO.java/getCountOfUserDomMilestones()",
					"Error occurred when counting the number of DOM milestones for a user", e);
		}

		return tempDOM;
	}

	/**
	 * Updates or insert (if no element to update is found) the DOM temp
	 * milestone for a certain user
	 * 
	 * @param {@link
	 * 			DOMBean} with the corresponding DOM temp milestone to update
	 * 
	 * @return boolean indicating if the update was successful
	 */
	public boolean upsertDOMTempForUser(DOMBean domObject) {

		try {

			BasicDBObject query = new BasicDBObject("sid", domObject.getSid());
			query.append("sessionstartms", domObject.getSessionstartms());

			/*
			 * Mongo update function db.collection.update(query, update,
			 * <upsert>, <multi>) query: criteria to find the element update:
			 * update expression (like new BasicDBObject("$set", new
			 * BasicDBObject("two", 9).append("five", 8)) <upsert>: boolean
			 * indicating if an insertion should be performed if the element is
			 * not found <multi>: bollean indicating if all the found elements
			 * should be updated or just one
			 * 
			 */

			// WE set the dbObject we are going to insert (for clarity)
			BasicDBObject domData = new BasicDBObject();

			domData.put("timestamp", domObject.getTimestamp());
			domData.put("timestampms", domObject.getTimestampms());

			domData.put("sessionstartms", domObject.getSessionstartms());

			domData.put("sessionstartparsed", domObject.getSessionstartparsed());
			domData.put("usertimezoneoffset", domObject.getUsertimezoneoffset());
			domData.put("sd", domObject.getSd());
			domData.put("sid", domObject.getSid());
			domData.put("ip", domObject.getClientIP());

			domData.put("url", domObject.getUrl());
			domData.put("browser", domObject.getBrowser());
			domData.put("platform", domObject.getPlatform());
			domData.put("domContent", domObject.getDomContent());

			// System.out.println("domContent: " + domObject.getDomContent());

			// System.out.println("MongoDAO.java upsertDOMTempForUser, DOMTEMP
			// info to store: " + domObject.toGson());

			UpdateOptions options = new UpdateOptions().upsert(true);

			domTempColl.updateOne(query, domData, options);

			return true;

		} catch (Exception e) {
			ErrorLogging.logError("MongoDAO.java/getCountOfUserDomMilestones()",
					"Error occurred when counting the number of DOM milestones for a user", e);
		}

		return false;
	}

	/**
	 * Returns the timestamp (long ms) of the last event recorded for that user
	 * 
	 * @param String
	 *            ID for the user to request the timestamp for
	 * 
	 * @return long timestamp value in ms, "0" if there is any error
	 * 
	 */
	public Long getLastEventTimestampForUser(String sid) {

		String timeString = null;
		try {

			BasicDBObject query = new BasicDBObject("sid", sid);

			BasicDBObject sortPredicate = new BasicDBObject();
			sortPredicate.put("timestamp", -1);

			Document lastEvent = eventsColl.find(query).sort(Sorts.descending("timestamp")).first();

			timeString = FactoryEvent.getEventFromDBObject(lastEvent).getTimestamp();

			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd,HH:mm:ss:SSS");

			return (sdf.parse(timeString).getTime());


		} catch (Exception e) {
			ErrorLogging.logCriticalError("MongoDAO.java/getLastEventTimestampForUser()",
					"Error occurred when obtaining the timestamp for the last inserted event", e);
		}

		return (long) 0;
	}

}
