package usaproxy;

import java.net.UnknownHostException;
import java.util.ArrayList;

import usaproxy.events.EventConstants;
import usaproxy.events.FactoryEvent;
import usaproxy.events.GenericEvent;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
/**
 * This class will act as an interface to the MongoDatabase.
 * It will return GenericEvent {@link ArrayList}, Json strings or {@link DBObject}s 
 * @author apaolaza
 *
 */
public class MongoDAO {

	public final String DATABASEIP = "localhost";
	public final String DATABASEIPNAME = "testdb";
	public final String DATABASECOLLECTION = "events";

	public final String DATABASEUSER = "wel";
	public final char[] DATABASEPASSWORD = "wel&2013$".toCharArray();

	public static MongoClient mongoClient = null;
	public static DB db = null;
	public static DBCollection coll = null;

	//Variable indicating if the authorisation was correct 
	private boolean auth;

	private MongoDAO() throws UnknownHostException {

		//As they are static objects, if the database object exists already, there is no need to create it again
		if (coll == null){
			mongoClient = new MongoClient(DATABASEIP);

			db = mongoClient.getDB(DATABASEIPNAME);
			auth = db.authenticate(DATABASEUSER, DATABASEPASSWORD);

			if (auth){
				coll = db.getCollection(DATABASECOLLECTION);
			}
			else{
				ErrorLogging.logError("MongoDAO.java/MongoDAO()",
						"There was an error trying to connect to the MongoDB database", null);
			}
		}
	}

	/**
	 * Static constructor of the MongoDAO class that enables the access to 
	 * Database functions without the need of declaring the initialisation 
	 * of a new MongoDAO object.
	 * 
	 * @return MongoDAO object that gives access to all MongoDAO functionalities
	 */
	public static MongoDAO MongoDAO() {
		try {
			return new MongoDAO();
		} catch (UnknownHostException e) {
			ErrorLogging.logError("MongoDAO.java/MongoDAO()",
					"Error initializing the MongoDAO object", e);
		}
		return null;
	}

	/**
	 * Commits a Json document to the database
	 * 
	 * @param jsonString Json document to commit
	 * 
	 * @return boolean indicating if the operation was succesfull
	 */
	public boolean commitJson(String jsonString) {

		try{
			//System.out.println("MongoDAO/commitJson(): Storing the following Json: " + jsonString);
			Object o = com.mongodb.util.JSON.parse(jsonString);
			DBObject dbObj = (DBObject) o;

			coll.insert(dbObj);
			//WriteResult result = coll.insert(dbObj);

			// I actually don't know what errors this may show...
			//System.out.println(result.getError());
			return true;
		}catch(Exception e){
			ErrorLogging.logError("MongoDAO.java/commitJson()",
					"Error trying to commit the following Json to the Database", e);
		}
		return false;
	}

	//////////QUERIES
	/**
	 * Queries and returns all the events in the collection in a {@link ArrayList}
	 * @return {@link ArrayList} to all the events in the collection
	 */
	public ArrayList<GenericEvent> getAllDocuments(){
		ArrayList<GenericEvent> eventList = new ArrayList<GenericEvent>();

		DBCursor cursor = coll.find();
		try {
			while(cursor.hasNext()) {
				eventList.add(FactoryEvent.getEventFromDBObject(cursor.curr()));
			}
		}catch (Exception e){
			ErrorLogging.logError("MongoDAo.java/getAllDocuments()",
					"Error occurred when querying for all documents in the collection",
					e);
		} finally {
			cursor.close();
		}
		return eventList;
	}

	/**
	 * Queries and returns all the events from a particular type in a {@link ArrayList}
	 * 
	 * @param String type of the event to retrieve the documents for
	 * 
	 * @return {@link ArrayList} to all the events of the specified type
	 */
	public ArrayList<GenericEvent> getAllDocumentsByType(String eventType){
		ArrayList<GenericEvent> eventList = new ArrayList<GenericEvent>();

		BasicDBObject query = new BasicDBObject(EventConstants.EVENTNAME, eventType);

		DBCursor cursor = coll.find(query);

		try {
			while(cursor.hasNext()) {
				eventList.add(FactoryEvent.getEventFromDBObject(cursor.curr()));
			}
		}catch (Exception e){
			ErrorLogging.logError("MongoDAo.java/getAllDocuments()",
					"Error occurred when querying for all documents in the collection",
					e);
		} finally {
			cursor.close();
		}
		return eventList;
	}
}
