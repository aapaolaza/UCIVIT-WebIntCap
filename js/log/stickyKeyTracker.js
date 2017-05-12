
  /** Detects key combinations: first part - key down
   * flags are set in the case that shift, ctrl, or alt is pressed
   * in case any og those flags is true, a combination is detected and logged.  */

  function processKeydown_UsaProxy(e) {

    /* get keycode
    * IE: first case (window.event available); NS: second case */

    var evtobj 				= window.event ? window.event : e;
    var KeyID 				= evtobj.which ? evtobj.which : evtobj.keyCode;

    FLG_ctrl_comb_UsaProxy 	= false;	// "ctrl key pressed" combinations flag

    switch(KeyID)

    {

      // if shift is pressed

      case 16:		

        FLG_comb_UsaProxy = false;			// reset combination flag

        combMembers_UsaProxy = 0;			// reset combination members

        FLG_shiftPressed_UsaProxy = true;	// set "shift key pressed" flag

        FLG_keyPress_UsaProxy = false;		// keypress-event blocked (keypress event is blocked)

        return false;

      // if ctrl is pressed

      case 17:		

        FLG_comb_UsaProxy = false;			// reset combination flag

        combMembers_UsaProxy = 0;			// reset combination members

        FLG_ctrlPressed_UsaProxy = true;	// set "ctrl key pressed" flag

        FLG_keyPress_UsaProxy = false;		// keypress-event blocked

        return false;


      // if alt is pressed

      case 18:		

        FLG_comb_UsaProxy = false;			// reset combination flag

        combMembers_UsaProxy = 0;			// reset combination members

        FLG_altPressed_UsaProxy = true;		// set "alt key pressed" flag

        FLG_keyPress_UsaProxy = false;		// keypress-event blocked

        return false;

    }

    

    /** the following code is only executed for the character key in a key combination */

    

    /** combination check: if shift-char combination */

    if (FLG_shiftPressed_UsaProxy) {			// if shift was already pressed: keyID holds the char which follows shift

      keyName_UsaProxy = "shift+" + String.fromCharCode(KeyID);	// Select capital

      FLG_comb_UsaProxy = true;		// set key combination flag

      combMembers_UsaProxy = 2;	// 2 keys pressed

    }

    /** combination check: if ctrl-char combination */

    if (FLG_ctrlPressed_UsaProxy) {

      switch(KeyID) {		// if ctrl was already pressed: keyID holds the char which follows ctrl

        case 65: keyName_UsaProxy = "ctrl+a"; break;	// Select Alls command

        case 66: keyName_UsaProxy = "ctrl+b"; break;	// Edit bookmarks command

        case 67: keyName_UsaProxy = "ctrl+c"; break;	// Copy command

        case 68: keyName_UsaProxy = "ctrl+d"; break;	// Add bookmark command

        case 69: keyName_UsaProxy = "ctrl+e"; break;

        case 70: keyName_UsaProxy = "ctrl+f"; break;	// Find command

        case 71: keyName_UsaProxy = "ctrl+g"; break;	// NS: find Again command

        case 72: keyName_UsaProxy = "ctrl+h"; break;	// NS: open history command

        case 73: keyName_UsaProxy = "ctrl+i"; break;	// NS: page info command

        case 74: keyName_UsaProxy = "ctrl+j"; break;	// NS: downloads box

        case 75: keyName_UsaProxy = "ctrl+k"; break;	// NS: google search bar

        case 76: keyName_UsaProxy = "ctrl+l"; break;	// IE: open command

        case 77: keyName_UsaProxy = "ctrl+m"; break;	

        case 78: keyName_UsaProxy = "ctrl+n"; break;	// IE: new window NS: new message command

        case 79: keyName_UsaProxy = "ctrl+o"; break;	// Open command

        case 80: keyName_UsaProxy = "ctrl+p"; break;	// Print command

        case 81: keyName_UsaProxy = "ctrl+q"; break;	// NS: exit command

        case 82: keyName_UsaProxy = "ctrl+r"; break;	// Reload command

        case 83: keyName_UsaProxy = "ctrl+s"; break;	// Save command

        case 84: keyName_UsaProxy = "ctrl+t"; break;	

        case 85: keyName_UsaProxy = "ctrl+u"; break;	// NS: page source command

        case 86: keyName_UsaProxy = "ctrl+v"; break;	// Paste command

        case 87: keyName_UsaProxy = "ctrl+w"; break;	// Close command

        case 88: keyName_UsaProxy = "ctrl+x"; break;	// Cut command

        case 89: keyName_UsaProxy = "ctrl+y"; break;	// Select Alls command

        case 90: keyName_UsaProxy = "ctrl+z"; break;	// Select Alls command

      }

      

      // log ctrl+key combination

      writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

      saveLog_UsaProxy();

      

      keyName_UsaProxy 			= "";				// reset keyName_UsaProxy

      

      /* reset ctrl key pressed flag already at keydown since NS doesn't

      * trigger any keyup event in case of e.g. ctrl-f */

      FLG_ctrlPressed_UsaProxy 	= false;

      FLG_ctrl_comb_UsaProxy		= true;		/* set additional flag true to be able to

                          * determine a ctrl+key below although FLG_ctrlPressed_UsaProxy

                          * was already set false above */

      

      /* unlock handling of regular key presses:

      * enable processKeyUp_UsaProxy functionality */

      FLG_keyPress_UsaProxy 		= true;

      

      FLG_comb_UsaProxy 			= true;			// set key combination flag

      combMembers_UsaProxy 		= 2;			// 2 keys pressed

    }

    

    /* NS: in case a combination (ctrl+key) was requested before

    * which triggered a platform action (such as focus on Firefox find box)

    * the keyup event won't be triggered. Therefore a reset of a possible

    * combination must be performed on keydown

    * since FLG_ctrlPressed_UsaProxy is set false above in the

    * "if (FLG_ctrlPressed_UsaProxy)" block the additional variable

    * FLG_ctrl_comb_UsaProxy is used */

    if(!FLG_ctrl_comb_UsaProxy && !FLG_shiftPressed_UsaProxy && !FLG_altPressed_UsaProxy) {

      FLG_comb_UsaProxy 			= false;			// reset key combination flag

      combMembers_UsaProxy 		= 0;

    }

    

  }



  /** Processes the release of key combinations: second part - key up/released

  * flags are reset in case shift, ctrl, or alt is released

  * in case any flag is true a combination is detected and logged  */

  function processKeyup_UsaProxy(e) {



    /* get keycode

    * IE: first case (window.event available); NS: second case */

    var evtobj 	= window.event ? window.event : e;

    var KeyID 	= evtobj.which ? evtobj.which : evtobj.keyCode;

    

    // control key check

    switch(KeyID)

    {	

      // if shift is released

      case 16:

        // in case combination was pressed

        if(FLG_comb_UsaProxy==true) {

          /* if shift key is the first key of the combination which is released

          * decrease number of remaining combination members */

          if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

          /* if shift is last released key of the combination */

          else {	

            FLG_comb_UsaProxy 			= false;	// reset key combination

            writeLog_UsaProxy("keyPress&key=" + encodeInput(keyName_UsaProxy));	// log key combination

            keyName_UsaProxy 			= "";		// reset key name

            FLG_shiftPressed_UsaProxy 	= false;	// reset shift pressed flag

            FLG_keyPress_UsaProxy 		= true;		// re-enable keypress event processing

          }

          return false;

        // if shift was pressed without combining it with another key

        } else {

          keyName_UsaProxy 			= "shift";		// set key name	

          FLG_shiftPressed_UsaProxy 	= false;		// reset shift pressed flag

          FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

        }

      break;

      /* if ctrl is released and no key combination was pressed (single ctrl press)

      * since all combination reset actions were already performed on keydown

      * no key combination resetting neccessary at this point */

      case 17:

        if(FLG_comb_UsaProxy==false && FLG_ctrlPressed_UsaProxy) {

          keyName_UsaProxy 			= "ctrl";		// set key name

          FLG_ctrlPressed_UsaProxy 	= false;		// reset ctrl pressed flag

          FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

        } 

      break;

      // if alt is released

      case 18:

        if(FLG_comb_UsaProxy==true) {

          /* if alt key is the first key of the combination which is released

          * decrease number of remaining combination members */

          if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

          else {	

            FLG_comb_UsaProxy 		= false;		// reset key combination

            writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

            keyName_UsaProxy 		= "";			// reset key name

            FLG_altPressed_UsaProxy = false;		// reset alt pressed flag

            FLG_keyPress_UsaProxy 	= true;			// re-enable keypress event processing

          }

          return false;

        // if alt was pressed without combining it with another key

        } else {

          keyName_UsaProxy 			= "alt";		// set key name

          FLG_altPressed_UsaProxy 	= false;		// reset alt pressed flag

          FLG_keyPress_UsaProxy 		= true;			// re-enable keypress event processing

        }

      break;

      // set key name in case of other control keys

      case 19: keyName_UsaProxy = "pause"; break;			// set key name

      case 37: keyName_UsaProxy = "arrowleft"; break;		// set key name

      case 38: keyName_UsaProxy = "arrowup"; break;		// set key name

      case 39: keyName_UsaProxy = "arrowright"; break;	// set key name

      case 40: keyName_UsaProxy = "arrowdown"; break; 	// set key name

      case 46: keyName_UsaProxy = "del"; break; 			// set key name

    }

    

    /* if combination is released (except ctrl+key since all flags

    * are released on keydown)

    * if first key of combination, decrease number of combination members

    * else, reset combination flag */

    if(FLG_comb_UsaProxy) {

      if (combMembers_UsaProxy==2) combMembers_UsaProxy=1;

      else	FLG_comb_UsaProxy = false;

    }



    /* log a single key press or a key combination

    * single press or end of key combination (last member to be released)

    * is true if flag FLG_comb_UsaProxy is false and

    * also the additional ctrl+key combination indicator (since

    * resetting of all ctrl+key combination (except FLG_ctrl_comb_UsaProxy)

    * flags occurs on keydown) */

    if(FLG_comb_UsaProxy==false && !FLG_ctrl_comb_UsaProxy && keyName_UsaProxy.length!=0) {

      writeLog_UsaProxy("keypress&key=" +  encodeInput(keyName_UsaProxy));

      saveLog_UsaProxy();

      keyName_UsaProxy = "";

    }

  }



  /** Logs all regular single key presses. are logged

  * If keyPress flag is enabled (in case no control key is clicked at the same time)

  * the keyPress event returns for regular char keys the correct small case key code. */

  function processKeypress_UsaProxy(e) {

    //if(FLG_keyPress_UsaProxy) {

      /* get keycode

      * IE: first case (window.event available); NS: second case */

      var evtobj 	= window.event ? window.event : e;

      var KeyID 	= evtobj.which ? evtobj.which : evtobj.keyCode;

      keyName_UsaProxy = String.fromCharCode(KeyID);

      

      if(FLG_comb_UsaProxy==false && !FLG_ctrl_comb_UsaProxy) {

        writeLog_UsaProxy("keypress&key=" + encodeInput(keyName_UsaProxy));

        //saveLog_UsaProxy();

        keyName_UsaProxy = "";

      }

    //}

  }

