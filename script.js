let timeConfig = 15;
let speedRateConfig = .25;

console.log('Loading HTML5 Video Controller extension');
const videoPlayerCollection = document.getElementsByTagName('video');

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

function goToEnd(videoPlayer)
{
	videoPlayer.currentTime = videoPlayer.duration;
	console.log('Play position: ' + videoPlayer.currentTime);
}

function increasePlaybackSpeed(videoPlayer, speed)
{
	videoPlayer.playbackRate += speed;
	console.log('Playback speed: ' + videoPlayer.playbackRate + 'x');
}	

function decreasePlaybackSpeed(videoPlayer, speed)
{
	videoPlayer.playbackRate -= speed;
	console.log('Playback speed: ' + videoPlayer.playbackRate + 'x');
}

function setNormalPlaybackSpeed(videoPlayer)
{
	videoPlayer.playbackRate = 1;
}

chrome.runtime.onMessage.addListener((msg) => {
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
		default:
			console.log("Invalid command");
			return;
	}
	
	switch(command) {
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

