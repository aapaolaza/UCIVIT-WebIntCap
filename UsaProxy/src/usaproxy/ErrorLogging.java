package usaproxy;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Class ErrorLogging receives errors occurred throughout the project and logs
 * them into a text file, so they don't get lost among the console messages
 */
public class ErrorLogging {

	private final static String filename = "errorLog.txt";

	private final static String errorSeparator = "\n---------------------------------------------------------------\n";

	/**
	 * Logs and error message in a text file so it doesn't get lost among the
	 * console messages. There is no need to think about styling or formatting
	 * (no \n) as the function will style it in its own way
	 * 
	 * @param sourceFuntion
	 *            The name of the function calling the error, if possible,
	 *            include the name of the source file before the function.
	 * @param errorComment
	 *            Comments about the error to be printed, such as situations
	 *            under which is happening
	 * @param errorSystemMessage
	 *            Supposing this error is happening under a catch statement, the
	 *            error produced by the system. Otherwise just state it wasn't a
	 *            system error
	 */

	public static void logError(String sourceFuntion, String errorComment,
			String errorSystemMessage) {
		/** Open a stream to the error log file. */
		try {
			
			FileOutputStream fos = new FileOutputStream(new File(filename), true);

			String errorToLog = errorSeparator;
			
			SimpleDateFormat sdf = new SimpleDateFormat(
					"MM/dd/yyyy HH:mm:ss.SSS");
			Date dt = new Date();
			String timeStamp = sdf.format(dt);
			
			errorToLog += timeStamp + ": " + sourceFuntion + ":\n" + errorComment
					+ "\n The system error message was:\n" + errorSystemMessage;
			errorToLog += errorSeparator;

			fos.write(errorToLog.getBytes());
			fos.flush();
			fos.close();

		} catch (IOException e) {
			System.err
					.println("\nAn ERROR occured: error log file not found:\n"
							+ e);

		}

	}

}
