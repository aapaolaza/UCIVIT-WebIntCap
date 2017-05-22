package usaproxy;

import java.io.*;
import java.net.*;
import java.security.Security;
import java.util.Properties;

import javax.net.ssl.SSLServerSocket;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.TrustManager;
import com.sun.net.ssl.internal.ssl.Provider;

/**
 * UCIVIT - https://github.com/aapaolaza/UCIVIT-WebIntCap/
 */
public class UsaProxy {

	/** UsaProxy port. */
	private int port;
	/** UsaProxy IP address. */
	private InetAddress ip;
	/**
	 * The UsaProxy deployment mode: regular proxy, proxy which forwards
	 * requests to another proxy, or server module.
	 */
	private Mode mode;
	/**
	 * Is responsible for the delivery of UsaProxy-specific files such as the
	 * tracking JavaScript.
	 */
	private FileSender fileSender;

	/**
	 * Provides methods for the management of exchanged interactions/events and
	 * for synchronized event logging to a file.
	 */
	private EventManager eventManager;
	/**
	 * Manages the httptrafficindex which references the corresponding txt-file
	 * containing the recorded HTTP request/response combination.
	 */
	private HTTPTraffic httpTraffic;
	/**
	 * manages users and the collaboration sessions which they participate in.
	 */
	private Users users;

	/** True if storage of user actions to a log file is enabled */
	private boolean isLogging;
	/**
	 * Defines if all events are logged ("all") or only the web page requests
	 * ("pagereq")
	 */
	private String logMode;

	/** The UsaProxy instance ID */
	private String id;

	/** If true all <code>System.out.println</code> messages are printed. */
	final static boolean DEBUG = false;

	/**
	 * When the tool in a Web site that uses the HTTPS protocol, this parameter
	 * needs to be set to true
	 */
	private boolean isHTTPS = false;
	
	/**
	 * If the server needs to be bound to a particular IP address. Empty otherwise
	 */
	private String bindIP = "";

	/**
	 * Constructor: creates a UCIVIT instance on a specific port and IP address
	 * 
	 * @param port
	 *            is the port the UsaProxy will run on
	 * @param mode
	 *            represents the deployment mode of UsaProxy
	 * @param rm
	 *            is true, if asymmetric remote monitoring mode must be enabled
	 * @param sb
	 *            is true, if symmetric shared browsing mode must be enabled
	 * @param isLogging
	 *            defines if logging of events is enabled
	 * @param logMode
	 *            specifies the type of logging (e.g. "all": full logging,
	 *            "pagereq": only page requests)
	 * @param id
	 *            is the name of this UsaProxy instance
	 * @param isHTTPS
	 *            indicates if the server should use the HTTPS protocol
	 * @param bindIP
	 *            empty by default, a string with an IP adress can be provided for the server to be bound to
	 */
	public UsaProxy(int port, Mode mode, boolean isLogging, String logMode, String id,
			boolean isHTTPS, String bindIP) {

		this.port = port;
		this.mode = mode;
		this.isLogging = isLogging;
		this.logMode = logMode;
		this.id = id;
		this.isHTTPS = isHTTPS;
		this.bindIP = bindIP;

		/** start UsaProxy-Server */
		proxyStart();

	}

