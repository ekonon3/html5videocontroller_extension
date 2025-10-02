let timeConfig = 15;
let speedRateConfig = .25;
let playbackSpeed = 1;
let mutedValue = false;
let volumeValue = 1.0;

console.log('html5videocontroller - Loading HTML5 Video Controller extension');

// Get videos
function findVideoInShadowRootsByTagName() {
  const allElements = document.querySelectorAll('*');
  const foundElements = [];

  for (const element of allElements) {
    if (element.shadowRoot) {
      const shadowRoot = element.shadowRoot;
      const elementsInShadow = shadowRoot.querySelectorAll('video');
      foundElements.push(...elementsInShadow);
    }
  }
  return foundElements;
}

function getVideos() {
	let videos = document.getElementsByTagName('video');
	if (videos.length === 0) {
		videos = findVideoInShadowRootsByTagName();
	}
	return videos;
}

function videosPlaying(videos) {
	let currentlyPlaying = [];
	for (video of videos) {
		if (video.paused === false) {
			currentlyPlaying.push(video);
		}
	}
	return currentlyPlaying;
}

function filterVideos(videos) {
	let videosFiltered = videosPlaying(videos);
	if (videosFiltered.length < 1) {
		videosFiltered = videos;
	}
	return videosFiltered;
}

let allVideos = getVideos();
let filteredVideos = filterVideos(allVideos);

function sendScriptLoaded() {
	chrome.runtime.sendMessage({ type: "html5videoscript-loaded", value: "true" });
}

function functionCancelled(button) {
	chrome.runtime.sendMessage({ type: "html5videoscript-function-cancel", value: button });
}

// Functions to control video
function playPause(videoPlayer) {
	if(videoPlayer.paused) {
		videoPlayer.play();
	} else {
		videoPlayer.pause();
	}
}

function seek(videoPlayer, time) {
	videoPlayer.currentTime += time;
	console.log('html5videocontroller - Play position: ' + videoPlayer.currentTime);
}

function goToStart(videoPlayer) {
	videoPlayer.currentTime = 0;
	console.log('html5videocontroller - Play position: ' + videoPlayer.currentTime);
}

function goToEnd(videoPlayer) {
	//videoPlayer.currentTime = videoPlayer.duration;
	videoPlayer.currentTime += 9999;
	console.log('html5videocontroller - Play position: ' + videoPlayer.currentTime);
}

function adjustPlaybackSpeed(videoPlayer, speed) {
	if (speed == "1x") {
		videoPlayer.playbackRate = 1;
	} else {
		videoPlayer.playbackRate += speed;
	}
	console.log('html5videocontroller - Playback speed: ' + videoPlayer.playbackRate + 'x');
	playbackSpeed = videoPlayer.playbackRate;
	sendPlaybackRate();
}

function sendPlaybackRate() {
	chrome.runtime.sendMessage({ type: "playback-rate", value: playbackSpeed });
}

function togglePictureInPicture(videoPlayer) {
	if (document.pictureInPictureElement && videoPlayer.currentTime > 0) {
		document.exitPictureInPicture();
	} else {
		if (videoPlayer.disablePictureInPicture) {
			functionCancelled('togglePiPBtn');
			console.log('html5videocontroller - Picture-in-picture is disabled by site');
			return;
		}
		videoPlayer.requestPictureInPicture().then(() => {
        console.log('html5videocontroller - Picture-in-picture enabled');
		})
		.catch((error) => {
        console.log('html5videocontroller - Error entering picture-in-picture: ', error);
		functionCancelled('togglePiPBtn');
		});
	}
}

function toggleFullScreen(videoPlayer) {
	if (!document.fullscreenElement && videoPlayer.currentTime > 0) {
		videoPlayer.requestFullscreen().then(() => {
        console.log('html5videocontroller - Entered full screen');
		})
		.catch((error) => {
        console.log('html5videocontroller - Error for full screen: ', error);
		functionCancelled('toggleFullScreenBtn');
		});
	} else {
		document.exitFullscreen?.().then(() => {
        console.log('html5videocontroller - Exited full screen');
		})
		.catch((error) => {
        console.log('html5videocontroller - Error for full screen: ', error);
		functionCancelled('toggleFullScreenBtn');
		});
	}
}

function toggleMute(videoPlayer) {
	if (videoPlayer.currentTime > 0) {
		if (videoPlayer.muted) {
			videoPlayer.muted = false;
		} else {
			videoPlayer.muted = true;
		}
		mutedValue = videoPlayer.muted;
		sendMutedValue(mutedValue);
	}
}

function sendMutedValue() {
	chrome.runtime.sendMessage({ type: "mute-value", value: mutedValue });
}

function setVolume(videoPlayer) {
	if (videoPlayer.currentTime > 0) {
		videoPlayer.volume = volumeValue;
	}
}

function getVolumeValue(videoPlayer) {
	volumeValue = videoPlayer.volume;
}
function sendVolumeValue() {
	executeFunction(getVolumeValue);
	chrome.runtime.sendMessage({ type: "volume-value", value: volumeValue });
}
//--------------------------------------

// functions related to selecting video
let timeoutArray = [];
let hoveredVideo = null;

