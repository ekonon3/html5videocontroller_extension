let timeConfig = 15;
let speedRateConfig = .25;
let playbackSpeed = 1;

console.log('Loading HTML5 Video Controller extension');
const videoPlayerCollection = document.getElementsByTagName('video');

// Functions to control video
function playPause(videoPlayer) {
	if(videoPlayer.paused) {
		videoPlayer.play();
	} else {
		videoPlayer.pause();
	}
}

function sendScriptLoaded() {
	chrome.runtime.sendMessage({ type: "html5videoscript-loaded", value: "true" });
}

function seek(videoPlayer, time) {
	videoPlayer.currentTime += time;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function goToStart(videoPlayer) {
	videoPlayer.currentTime = 0;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function goToEnd(videoPlayer) {
	//videoPlayer.currentTime = videoPlayer.duration;
	videoPlayer.currentTime += 9999;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function adjustPlaybackSpeed(videoPlayer, speed) {
	if (speed == "1x") {
		videoPlayer.playbackRate = 1;
	} else {
		videoPlayer.playbackRate += speed;
	}
	console.log('Playback speed: ' + videoPlayer.playbackRate + 'x');
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
    videoPlayer.requestPictureInPicture();
  }
}

function toggleFullScreen(videoPlayer) {
  if (!document.fullscreenElement && videoPlayer.currentTime > 0) {
    videoPlayer.requestFullscreen();
  } else {
    document.exitFullscreen?.();
  }
}

function executeFunction(callback, ...args) {
	for (v of videoPlayerCollection) {
		if (v.duration > 0) {
			callback(v, ...args);
		}
	}
}

// Handle messages and commands
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (videoPlayerCollection.length < 1) {
		console.log("HTML5 Video Controller extension: No videos found");
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
		case "get-playbackrate":
			sendPlaybackRate();
			return;
		case "html5videoscript-loaded":
			sendScriptLoaded();
			return;
		default:
			console.log("Invalid command");
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
			executeFunction(togglePictureInPicture)
			break;
		case "toggleFullScreenBtn":
			executeFunction(toggleFullScreen)
			break;
		default:
			console.log("Unsupported command");
	}
});