	/**
	 * Starts the UsaProxy application. The global manager objects are defined
	 * and a <code>ServerSocket</code> object is generated according to the
	 * UsaProxy IP and port information. In an endless loop UsaProxy accepts
	 * incoming connections and assigns each an individual processing thread
	 * (i.e. <code>ClientRequest</code>)
	 */
	private void proxyStart() {

		/** Display message */

		fileSender = new FileSender();
		eventManager = new EventManager(this);
		httpTraffic = new HTTPTraffic();
		users = new Users();

		try {

			// If the HTTPS mode is activated, the server Socket will use HTTPS
			// protocol.
			if (isHTTPS) {
				System.out.println("Starting Capture server in HTTPS mode");
				int intSSLport = this.port; // Port where the SSL Server needs
											// to listen for new requests from
											// the client
				Properties prop=null;
				{
					// Registering the JSSE provider
					Security.addProvider(new Provider());

					prop = new Properties();
					InputStream input = null;
					try{
						input = new FileInputStream("connectionData.txt");
					}catch (FileNotFoundException e) {
						System.out.println("Could not initialise SSL. Does the connectionData.txt file exist?");
						e.printStackTrace();
					}
					prop.load(input);

					// Specifying the Keystore details
					System.setProperty("javax.net.ssl.keyStore", prop.getProperty("keyStore"));
					System.setProperty("javax.net.ssl.keyStorePassword", prop.getProperty("keyStorePassword"));

					// Enable debugging to view the handshake and communication
					// which happens between the SSLClient and the SSLServer
					// System.setProperty("javax.net.debug","all");
				}

		        //Testing if the keystore exists
		        File varTmpDir = new File(prop.getProperty("keyStore"));
		        System.out.println("Does the keystore file ("+prop.getProperty("keyStore") +") exist?" + varTmpDir.exists());

				// Initialize the Server Socket
				SSLServerSocket sslServerSocket = null;
				try{
					SSLServerSocketFactory sslServerSocketfactory = (SSLServerSocketFactory) SSLServerSocketFactory
							.getDefault();
					
					//Add the bindIP
					if (this.bindIP!=""){
						InetAddress addr = InetAddress.getByName(this.bindIP);
						sslServerSocket = (SSLServerSocket) sslServerSocketfactory
								.createServerSocket(intSSLport, 200, addr);
					}
					else{
						sslServerSocket = (SSLServerSocket) sslServerSocketfactory
								.createServerSocket(intSSLport);
					}
					
				}catch (Exception e) {
					System.out.println("Error initialising SSL. Is the keystore configuration correct? Check pass");
					e.printStackTrace();
				}
				
				try {
					this.ip = java.net.InetAddress.getLocalHost();
				} catch (UnknownHostException e) {
					System.err.println("\nAn ERROR occured while retrieving UsaProxy IP address:\n" + e);

					ErrorLogging.logError("UsaProxy.java: UsaProxy()", "ERROR occured while retrieving UsaProxy IP address", e);

					System.exit(1);
				}

				while (true) {
					/** wait for next incoming request and accept it */
					SSLSocket clientConnect = (SSLSocket) sslServerSocket.accept();

					/** Display message: new client with his address */
					if (DEBUG)
						System.out
								.println("\nNew client connected:\n" + clientConnect.getInetAddress().getHostAddress());

					try {
						/** new ClientRequest which will handle this request */
						new ClientRequest(clientConnect, this);

					} catch (IOException e) {
						ErrorLogging.logError("UsaProxy.java: proxyStart()", "ClientRequest timed out\n" + "port: "
								+ clientConnect.getPort() + "," + "InetAddress: " + clientConnect.getInetAddress(), e);
					}
				}
			}
			// If not, server initialisation continues with regular HTTP
			// protocol.
			else {

				/** Create server socket */
				// ServerSocket server = new ServerSocket(port);
				// we increase the maximum size of the queue, the default size
				// is
				// 50. I will try with 200 for the time being
				//ServerSocket server = new ServerSocket(port, 200);
				
				ServerSocket server = null;
				//Add the bindIP
				if (this.bindIP!=""){
					InetAddress addr = InetAddress.getByName(this.bindIP);
					server = new ServerSocket(this.port, 200, addr);
				}
				else{
					server = new ServerSocket(port, 200);
				}
				

				try {
					this.ip = java.net.InetAddress.getLocalHost();
				} catch (UnknownHostException e) {
					System.err.println("\nAn ERROR occured while retrieving UsaProxy IP address:\n" + e);

					ErrorLogging.logError("UsaProxy.java: UsaProxy()", "ERROR occured while retrieving UsaProxy IP address", e);

					System.exit(1);
				}
				
				/** Display start message */
				System.out.println("UsaProxy started at port " + port + " on IP: " + this.ip);
				
				System.out.println("Simple logging mode without joint experience");
				
				System.out.println("Logging: "
						+ (isLogging ? (logMode.equals("pagereq") ? "on (only page requests)" : "on") : "off"));
				System.out.println("UsaProxy ready for accepting incoming connections !\n");

				ErrorLogging.logCriticalError("UsaProxy.java:proxyStart()", "UsaProxy tool started", null);

				
				/** endless loop */
				while (true) {

					/** wait for next incoming request and accept it */
					Socket clientConnect = server.accept();

					/** Display message: new client with his address */
					if (DEBUG)
						System.out
								.println("\nNew client connected:\n" + clientConnect.getInetAddress().getHostAddress());

					try {
						/** new ClientRequest which will handle this request */
						new ClientRequest(clientConnect, this);

					} catch (IOException e) {
						ErrorLogging.logError("UsaProxy.java: proxyStart()", "ClientRequest timed out\n" + "port: "
								+ clientConnect.getPort() + "," + "InetAddress: " + clientConnect.getInetAddress(), e);
					}
				}
			}
			/** Handle IO exception */
		} catch (IOException e) {
			System.err.println("\nAn ERROR occured while starting UsaProxy:\n" + e);

			ErrorLogging.logError("UsaProxy.java: proxyStart()", "ERROR occured while starting UsaProxy", e);

			System.exit(1);
		}
	}

