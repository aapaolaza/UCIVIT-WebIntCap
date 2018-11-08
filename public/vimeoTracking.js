
// JS code to track events from vimeo videos
// More information in https://developers.google.com/vimeo/iframe_api_reference

// The following page is a good example of all the possible events that can be extracted
// https://player.vimeo.com/api/demo
// Check the js in https://f.vimeocdn.com/p/static/internal/api-demo.js for code

// Container for all vimeo tracking options and functions
const vimeoAPI = {
  iframeClass: 'vimeo-video',
  iframeAPIEnable: '?api=1',
  iframeAPIsrc: 'https://player.vimeo.com/api/player.js',
  eventLogURL: '',
  playerList: [],
  // Keeps track of how far the user has watched the video
  playHistoryFrequency: 1000,
  playHistory: [],
  eventLog: [],
};

/**
 * Code to initiate the vimeo API when the page is loaded
 */
(() => {
  // If ucivitOptions exist, then we can initiate the interaction tracking
  if (ucivitOptions) {
    vimeoAPI.eventLogURL = `${ucivitOptions.protocol + ucivitOptions.serverIP}/log/event`;
    setInterval(saveVimeoEvents, ucivitOptions.logSaveFrequency);
    configurevimeoIframes();
    initVimeoAPI();
    registerVimeoEvents();
  }

  // Sets the corresponding class and API approved src, if necessary
  function configurevimeoIframes() {
    $('iframe[src*="vimeo.com"]').each((index, element) => {
      // according to their documentation, there is no need to add the api parameter
      // const url = $(element).attr('src');
      // if (url.indexOf(vimeoAPI.iframeAPIEnable) < 0){
      //   $(element).attr('src', `${url}${vimeoAPI.iframeAPIEnable}`);
      // }
      $(element).attr('class', vimeoAPI.iframeClass);
    });
    console.log('Vimeo Video frames configured');
  }

  /**
   * Inserting the vimeo API code.
   * onvimeoIframeAPIReady() is called when the code is loaded
   */
  function initVimeoAPI() {
    const tag = document.createElement('script');
    tag.src = vimeoAPI.iframeAPIsrc;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log('Vimeo API initialised');
  }

  /**
   * Checks that the vimeo API is ready, and initialises the necessary fields
   */
  function registerVimeoEvents() {
    // If API is not ready, postpone
    if (typeof Vimeo === 'undefined') setTimeout(registerVimeoEvents, 500);
    else {
      const vidObjectList = document.getElementsByClassName(vimeoAPI.iframeClass);
      console.log(`Registering ${vidObjectList.length} vimeo video objects`);
      for (let i = 0; i < vidObjectList.length; i += 1) {
        const player = new Vimeo.Player(vidObjectList[i]);

        vimeoAPI.playerList.push(player);
        vimeoAPI.playHistory.push(0);

        // register all events, check <https://github.com/vimeo/player.js#events>
        player.ready().then(processVimeoEvent('ready', player));
        player.on('play', () => { processVimeoEvent('play', player); });
        player.on('pause', () => { processVimeoEvent('pause', player); });
        player.on('ended', () => { processVimeoEvent('ended', player); });
        player.on('timeupdate', () => { processVimeoEvent('timeUpdate', player); });
        player.on('progress', () => { processVimeoEvent('bufferProgress', player); });
        player.on('seeked', () => { processVimeoEvent('seeked', player); });
        player.on('volumechange', () => { processVimeoEvent('volumeChange', player); });
        player.on('texttrackchange', () => { processVimeoEvent('textTrackChange', player); });
        player.on('cuechange', () => { processVimeoEvent('cueChange', player); });
        player.on('error', () => { processVimeoEvent('error', player); });
        player.on('loaded', () => { processVimeoEvent('loaded', player); });
        player.on('cuepoint', () => { processVimeoEvent('cuepoint', player); });
        player.on('playbackratechange', () => { processVimeoEvent('playbackrateChange', player); });
        player.on('bufferstart', () => { processVimeoEvent('bufferStart', player); });
        player.on('bufferend', () => { processVimeoEvent('bufferEnd', player); });
      }
    }
    console.log('Vimeo events registered');
  }


  /**
   * We will periodically check the list of stored players, and their latest timestamp,
   * to check if the users have carried on
   * watching the video, and how far they got.
   */
  function periodicCheck() {
    vimeoAPI.playerList.forEach((player, index) => {
      // Check if function is available, as the player might not be ready for the first requests
      if (typeof player.getCurrentTime === 'function') {
        // vimeo API relies on promises to retrieve video data
        player.getCurrentTime().then((playerTime) => {
          if (playerTime !== vimeoAPI.playHistory[index]) {
            processVimeoEvent('progress', player);
            vimeoAPI.playHistory[index] = playerTime;
          }
        });
      }
    });
  }
  setInterval(periodicCheck, vimeoAPI.playHistoryFrequency);

  function processVimeoEvent(triggerEvent, player) {
    const eventObj = {
      event: 'video',
      episodeCount: ucivitOptions.episodeCount,
      timestampms: ucivitOptions.currentTime(),
      sessionstartms: ucivitOptions.sessionstartms,
      timezoneOffset: new Date().getTimezoneOffset(),
      sd: ucivitOptions.websiteID,
      sid: ucivitOptions.userId,
      url: window.location.href.split('?')[0],
      urlFull: window.location.href,
    };

    const stateProm = player.getPaused();
    const timeProm = player.getCurrentTime();
    const durationProm = player.getDuration();
    const volumeProm = player.getVolume();
    const playbackRateProm = player.getPlaybackRate();

    // player.getDuration().then((value) => { duration = value; });

    // wait for all promises to end before processing them.
    Promise.all([stateProm, timeProm, durationProm, volumeProm, playbackRateProm]).then((values) => {
      // the order in which the values are processed should match the promise array
      let state = 'playing';
      if (values[0]) state = 'paused';

      const currentTime = values[1];
      const duration = values[2];
      // percentage: Math.round((player.getCurrentTime() / player.getDuration()) * 100),
      const volume = values[3];
      const playbackRate = values[4];

      eventObj.video = {
        triggerEvent,
        api: 'vimeo',
        state,
        currentTime,
        duration,
        percentage: Math.round((currentTime / duration) * 100),
        url: player.element.src,
        volume,
        playbackRate,
        playbackQuality: null,
      };

      vimeoAPI.eventLog.push(eventObj); // Add logLine to interaction log

      // If vimeoAPI.eventLog reaches a critical size, send it directly to the server
      if (JSON.stringify(vimeoAPI.eventLog).length >= ucivitOptions.logBufferSize) {
        saveVimeoEvents();
      }
    });
  }

  /**
   * Sends the data to the UCIVIT server
   * TODO: test the events are being stored correctly in production
   */
  function saveVimeoEvents() {
    if (vimeoAPI.eventLog.length > 0) {
      $.ajax({
        type: 'POST',
        url: vimeoAPI.eventLogURL,
        data: { jsonLogString: JSON.stringify(vimeoAPI.eventLog) },
        dataType: 'jsonp',
      }).fail((jqXHR, textStatus) => {
        console.log('request failed'); console.log(textStatus);
      });
      vimeoAPI.eventLog = [];
    }
  }

})();
