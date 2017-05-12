
/**
 * Code to be shown when the participant is invited to take part in a questionnaire
 */

  ///OPTIN COOKIE FUNCTIONS

  

  

  ////////////////Optin variables

  /**

  * States of the cookie:

  * - If not found, set it to '1' (first visit, or never answered)

  * - If found, and greater than 0, The participant agreed to the capture

  * - If 0, the user still has to reply to the optin

  * - If -1, the user has requested to never see the question again

  */ 

  var optinStateCookie = "proxyOptinStateNew";



  /**

  * The timestamp for the last time the optin was shown to the user

  */ 

  var optinLastTimeShownCookie = "proxyOptinLastTimeShownNew";



  //minimum amount of visits to wait before showing the questionnaire

  var optinMinimumVisits = 2;

  //necessary time between visits in order to be counted as visit

  var optinTimeBetweenVisits = 2400000;//40 minutes//1minute:60000;//

  //Cookie storing the timestamp of the last time we counted the user as a visit

  var optinLastVisitCookie = "proxyOptinLastVisitNew";



  //Time between optins. Before showing the optin, if the time between now and optinLastTimeShown is smaller than this, we won't show the optin

  var optinTimeBetweenOptins = 86400000;//1 day//4 minutes:240000;//


  //Are we going to show this user a first time optin
  var isFirstOptin = false;
  var firstTimeOptinCookie = "proxyOptinfirstTimeOptin";

  /**

    * Functions to modify the state of the optin

    */ 

  function optinTestAndShow(){

    if ((websiteID =="10001"|| websiteID =="10006" || websiteID =="20001") && optinTestCookie()){

      optinShow();
      
      if(getCookie(firstTimeOptinCookie)=="true" && getCookie(optinStateCookie) == 1)
        window.setTimeout(function(){writeLog_UsaProxy("optinShown&optinState=" + "-5"); }, 2000);
          else
        window.setTimeout(function(){writeLog_UsaProxy("optinShown&optinState=" + "-3"); }, 2000);

    }

  }

  

  function optinTestCookie(){

    /**

    * States of the cookie:

    * - If not found, set it to '1' (first visit since optin code has been added)

    * - If found, and greater than 0, the value corresponds to the number of visits since the optin code was added

    * - If 0, the user has already replied to the optin

    * - If -1, the user has requested to never see the question again

    */

    var optinState = getCookie(optinStateCookie);

    //The timestamp for the last time the optin was shown to the user ('0' if it was never shown)

    var optinLastTimeShown = getCookie(optinLastTimeShownCookie);

    

    //Cookie storing the timestamp of the last time we counted the user as a visit

    var optinLastVisit = getCookie(optinLastVisitCookie);

    

    

    //console.log("Testing if optin should be shown");

    //console.log("optinState:" + optinState);

    //console.log("optinLastVisit:" + optinLastVisit);

    //console.log("optinLastTimeShown:" + optinLastTimeShown);

    

    /*

    * Look for optinStateCookie

    * _if not found
    * __Roll a random number
    * _____if smaller than 0.5, set to 1, and RETURN false (First visit with optin code)
    * _____if bigger than 0.5, set to 1, set firstTimeOptinCookie = true, and RETURN true (First visit optin should show now)

    * _else if value equal to '0' (user has already replied) or '-1' (user wished not to be bothered ever again), RETURN false

    * _else if value smaller than optinMinimumVisits
    * _____ if firstTimeOptinCookie is true, and the visit count is 1, return true
    * _____ else increase optinStateCookie value by one, and RETURN false 

    * _else (the visits value is high enough)

    * ___if (timeNow - optinLastTimeShown) > optinTimeBetweenOptins, RETURN true

    * ___else increase optinStateCookie value by one, and RETURN false

    */

    

    //if not found, set to 1, and RETURN false (First visit with optin code)

    if (optinState == "null"){

      //console.log("Initialising cookies");

      setCookie(optinStateCookie, 1, cookieLife);

      setCookie(optinLastTimeShownCookie, 0, cookieLife);

      setCookie(optinLastVisitCookie, datestampInMillisec(), cookieLife);


      //It's the users' first visit, we'll roll to see if the first time optin should be shown
      var randValue = Math.random();
      console.log("First visit optin chance:" + randValue);
      if (randValue >= 0.5){
        //if true, we'll take this user as first time optin user
        setCookie(firstTimeOptinCookie, true, cookieLife);
        return true;
      }
      else
        return false;

    }

    //if value equal to '0' (user has already replied) or '-1' (user wished not to be bothered ever again), RETURN false

    else if(optinState == 0 || optinState == -1){

      return false;

    }

    else{

      //only increase optinStateCookie value by one if time since last visit was over the threshold

      if((datestampInMillisec() - optinLastVisit) > optinTimeBetweenVisits){

        optinState++;

        setCookie(optinStateCookie, optinState, cookieLife);

        //console.log("Increasing optinLastVisit:" + optinState);

      }

      setCookie(optinLastVisitCookie, datestampInMillisec(), cookieLife);

      //console.log("Storing latest optinLastVisit:" + datestampInMillisec());



      //if value smaller than optinMinimumVisits 

      if(optinState < optinMinimumVisits){

        //console.log("Visit count was not enough:" + optinState);
        
        //Check if the user was selected for first visit optin AND we are still in the first visit
        if (getCookie(firstTimeOptinCookie)=="true" && optinState == 1)
          return true;
        else
          return false;

      }

      //if the visits value is high enough

      else{

        //console.log("Visit count was enough:" + optinState);

        //if the time between the last time the optin was shown and now is great enough

        if ((datestampInMillisec() - optinLastTimeShown) > optinTimeBetweenOptins){
          
          return true;

        }

        else{

          //console.log("Time since last optin was not enough:" + optinLastTimeShown);

          return false;

        }

      }

    }

  }



  function optinInsertCSSSource(){

    var latoFont = document.createElement("link");

    latoFont.href = 'http://fonts.googleapis.com/css?family=Lato';

    latoFont.rel = 'stylesheet';

    latoFont.type = 'text/css';

    

    if (document.body.firstChild){

          document.body.insertBefore(latoFont, document.body.firstChild);

    } else {

          document.body.appendChild(latoFont);

    }

  }



  //if (isUserEligibleForOptin()){

  function optinShow(){


    //First we need to add the CSS sources we'll use

    optinInsertCSSSource();



    //main optinDiv object, containing the entire set of message and buttons

    var optinDiv = document.createElement("div");



    optinDiv.id = "optinDialog";

    optinDiv.style.position = "fixed";//"absolute";

    optinDiv.style.bottom = "20px";//"50%";//

    optinDiv.style.right = "20px";//"37.5%";//

    optinDiv.style.zIndex = "9999";

    optinDiv.style.width = "25%";

    optinDiv.style.height = "auto";

    optinDiv.style.backgroundColor = "#F5F5F5";//"#EAEAEA"//"#dddddd";//"#ffffff";//

    optinDiv.style.borderStyle = "ridge";

    optinDiv.style.fontSize = "20px";

    optinDiv.style.fontFamily = "'Lato', sans-serif";

    optinDiv.style.textAlign = "justify";

    

    //optinDiv.style.boxShadow = "10px 10px 5px rgba(0, 0, 0, 0.7)"//#888888";

    optinDiv.style.boxShadow = "10px 10px 5px rgba(102, 0, 153, 0.7)"//#888888";

    

    

    //Thicker border to make it stand out

    //#660099 is the university's logo purple colour

    optinDiv.style.border = "6px solid #660099";

    optinDiv.style.borderRadius = "10px";





    

    //university logo

    var optinLogoDiv = document.createElement("div");

    optinLogoDiv.style.display = "table-cell";

    optinLogoDiv.style.verticalAlign = "middle";

    optinLogoDiv.style.paddingRight = "5px";

    optinLogoDiv.style.paddingLeft = "5px";

    optinLogoDiv.style.paddingTop = "5px";

    optinLogoDiv.style.paddingBottom = "5px";





    var optinLogo = document.createElement("img");

    optinLogo.src = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/Logo_ManchesterEst1824.png";

    optinLogo.style.height="42px";

    optinLogo.style.maxWidth="none";

    optinLogoDiv.appendChild(optinLogo);

    optinDiv.appendChild(optinLogoDiv);



    //Title next ot the logo

    var optinTitleDiv = document.createElement("div");

    optinTitleDiv.style.display = "table-cell";

    optinTitleDiv.style.verticalAlign = "middle";

    optinTitleDiv.style.paddingRight = "5px";

    optinTitleDiv.style.paddingLeft = "5px";

    optinTitleDiv.style.paddingTop = "5px";

    optinTitleDiv.style.paddingBottom = "5px";

    optinTitleDiv.style.width = "100%"

    optinTitleDiv.style.textAlign = "center";



    optinTitleDiv.textContent = "Help us";

    optinTitleDiv.style.fontWeight = "bold";

    optinTitleDiv.style.fontSize = "150%";

    optinDiv.appendChild(optinTitleDiv);

    

    //new line to add separation between message and buttons

    var newLineDiv = document.createElement("br");

    newLineDiv.style.lineHeigth = "1px";

    //optinDiv.appendChild(newLineDiv);

    

    //main message div

    var optinMainMessageDiv = document.createElement("div");

    //optinMainMessageDiv.style.display = "table-cell";

    optinMainMessageDiv.style.verticalAlign = "middle";

    optinMainMessageDiv.style.paddingRight = "5px";

    optinMainMessageDiv.style.paddingLeft = "5px";

    optinMainMessageDiv.style.paddingTop = "5px";

    optinMainMessageDiv.style.paddingBottom = "5px";



    var optinMainMessage = document.createElement("div");

    optinMainMessage.id = "optinMainMessage";

    //document.createTextNode("Please take part in the optin, you would make a PhD student really happy");

    optinMainMessage.textContent = "Would you like to help the University of Manchester with their research? It only takes 10 seconds.";

    optinMainMessageDiv.style.verticalAlign = "middle";

    optinMainMessageDiv.style.textAlign = "center";

    //optinMainMessageDiv.style.paddingRight = "15px";

    //optinMainMessageDiv.style.paddingLeft = "15px";





    optinMainMessageDiv.appendChild(optinMainMessage);

    optinDiv.appendChild(optinMainMessageDiv);



    

    //div containing the buttons

    var buttonLineDive =  document.createElement("div");

    buttonLineDive.style.marginLeft = "auto";

    buttonLineDive.style.marginRight = "auto";

    buttonLineDive.style.width = "100%"

    buttonLineDive.style.heigth = "40px"

    buttonLineDive.style.display = "table";

    buttonLineDive.style.paddingRight = "5px";

    buttonLineDive.style.paddingLeft = "5px";

    buttonLineDive.style.paddingTop = "5px";

    buttonLineDive.style.paddingBottom = "5px";

    optinDiv.appendChild(buttonLineDive);



    //in order for display table and table-cell to obtain the effect we want (equal distribution accross the div) the button need div containers

    var agreeButtonDiv = document.createElement("div");

    agreeButtonDiv.style.fontWeight = "bold";

    agreeButtonDiv.style.display = "table-cell";

    agreeButtonDiv.style.textAlign = "center";

    

    var agreeButton = document.createElement("button");

    agreeButton.id = "optinDialogAgreeButton";

    agreeButton.textContent = "Take part in the study";

    agreeButton.onclick = optinAgreeTo;

    agreeButtonDiv.appendChild(agreeButton);

    buttonLineDive.appendChild(agreeButtonDiv);



    var rejectButtonDiv = document.createElement("div");

    rejectButtonDiv.style.fontWeight = "bold";

    rejectButtonDiv.style.display = "table-cell";

    rejectButtonDiv.style.textAlign = "center";



    var rejectButton = document.createElement("button");

    rejectButton.id = "optinDialogRejectButton";

    rejectButton.textContent = "Not now";

    rejectButton.onclick = optinNextTime;

    rejectButtonDiv.appendChild(rejectButton);

    buttonLineDive.appendChild(rejectButtonDiv);



    var rejectForeverButtonDiv = document.createElement("div");

    rejectForeverButtonDiv.style.fontWeight = "bold";

    rejectForeverButtonDiv.style.display = "table-cell";

    rejectForeverButtonDiv.style.textAlign = "center";

    rejectForeverButtonDiv.style.paddingRight = "10px";



    var rejectForeverButton = document.createElement("button");

    rejectForeverButton.id = "optinDialogRejectForeverButton";

    rejectForeverButton.textContent = "Never ask again";

    rejectForeverButton.onclick = optinRejectForever;

    rejectForeverButtonDiv.appendChild(rejectForeverButton);



    buttonLineDive.appendChild(rejectForeverButtonDiv);

    



    if (document.body.firstChild){

          document.body.insertBefore(optinDiv, document.body.firstChild);

      //console.log("inserting before");

    } else {

          document.body.appendChild(optinDiv);

          //console.log("appending before");

    }

  }



  function optinAgreeTo(){

    //alert("Agreed");

    optinMainMessage = document.getElementById("optinMainMessage");

    rejectButton = document.getElementById("optinDialogRejectButton");

    agreeButton = document.getElementById("optinDialogAgreeButton");

    rejectForeverButton = document.getElementById("optinDialogRejectForeverButton");

    

    //window.open("https://docs.google.com/forms/d/1AVeEBa9tpjvU1zpQlS6qpHQNisYWVq_UvwJtCb452yQ?sid=" + window.sessionId);
    
    //First time optin
    if(getCookie(firstTimeOptinCookie)=="true" && getCookie(optinStateCookie) == 1){
      questionnaireUrl = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/familiarityQuestionair1stTimers.html";

      window.open(questionnaireUrl + "?sid=" + sessionID + "&sd=" + window.webpageIndex);
      setCookie(firstTimeOptinCookie, true, cookieLife);
      writeLog_UsaProxy("optinShown&optinState=" + "-4");
      
    }
    
    else{
      //revisiting optin
      questionnaireUrl = "http://www.cs.man.ac.uk/~apaolaza/questionnaire/familiarityQuestionnaire.html";

      window.open(questionnaireUrl + "?sid=" + sessionID + "&sd=" + window.webpageIndex);

    }


    optinMainMessage.textContent = "Thanks for agreeing! We appreciate you taking the time";



    //write a generic event, just so it's reflected in the db

    //I will also send the cookie information about the number of visits

    writeLog_UsaProxy("optinShown&optinState=" + getCookie(optinStateCookie));

    

    //Update the state of the cookie

    //Optin shown time

    setCookie(optinLastTimeShownCookie, datestampInMillisec(), cookieLife);

    //State of the optin to '0' (answered)

    setCookie(optinStateCookie, 0, cookieLife);

    

    rejectButton.textContent = "Close";

    rejectButton.onclick = function(){

      rejectButton.parentNode.removeChild(rejectButton);

      optinDialog.parentNode.removeChild(optinDialog);

      };

    

    agreeButton.parentNode.removeChild(agreeButton);

    rejectForeverButton.parentNode.removeChild(rejectForeverButton);



  }





  function optinNextTime(){

    optinMainMessage = document.getElementById("optinMainMessage");

    rejectButton = document.getElementById("optinDialogRejectButton");

    agreeButton = document.getElementById("optinDialogAgreeButton");

    rejectForeverButton = document.getElementById("optinDialogRejectForeverButton");



    optinMainMessage.textContent = "OK, we will ask you again another time.";

    

    //write a generic event, just so it's reflected in the db

    //I will also send the cookie information about the number of visits

    writeLog_UsaProxy("optinShown&optinState=" + "-2");

    

    //Update the state of the cookie

    //Optin shown time

    setCookie(optinLastTimeShownCookie, datestampInMillisec(), cookieLife);

    

    

    rejectButton.parentNode.removeChild(rejectButton);

    agreeButton.parentNode.removeChild(agreeButton);

    rejectForeverButton.parentNode.removeChild(rejectForeverButton);

    

    setTimeout(function(){

        optinDialog = document.getElementById("optinDialog");

        optinDialog.parentNode.removeChild(optinDialog);

      }, 5000);

    

  }



  function optinRejectForever(){

    optinMainMessage = document.getElementById("optinMainMessage");

    rejectButton = document.getElementById("optinDialogRejectButton");

    agreeButton = document.getElementById("optinDialogAgreeButton");

    rejectForeverButton = document.getElementById("optinDialogRejectForeverButton");



    optinMainMessage.textContent = "Sorry to hear that, we won't ask again.";

    

      

    //write a generic event, just so it's reflected in the db

    //I will also send the cookie information about the number of visits

    writeLog_UsaProxy("optinShown&optinState=" + "-1");

    

    //Update the state of the cookie

    //Optin shown time

    setCookie(optinLastTimeShownCookie, datestampInMillisec(), cookieLife);

    //The user doesn't want to be bothered ever again, set optinState to -1

    setCookie(optinStateCookie, -1, cookieLife);

    

    rejectButton.parentNode.removeChild(rejectButton);

    agreeButton.parentNode.removeChild(agreeButton);

    rejectForeverButton.parentNode.removeChild(rejectForeverButton);

    

    setTimeout(function(){

        optinDialog = document.getElementById("optinDialog");

        optinDialog.parentNode.removeChild(optinDialog);

      }, 5000);

  }

  function optinFirstTimeAgreeTo(){
    

  }