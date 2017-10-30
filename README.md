# UCIVIT - WebIntCap

This tool provides the means to capture Web interaction data unobtrusively, in a scalable way.

It has shown to be able to escalate to thousands of concurrent users, over periods longer than a year.

## How do I get set up?

### 1 Install MongoDB

An installation of [MongoDB](https://www.mongodb.com/download-center) is required for the tool.

Then the file *dbAccessData.js* needs to be completed. The content (below) has default options for a deployment of a server in the local computer. *DBUSERNAME* and *DBPASSWORD* can be completed if required. They can be left unmodified if MongoDB has not been configured to require credentials.

```
module.exports.mongoPath = 'localhost/ucivitdb';
module.exports.mongoTestPath = 'localhost/ucivittest';
module.exports.mongoAuthenticateDB = 'admin';// DO NOT CHANGE
module.exports.mongoUser = 'DBUSERNAME';
module.exports.mongoPass = 'DBPASSWORD';
```

Once the server is running, a quick way of testing if the events are being captured and stored correctly is running the following code in the terminal. NOTE: this code assumes MongoDB has been properly installed, the *mongo* function is available, and no authentication has been configured for the database.

The following code:

1. Connects to a local MongoDB installation
1. Switches to the default UCIVIT database
1. Counts the number of events recorded so far
1. Shows the formatted information for the last captured event

```
mongo
use ucivitdb
db.events.find().count()
db.events.find().sort({"timestamp":-1}).limit(1).pretty()
```

### 2 Deploy script into your Web site

First, open the *deploymentScript.html* file in any text editor. The following lines need to be modified:

```
ucivitOptions.webpageIndex = 'WEBSITEID';
ucivitOptions.serverIP = 'CAPTURESERVERADDRESS:2727';
ucivitOptions.isDOMrecorded = false;
ucivitOptions.protocol = PROTOCOL.HTTP;
```

**WEBSITEID** can be any string. I recommend using a number code, such as '10003'.

**CAPTURESERVERADDRESS** needs to be changed to the IP (or dns) of the computer where the server is deployed. *2727* is the default port, if changed, it needs to be changed in *startCaptureServer.sh* as well (see next step).

**isDOMrecorded** tells the tool if a copy of the Web page's DOM needs to be stored. This allows you to be able to recreate the actual interaction environment of the user.

**PROTOCOL.HTTP** determines if the tool will use HTTP or HTTPS protocol. HTTP is used by default.

After that, the full text from *deploymentScript.html* needs to be pasted into every Web page of the Web site to track, inside the ```<head>``` tag of the html document.

Example of possible deployment:

```html
<head>
  <!-- ucivit script start -->
  <script type="text/javascript">
    <!-- FULL CONTENT FROM deploymentScript.html -->
  </script>
  <!-- ucivit script end -->
</head>
<body>
  <!-- REST OF THE PAGE -->
</body>
```

### 3 Start server

The *startCaptureServer.sh* script starts the server with some default settings:

```
start cmd.exe /k mongod --rest --bind_ip 127.0.0.1
npm start
```

## Test page

The following page allows you to check that the server is working correctly. Just download it from [here](https://github.com/aapaolaza/UCIVIT-WebIntCap/blob/master/webpage_example.html) and run it locally, or access it remotely from [here](http://rawgit.com/aapaolaza/UCIVIT-WebIntCap/master/webpage_example.html), change the IP address (localhost by default), and press "Set parameters and start tracking" to test the capture script.


## Contact

This tool was originally based in UsaProxy, developed by the group of Richard Atterer <http://fnuked.de/usaproxy/>

For questions, or help using this tool, contact Aitor Apaolaza (aitor.apaolaza@manchester.ac.uk)

## Publications

The design of this tool supported the following publications:

* *Understanding users in the wild* in the Proceedings of the 10th International Cross-Disciplinary Conference on Web Accessibility.
* *Identifying emergent behaviours from longitudinal web use* in the Proceedings of the adjunct publication of the 26th annual ACM symposium on User interface software and technology
* *Longitudinal analysis of low-level Web interaction through micro behaviours* in the Proceedings of the 26th ACM Conference on Hypertext & Social Media

## Acknowledgements

This work was supported by the Engineering and Physical Sciences Research Council [EP/I028099/1].