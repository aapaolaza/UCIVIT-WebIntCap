
// JS code to track events from youtube videos
// More information in https://developers.google.com/youtube/iframe_api_reference

// Container for all yt tracking options and functions
const ytAPI = {
  iframeClass: 'yt-video',
  iframeAPIEnable: '?enablejsapi=1',
  iframeAPIsrc: 'https://www.youtube.com/iframe_api',
  eventLogURL: '',
  playerList: [],
  // Keeps track of how far the user has watched the video
  playHistoryFrequency: 1000,
  playHistory: [],
  eventLog: [],
};

/**
 * Called when the YT API is ready, needs to be publicly visible
 */
function onYouTubeIframeAPIReady() {
  // const video = document.getElementById('video0');
  const vidObjectList = document.getElementsByClassName(ytAPI.iframeClass);
  for (let i = 0; i < vidObjectList.length; i += 1) {
    ytAPI.playerList.push(new YT.Player(vidObjectList[i], {
      events: {
        onReady: ytAPI.onPlayerReady,
        onStateChange: ytAPI.onStateChange,
        onPlaybackRateChange: ytAPI.onPlaybackRateChange,
        onPlaybackQualityChange: ytAPI.onPlaybackQualityChange,
      },
    }));
    ytAPI.playHistory.push(0);
  }
}

/**
 * Code to initiate the youtube API when the page is loaded
 */
(() => {
  // If ucivitOptions exist, then we can initiate the interaction tracking
  if (ucivitOptions) {
    ytAPI.eventLogURL = `${ucivitOptions.protocol + ucivitOptions.serverIP}/log/event`;
    setInterval(ytAPI.saveYTEvents, ucivitOptions.logSaveFrequency);
    configureYTIframes();
    initYTAPI();
  }

  // Sets the corresponding class and API approved src, if necessary
  function configureYTIframes() {
    $('iframe[src*="youtube.com"]').each((index, element) => {
      const url = $(element).attr('src');
      if (url.indexOf(ytAPI.iframeAPIEnable) < 0) $(element).attr('src', `${url}${ytAPI.iframeAPIEnable}`);
      $(element).attr('class', ytAPI.iframeClass);
    });
  }

  /**
   * Inserting the youtube API code.
   * onYouTubeIframeAPIReady() is called when the code is loaded
   */
  function initYTAPI() {
    const tag = document.createElement('script');
    tag.src = ytAPI.iframeAPIsrc;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  /**
   * We will periodically check the list of stored players, and their latest timestamp,
   * to check if the users have carried on
   * watching the video, and how far they got.
   */
  function periodicCheck() {
    ytAPI.playerList.forEach((player, index) => {
      // Check if function is available, as the player might not be ready for the first requests
      if (typeof player.getCurrentTime === 'function' && (player.getCurrentTime() !== ytAPI.playHistory[index])) {
        ytAPI.processYTEvent('progress', player);
        ytAPI.playHistory[index] = player.getCurrentTime();
      }
    });
  }
  setInterval(periodicCheck, ytAPI.playHistoryFrequency);
})();


/**
 * Given an integer describing a video state as specified in the API,
 * returns a human readable text description
 * @param {int} stateCode
 */
ytAPI.decodePlayerState = (stateCode) => {
  switch (stateCode) {
    case -1:
      return ('unstarted');
    case 0:
      return ('ended');
    case 1:
      return ('playing');
    case 2:
      return ('paused');
    case 3:
      return ('buffering');
    case 5:
      return ('cued');
    default:
      return ('unknown state');
  }
};

ytAPI.onPlayerReady = (e) => {
  console.log('player ready');
  ytAPI.processYTEvent('ready', e.target);
};
ytAPI.onStateChange = (e) => {
  console.log('player state change');
  ytAPI.processYTEvent('stateChange', e.target);
};
ytAPI.onPlaybackRateChange = (e) => {
  console.log('player playbackrate change');
  ytAPI.processYTEvent('playbackRate', e.target);
};
ytAPI.onPlaybackQualityChange = (e) => {
  console.log('player playback quality change');
  ytAPI.processYTEvent('playbackQuality', e.target);
};

ytAPI.getVideoInfo = (triggerEvent, player) => {
  return ({
    video: {
      triggerEvent,
      api: 'youtube',
      state: ytAPI.decodePlayerState(player.getPlayerState()),
      currentTime: player.getCurrentTime(),
      duration: player.getDuration(),
      percentage: Math.round((player.getCurrentTime() / player.getDuration()) * 100),
      url: player.getVideoUrl(),
      volume: player.getVolume(),
      playbackRate: player.getPlaybackRate(),
      playbackQuality: player.getPlaybackQuality(),
    },
  });
};

ytAPI.processYTEvent = (triggerEvent, player) => {
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
  Object.assign(eventObj, ytAPI.getVideoInfo(triggerEvent, player));

  ytAPI.eventLog.push(eventObj); // Add logLine to interaction log
  console.log(eventObj);
  // If ytAPI.eventLog reaches a critical size, send it directly to the server
  if (JSON.stringify(ytAPI.eventLog).length >= ucivitOptions.logBufferSize) {
    ytAPI.saveYTEvents();
  }
};

/**
 * Sends the data to the UCIVIT server
 * TODO: test the events are being stored correctly in production
 */
ytAPI.saveYTEvents = () => {
  if (ytAPI.eventLog.length > 0) {
    $.ajax({
      type: 'POST',
      url: ytAPI.eventLogURL,
      data: { jsonLogString: JSON.stringify(ytAPI.eventLog) },
      dataType: 'jsonp',
    }).fail((jqXHR, textStatus) => {
      console.log('request failed'); console.log(textStatus);
    });

    ytAPI.eventLog = [];
  }
};

