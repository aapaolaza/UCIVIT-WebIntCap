# UCIVIT - WebIntCap #

This tool provides the means to capture Web interaction data unobtrusively, in a scalable way.

It has shown to be able to escalate to thousands of concurrent users, over periods longer than a year.

### How do I get set up? ###

1. The deployment is similar to the way other tools like Google Analytics would be deployed. The text contained in *deploymentScript.txt* needs to be copied into every page of the site.
2. An installation of MongoDB is required for the use of this tool. 
3. The file *dbAccessData.txt* needs to be completed, with the credentials corresponding to the MongoDB configuration.
4. The script *startCaptureServer.sh* starts the capture server, using the *captureServer.jar* library. This library can be recompiled using the source code provided. Once started through a terminal, processed events will be continuously listed.


### Who do I talk to? ###

This tool is based in UsaProxy, developed by the group of Richard Atterer http://fnuked.de/usaproxy/

###Publications###
These are relevant publications related to this tool:
*
*
*

###Contact###
For questions, or help using this tool, contact Aitor Apaolaza (aitor.apaolaza@manchester.ac.uk)