	/**
	 * Creates a new UsaProxy instance with a number of
	 * deployment/sharing/logging modes specified by command line switches.
	 * Depending on command line arguments the respective proxy type (e.g.
	 * server-side setup) and operation mode (e.g. pure logging, shared
	 * browsing) are instantiated
	 */
	public static void main(String[] args) {

		/**
		 * Command line switches: -port <port> is the UsaProxy port the client
		 * is contacting (optional; default: 8000) -remoteIP <IP address> is the
		 * address of the gateway proxy resp. web server UsaProxy always
		 * forwards requests to -remotePort <port> is the gateway's resp. web
		 * server's port (in combination with switch -remoteIP!) -server starts
		 * UsaProxy in server mode (in combination with switches -remoteIP and
		 * -remotePort!) -rm starts UsaProxy in Remote Monitoring mode
		 * (exclusive) -sb starts UsaProxy in Shared Browsing mode (exclusive)
		 * -log enables logging of events into log.txt (additional or
		 * stand-alone) -logMode pagereq|all specifies logging mode, e.g. all
		 * events ("all"), only httptraffic log entries/ page requests
		 * ("pagereq") (optional; default: all) -id <id> identifies the UsaProxy
		 * instance (useful for distinguishing between versions and
		 * authentication of users); default: undefined
		 */

		/**
		 * UsaProxy modes: Proxy no switches mandatory (e.g. java UsaProxy
		 * [-port <port>]) Remote (all requests are forwarded to another gateway
		 * proxy) switches -remoteIP and -remotePort mandatory (e.g. java
		 * UsaProxy [-port <port>] -remoteIP <IP address> -remotePort <port>)
		 * Transparent see "Proxy" Transparent Remote see "Remote" Server
		 * (UsaProxy as part of a web server resp. in front of a web server)
		 * switches -remoteIP, -remotePort and -server mandatory (e.g. java
		 * UsaProxy [-port <port>] -remoteIP <IP address> -remotePort
		 * <port> -server
		 */

		int index;

		/** switch -port */
		/** default UsaProxy port */
		int port = 8000;
		/** try to detect port declaration and port */
		if ((index = indexOf(args, "-port")) != -1) {
			try {
				port = Integer.parseInt(args[index + 1]);
			} catch (NumberFormatException e) {
				System.err.println("\nAn ERROR occured while binding UsaProxy to port " + args[index + 1] + ":\n"
						+ "Correct usage of switch -port: -port <port>\n" + "Port will be set to 8000!");
			} catch (IndexOutOfBoundsException e) {
				System.err.println(
						"\nAn ERROR occured while binding UsaProxy to a port:\n" + "No port number specified!\n"
								+ "Correct usage of switch -port: -port <port>\n" + "Port will be set to 8000!");
			}
		}

		/** switches -remoteIP and -remotePort */
		String remoteIP = "";
		int remotePort = -1;
		/** try to detect remoteIP declaration and remotePort */
		if ((index = indexOf(args, "-remoteIP")) != -1) {
			try {
				remoteIP = args[index + 1];
			} catch (IndexOutOfBoundsException e) {
				System.err.println("\nAn ERROR occured while defining remoteIP:\n" + "No remoteIP specified!\n"
						+ "Correct usage of switch -port: -remoteIP <IP address>\n"
						+ "UsaProxy will be started as regular proxy on port " + port + "!");
			}
		}

		/** try to detect remote port declaration and port */
		if ((index = indexOf(args, "-remotePort")) != -1) {
			if (!remoteIP.equals("")) {
				try {
					remotePort = Integer.parseInt(args[index + 1]);

				} catch (NumberFormatException e) {
					System.err.println("\nAn ERROR occured while defining remotePort " + args[index + 1] + ":\n"
							+ "Correct usage of switch -remotePort: -remotePort <port>\n"
							+ "UsaProxy will be started as regular proxy on port " + port + "!");
				} catch (IndexOutOfBoundsException e) {
					System.err
							.println("\nAn ERROR occured while defining a remotePort:\n" + "No port number specified!\n"
									+ "Correct usage of switch -remotePort: -remotePort <port>\n"
									+ "UsaProxy will be started as regular proxy on port " + port + "!");
				}
				/** remotePort specified without specified remoteIP */
			} else {
				System.err.println("\nAn ERROR occured while defining remotePort:\n" + "No remoteIP specified!\n"
						+ "To correctly use switch -remotePort also specify switch -remoteIP!\n"
						+ "UsaProxy will be started as regular proxy on port " + port + "!");
			}
		}

		/** if remoteIP specified without specified remotePort */
		if (!remoteIP.equals("") && remotePort == -1) {
			/** reset remoteIP */
			remoteIP = "";
			System.err.println("\nAn ERROR occured while defining remoteIP:\n" + "No remotePort specified!\n"
					+ "To correctly use switch -remoteIP also specify switch -remotePort!\n"
					+ "UsaProxy will be started as regular proxy on port " + port + "!");
		}

		/** generate remote InetAddress if remoteIP and remotePort specified */
		InetAddress remoteAddress = null;
		if (!remoteIP.equals("") && remotePort != -1) {
			try {
				remoteAddress = InetAddress.getByName(remoteIP);
			} catch (UnknownHostException e) {
				System.err.println("\nAn ERROR occured while generating remote InetAddress:\n"
						+ "Please specify a valid IP address !\n" + "UsaProxy will be started as regular proxy on port "
						+ port + "!");

			}
		}

		/** switch -server */
		boolean server = false;
		/** try to detect server declaration */
		if ((index = indexOf(args, "-server")) != -1) {
			if (!remoteIP.equals("") && remotePort != -1) {
				server = true;
				/**
				 * server mode specified without specified remoteIP resp.
				 * remotePort
				 */
			} else {
				/** reset remoteIP and remotePort */
				remoteIP = "";
				remotePort = -1;
				System.err.println("\nAn ERROR occured while specifying server mode:\n"
						+ "No remoteIP resp. remotePort specified!\n"
						+ "To correctly use switch -server also specify switches -remoteIP and -remotePort!\n"
						+ "UsaProxy will be started as regular proxy on port " + port + "!");
			}
		}

		/** switch -rm */
		boolean rm = false;
		/** try to detect rm declaration */
		if ((index = indexOf(args, "-rm")) != -1) {
			rm = true;
		}

		/** switch -sb */
		boolean sb = false;
		/** try to detect sb declaration */
		if ((index = indexOf(args, "-sb")) != -1) {
			if (!rm) {
				sb = true;
			}
			/** also rm specified; combination not possible */
			else {
				System.err.println("\nAn ERROR occured while specifying shared browsing mode:\n"
						+ "Also Remote Monitoring mode specified!\n" + "-rm and -sb must be used exclusively!\n"
						+ "UsaProxy will be started in Remote Monitoring mode!");
			}
		}

		/** switch -log */
		boolean log = false;
		/** try to detect log declaration */
		if ((index = indexOf(args, "-log")) != -1) {
			log = true;
		}

		/** check further log parameters */
		String logMode = "";
		/** try to detect logMode specification */
		if (log) {
			/** if additional parameter exists */
			if (args.length > (index + 1) && !args[index + 1].startsWith("-"))
				logMode = args[index + 1];
		}

		/**
		 * set logMode = "all" if logging is enabled but no logMode parameter
		 * was specified
		 */
		if (log && logMode.equals(""))
			logMode = "all";

		/**
		 * if neither a sharing mode nor a log mode were specified full logging
		 * is enabled
		 */
		if (!log && !rm && !sb) {
			log = true;
			logMode = "all";
		}

		/** switch -id */
		String id = "";
		/** try to detect id declaration */
		if ((index = indexOf(args, "-id")) != -1) {
			try {
				id = args[index + 1];
			} catch (IndexOutOfBoundsException e) {
				System.err.println("\nAn ERROR occured while defining UsaProxy ID:\n" + "No ID specified!\n"
						+ "Correct usage of switch -id: -id <id>\n" + "UsaProxy will be started with ID: undefined !");
			}
		}

		System.out.println("Trying to start UsaProxy at port: " + port);

		/** generate a mode instance */
		Mode mode;
		/** if remote (remote, transparent remote, or server) */
		if (!remoteIP.equals("")) {
			if (server) {
				mode = new ServerMode(remoteAddress, remotePort);
				System.out.println("Deployment: server-side mode");
			} else {
				mode = new RemoteMode(remoteAddress, remotePort);
				System.out.println("Deployment: forwarding to remote gateway");
			}
			/** no remote info (regular or transparent) */
		} else {
			mode = new ProxyMode();
			System.out.println("Deployment: regular/transparent proxy mode");
		}

		/** Check if the server should be https or not */
		boolean httpsMode = false;
		/** try to detect server declaration */
		if ((index = indexOf(args, "-ishttps")) != -1) {
			httpsMode = Boolean.valueOf(args[index + 1].toString());
		}


		/** Check if the server socket should bind to a particular IP*/
		String bindIP = null;
		/** try to detect server declaration */
		if ((index = indexOf(args, "-bindIP")) != -1) {
			bindIP = args[index + 1].toString();
		}
		
		/** generate an UsaProxy instance */
		new UsaProxy(port, mode, log, logMode, id, httpsMode,bindIP);

	}

