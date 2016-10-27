# UCIVIT - WebIntCap

This tool provides the means to capture Web interaction data unobtrusively, in a scalable way.

It has shown to be able to escalate to thousands of concurrent users, over periods longer than a year.

## How do I get set up?

### 1 Install MongoDB

An installation of [MongoDB](https://www.mongodb.com/download-center) is required for the tool.

Then the file dbAccessData.txt needs to be completed. The content (below) has default options for a deployment of a server in the local computer. *USER* and *PASSWORD* can be completed if required. They can be left empty if MongoDB has not been configured to require credentials.

```
IP=localhost
DBNAME=ucivitdb
EVENTSCOLL=events
DOMCOLL=domcollection
DOMCHANGECOLL=value
DOMTEMPCOLL=domtempcollection
USER=
PASSWORD=
```

### 2 Deploy script into your Web site

First, open the *deploymentScript.txt* file in any text editor. The following lines need to be modified:

```
window.webpageIndex = 'WEBSITEID';
window.usaProxyServerIP = 'CAPTURESERVERADDRESS:2727';
window.protocol = PROTOCOL.HTTP;
```

**WEBSITEID** can be any string. I recommend using a number code, such as '10003'.

**CAPTURESERVERADDRESS** needs to be changed to the IP (or dns) of the computer where the server is deployed. *2727* is the default port, if changed, it needs to be changed in *startCaptureServer.sh* as well (see next step).

**PROTOCOL.HTTP** determines if the tool will use HTTP or HTTPS protocol. HTTP is used by default.

After that, the full text from *deploymentScript.txt* needs to be pasted into every Web page of the Web site to track, inside the ```<head>``` tag of the html document.

Example of possible deployment:

```html
<head>
  <!-- usaProxy script start -->
  <script type="text/javascript">
    <!-- FULL CONTENT FROM deploymentScript.txt -->
  </script>
  <!-- usaProxy script end -->
</head>
<body>
  <!-- REST OF THE PAGE -->
</body>
```

### 3 Start server

The *startCaptureServer.sh* script starts the server with some default settings:

```
java -jar captureServer.jar -port 2727 -log
```

*OPTIONAL* The content can be replaced with the following to activate the HTTPS protocol:

```
java -jar captureServer.jar -ishttps true -port 2727 -log
```

This library can be recompiled using the source code provided in the [src/usaproxy/](src/usaproxy/) folder. Once started through a terminal, processed events will be continuously listed.

## Contact

This tool is based in UsaProxy, developed by the group of Richard Atterer <http://fnuked.de/usaproxy/>

For questions, or help using this tool, contact Aitor Apaolaza (aitor.apaolaza@manchester.ac.uk)

## Publications

The design of this tool supported the following publications:

* *Understanding users in the wild* in the Proceedings of the 10th International Cross-Disciplinary Conference on Web Accessibility.
* *Identifying emergent behaviours from longitudinal web use* in the Proceedings of the adjunct publication of the 26th annual ACM symposium on User interface software and technology
* *Longitudinal analysis of low-level Web interaction through micro behaviours* in the Proceedings of the 26th ACM Conference on Hypertext & Social Media

## Acknowledgements

This work was supported by the Engineering and Physical Sciences Research Council [EP/I028099/1].