function cancelTimeouts() {
	timeoutArray.forEach( (timeout) => {
		clearTimeout(timeout);
	})
	timeoutArray = [];
}

function removeSelectListeners(video) {
	video.removeEventListener('mouseover', this);
	video.removeEventListener('mouseout', this);
	video.removeEventListener('click', this);
	video.removeEventListener('contextmenu', this);
	removeHighlight(video);
}


function selectVideo() {
	chrome.runtime.sendMessage({ type: "selecting-video" });
	if(timeoutArray.length > 0) {
		cancelTimeouts();
	}
	
	allVideos = getVideos();
	for (video of allVideos) {
		video.addEventListener('mouseover', this);
		video.addEventListener('mouseout', this);
		video.addEventListener('click', this);
		video.addEventListener('contextmenu', this);
		const timer = setTimeout(removeSelectListeners, 2000, video);
		timeoutArray.push(timer);
	}
	const selectionTimer = setTimeout(selection, 2000);
	filteredVideos = filterVideos(allVideos);
}

function selection() {
	if (hoveredVideo !== null) {
		filteredVideos = hoveredVideo;
		selectedAnimation(hoveredVideo);
		chrome.runtime.sendMessage({ type: "selected-video" });
		console.log('html5videocontroller - Video selected');
	}
	timeoutArray = [];
	hoveredVideo = null;
}

function handleEvent(event) {
    switch (event.type) {
		case "mouseover":
			addHighlight(event.target);
			hoveredVideo = event.target;
			break;
		case "mouseout":
			removeHighlight(event.target);
			hoveredVideo = null;
			break;
		default:
			break;
	}
}

function addHighlight(video) {
	video.animate([{ opacity: 1 },{ opacity: .5,},{ opacity: 1 }], {duration: 2000,iterations: Infinity,easing: 'ease-in-out'});
}

function removeHighlight(video) {
	try {
		video.getAnimations()[0].cancel();
	} catch (e) {
	}
}

function selectedAnimation(video) {
	video.animate([{ opacity: 1 },{ opacity: .3,},{ opacity: 1 }], {duration: 800,iterations: 1,easing: 'ease-in-out'});
}
//--------------------------------------

function executeFunction(callback, ...args) {
	if ((filteredVideos instanceof HTMLCollection) || (filteredVideos instanceof Array)) {
		for (v of filteredVideos) {
			if (v.duration > 0) {
				callback(v, ...args);
			}
		}
	} else {
		callback(filteredVideos, ...args);
	}
}

// Handle messages and commands
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if ((filteredVideos instanceof HTMLCollection) || (filteredVideos instanceof Array)) {
		let currentlyPlaying = videosPlaying(filteredVideos);
		if (currentlyPlaying.length < 1) {
			currentlyPlaying = videosPlaying(getVideos());
			currentlyPlaying.length > 0 ? filteredVideos = currentlyPlaying : null;
		}
	}
	
	if (filteredVideos.length < 1 
		&& msg.command != 'selectVideoBtn' && msg.button != 'selectVideoBtn'
		&& msg.command != 'html5videoscript-loaded' && msg.button != 'html5videoscript-loaded'
		&& msg.command != 'change-increment' && msg.button != 'change-increment') {
			if (msg.button)
			{
				functionCancelled(msg.button);
			}
			console.log("html5videocontroller - No videos found");
			return;
	}
	
	let command = null;
	
	switch (msg?.type) {
		case "command":
			command = msg.command;
			break;
		case "popup-command":
			command = msg.button;
			break;
		case "change-increment":
			timeConfig = parseInt(msg.value);
			return;
		case "change-volume":
			volumeValue = msg.value / 100;
			executeFunction(setVolume)
			return;
		case "get-playback-rate":
			sendPlaybackRate();
			return;
		case "get-muted-value":
			sendMutedValue();
			return;
		case "get-volume-value":
			sendVolumeValue();
			return;
		case "html5videoscript-loaded":
			sendScriptLoaded();
			sendResponse('true');
			return;
		default:
			console.log("html5videocontroller - Invalid command");
			return;
	}

	switch(command) {
		case "playBtn":
			executeFunction(playPause);
			break;
		case "fastFwdBtn":
			executeFunction(seek, timeConfig);
			break;
		case "rewindBtn":
			executeFunction(seek, -timeConfig);
			break;
		case "goToStartBtn":
			executeFunction(goToStart);
			break;
		case "goToEndBtn":
			executeFunction(goToEnd);
			break;
		case "fasterBtn":
			executeFunction(adjustPlaybackSpeed, speedRateConfig);
			break;
		case "slowerBtn":
			executeFunction(adjustPlaybackSpeed, -speedRateConfig);
			break;
		case "normalSpeedBtn":
			executeFunction(adjustPlaybackSpeed, "1x");
			break;
		case "togglePiPBtn":
			executeFunction(togglePictureInPicture);
			break;
		case "toggleFullScreenBtn":
			executeFunction(toggleFullScreen);
			break;
		case "toggleMuteBtn":
			executeFunction(toggleMute);
			break;
		case "selectVideoBtn":
			selectVideo();
			break;
		default:
			console.log("html5videocontroller - Unsupported command");
	}
});

