package usaproxy;

import java.net.UnknownHostException;

import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;

public class MongoDAO {

	public final String DATABASEIP = "localhost";
	public final String DATABASEIPNAME = "testdb";
	public final String DATABASECOLLECTION = "events";

	public static MongoClient mongoClient;
	public static DB db;
	public static DBCollection coll;

	private MongoDAO() throws UnknownHostException {
		mongoClient = new MongoClient(DATABASEIP);

		db = mongoClient.getDB(DATABASEIPNAME);
		coll = db.getCollection(DATABASECOLLECTION);
	}

	public static MongoDAO MongoDAO() {
		try {
			return new MongoDAO();
		} catch (UnknownHostException e) {
			ErrorLogging.logError("MongoDAO.java/MongoDAO()",
					"Error initializing the MongoDAO object", e);
		}
		return null;
	}

	public boolean commitJson(String jsonString) {

		System.out.println("MongoDAO/commitJson(): Storing the following Json: " + jsonString);
		Object o = com.mongodb.util.JSON.parse(jsonString);
		DBObject dbObj = (DBObject) o;

		coll.insert(dbObj);
		//WriteResult result = coll.insert(dbObj);

		// I actually don't know what errors this may show...
		//System.out.println(result.getError());
		return true;
	}

}
