let timeConfig = 15;
let speedRateConfig = .25;
let playbackSpeed = 1;

console.log('Loading HTML5 Video Controller extension');
const videoPlayerCollection = document.getElementsByTagName('video');

// Functions to control video
function playPause(videoPlayer)
{
	if(videoPlayer.paused) {
		videoPlayer.play();
	} else {
		videoPlayer.pause();
	}
}

function rewind(videoPlayer, time)
{
	videoPlayer.currentTime -= time;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function fastForward(videoPlayer, time)
{
	console.log(videoPlayer.currentTime);
	console.log(time);
	console.log(videoPlayer.currentTime += time);
	videoPlayer.currentTime += time;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function goToStart(videoPlayer)
{
	videoPlayer.currentTime = 0;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function goToEnd(videoPlayer)
{
	//videoPlayer.currentTime = videoPlayer.duration;
	videoPlayer.currentTime += 9999;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function increasePlaybackSpeed(videoPlayer, speed)
{
	videoPlayer.playbackRate += speed;
	console.log('Playback speed: ' + videoPlayer.playbackRate + 'x');
	playbackSpeed = videoPlayer.playbackRate;
	sendPlaybackRate();
}	

function decreasePlaybackSpeed(videoPlayer, speed)
{
	videoPlayer.playbackRate -= speed;
	console.log('Playback speed: ' + videoPlayer.playbackRate + 'x');
	playbackSpeed = videoPlayer.playbackRate;
	sendPlaybackRate();
}

function setNormalPlaybackSpeed(videoPlayer)
{
	videoPlayer.playbackRate = 1;
	playbackSpeed = videoPlayer.playbackRate;
	sendPlaybackRate();
}

function getPlaybackRate(videoPlayer)
{
	playbackSpeed = videoPlayer.playbackRate;
}

function sendPlaybackRate()
{
	chrome.runtime.sendMessage({ type: "playback-rate", value: playbackSpeed });
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
		/*
			for (v of videoPlayerCollection)
			{
				getPlaybackRate(v);
			}
		*/
			sendPlaybackRate();
			return;
		default:
			console.log("Invalid command");
			return;
	}

	switch(command) {
		case "playBtn":
			for (v of videoPlayerCollection)
			{
				playPause(v);
			}
			break;
		case "fastFwdBtn":
			for (v of videoPlayerCollection)
			{
				fastForward(v, timeConfig);
			}
			break;
		case "rewindBtn":
			for (v of videoPlayerCollection)
			{
				rewind(v, timeConfig);
			}
			break;
		case "goToStartBtn":
			for (v of videoPlayerCollection)
			{
				goToStart(v);
			}
			break;
		case "goToEndBtn":
			for (v of videoPlayerCollection)
			{
				goToEnd(v);
			}
			break;
		case "fasterBtn":
			for (v of videoPlayerCollection)
			{
				increasePlaybackSpeed(v, speedRateConfig);
			}
			break;
		case "slowerBtn":
			for (v of videoPlayerCollection)
			{
				decreasePlaybackSpeed(v, speedRateConfig);
			}
			break;
		case "normalSpeedBtn":
			for (v of videoPlayerCollection)
			{
				setNormalPlaybackSpeed(v);
			}
			break;
		default:
			console.log("Unsupported command");
	}
});