	/**
	 * Returns the respective <code>Mode</code> implementation.
	 * 
	 * @return the proxy mode.
	 */
	public Mode getMode() {
		return mode;
	}

	/**
	 * Returns the <code>EventManager</code> object which manages the logging
	 * and delivering of user events.
	 * 
	 * @return the <code>EventManager</code> instance.
	 */
	public EventManager getEventManager() {
		return eventManager;
	}

	/**
	 * Returns the <code>FileSender</code> object which encloses the file
	 * delivery mechanism.
	 * 
	 * @return the <code>FileSender</code> instance.
	 */
	public FileSender getFileSender() {
		return fileSender;
	}

	/**
	 * Returns the <code>HTTPTraffic</code> object which manages the caching of
	 * server responses together with the corresponding request and response
	 * headers.
	 * 
	 * @return the HttpTraffic instance.
	 */
	public HTTPTraffic getHttpTraffic() {
		return httpTraffic;
	}

	/**
	 * Returns the UsaProxy port number.
	 * 
	 * @return the port.
	 */
	public int getPort() {
		return port;
	}

	/**
	 * Returns the UsaProxy IP address.
	 * 
	 * @return the ip.
	 */
	public InetAddress getIP() {
		return ip;
	}

	/**
	 * Returns the <code>Users</code> object which manages the users
	 * participating (or not yet participating) in a shared session.
	 * 
	 * @return the <code>Users</code> instance.
	 */
	public Users getUsers() {
		return users;
	}

	/**
	 * Returns true if event logging is enabled.
	 * 
	 * @return true in case UsaProxy logs occured user events.
	 */
	public boolean isLogging() {
		return isLogging;
	}

	/**
	 * Returns the logging mode.
	 * 
	 * @return "all" if every user event is logged, if only page requests are
	 *         logged, then "pagereq" is available
	 */
	public String getLogMode() {
		return logMode;
	}

	/**
	 * Returns the individual UsaProxy ID. For security reasons, this ID must
	 * accompany each special JavaScript (proxyscript.js) request. In addition,
	 * it is applied to the remote monitoring URL and to the setAdmin request.
	 * 
	 * @return the UsaProxy ID.
	 */
	public String getId() {
		return id;
	}

	/**
	 * Returns the index of the specified string in the corresponding array.
	 * 
	 * @param array
	 *            is the string array to examine
	 * @param value
	 *            is the string to search for
	 * @return the integer position in the array if some antry maps to the value
	 *         argument in this array, -1 otherwise
	 */
	public static int indexOf(String[] array, String value) {
		int index = -1;
		for (int i = 0; i < array.length; i++) {
			if (array[i] != null && array[i].equals(value)) {
				index = i;
				return index;
			}
		}
		return index;
	}

}
