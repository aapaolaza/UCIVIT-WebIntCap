/**
 * Functions to be considered useful when debugging
 */


  ////////////////////USEFUL FUNCTIONS FOR DEBUGGING

  //It's pretty useful to put calls to specific nodes in the mousedown function,

  //when the right or middle button gets activated



  //Function that prints all CSS values of an element

    

    /*var computedStyle = window.getComputedStyle(node);

    var stringedStyle = "";

    

    //looping through the vector we get the value names

    for (i=0; i<computedStyle.length; i++) {

      

      var cssValue = jQuery(node).css(computedStyle[i]);//jQuery will get us the value of those fields

      stringedStyle+= computedStyle[i] + ":" + cssValue +"||||\n";

    }

    

    alert(stringedStyle);

  */









  ////This function will be called when DOM is ready, we will include all events that we want to handle with jQuery to maximize compatibility

  //function jQueryListeners(){

    //jQuery(document).ready(function(){

      //alert("registering jQuery events");

      //jQuery(document).mousemove(function(ev){

        //alert("mousemoved");

        //jQuery('#status').html(e.pageX +', '+ e.pageY);

        //var target 	= ev.target;

        //var x 		= ev.pageX;

        //var y 		= ev.pageY;

      

        //var xOffset = x - absLeft(target);	// compute x offset relative to the hovered-over element

        //var yOffset = y - absTop(target);	// compute y offset relative to the hovered-over element

        

        //// if log mousemove flag is false, set it true and log a mousemove event

        //if (!FLG_LogMousemove_UsaProxy

          //// if mouse pointer actually moved 

          //&& !(x==lastMousePosX_UsaProxy && y==lastMousePosY_UsaProxy) ) {

            //FLG_LogMousemove_UsaProxy = true;

            //lastMousePosX_UsaProxy = x;

            //lastMousePosY_UsaProxy = y;

            

            //writeLog_UsaProxy("jQuerymousemove&coords=" + x + "," + y + "&offset=" + xOffset + "," + yOffset + generateEventString_UsaProxy(target));

            ////saveLog_UsaProxy();

            //window.setTimeout('setInaktiv_UsaProxy()',mouseTimeout);

        //}

        //});

      

    //})

  //}



  /*document.addEventListener("DOMSubtreeModified", function() {

      alert("DOMSubtreeModified fired!");

  }, false);*/

  //if(document.attachEvent) jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

  //if(document.addEventListener) jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

  //jQuery("element-root").bind(DOMSubtreeModified,"domChangeListener");

