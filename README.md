# UCIVIT - WebIntCap #

This tool provides the means to capture Web interaction data unobtrusively, in a scalable way.

It has shown to be able to escalate to thousands of concurrent users, over periods longer than a year.

### How do I get set up? ###

1. The deployment is similar to the way other tools like Google Analytics would be deployed. The text contained in *deploymentScript.txt* needs to be copied into every page of the site.
2. An installation of MongoDB is required for the use of this tool. 
3. The file *dbAccessData.txt* needs to be completed, with the credentials corresponding to the MongoDB configuration.
4. The script *startCaptureServer.sh* starts the capture server, using the *captureServer.jar* library. This library can be recompiled using the source code provided. Once started through a terminal, processed events will be continuously listed.


###Contact###
This tool is based in UsaProxy, developed by the group of Richard Atterer http://fnuked.de/usaproxy/

For questions, or help using this tool, contact Aitor Apaolaza (aitor.apaolaza@manchester.ac.uk)

###Publications###
The design of this tool supported the following publications:
* *Understanding users in the wild* in the Proceedings of the 10th International Cross-Disciplinary Conference on Web Accessibility.
* *Identifying emergent behaviours from longitudinal web use* in the Proceedings of the adjunct publication of the 26th annual ACM symposium on User interface software and technology
* *Longitudinal analysis of low-level Web interaction through micro behaviours* in the Proceedings of the 26th ACM Conference on Hypertext & Social Media

###Acknowledgements###
This work was supported by the Engineering and Physical Sciences Research Council [EP/I028099/1].
