const defaultIncrementTime = 15;
let html5videoscriptLoaded = false;

async function sendMsg(commandType, value) {
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	if (!tab?.id) return;
	await chrome.tabs.sendMessage(tab.id, { type: commandType, value });
};

chrome.runtime.onMessage.addListener(function(msg) {
	switch(msg.type) {
		case "playback-rate":
			console.log("Received playback rate from content script:", msg.value);
			setPlaybackSpeedField(msg.value);
			break;
		case "html5videoscript-loaded":
			console.log("Received script-loaded message from content script:", msg.value);
			html5videoscriptLoaded = true;
			break;
		case "mute-value":
			console.log("Received muted value from content script:", msg.value);
			setMuteButton(msg.value);
			break;
		case "volume-value":
			console.log("Received volume value from content script:", msg.value);
			setVolumeSlider(msg.value);
			break;
		case "selecting-video":
			const selecting = document.getElementById('selectVideoBtn');
			selecting.classList.add('selecting');
			setTimeout(() => { selecting.classList.remove('selecting') }, 2000);
			break;
		case "selected-video":
			const selected = document.getElementById('selectVideoBtn');
			selected.classList.add('selected');
			setTimeout(() => { selected.classList.replace('selected', 'selected-fade') }, 500);
			setTimeout(() => { selected.classList.remove('selected-fade') }, 3000);
			break;
		case "html5videoscript-function-cancel":
			const element = document.getElementById(msg.value);
			element.classList.add('cancel');
			setTimeout(() => { element.classList.replace('cancel', 'cancel-fade') }, 500);
			setTimeout(() => { element.classList.remove('cancel-fade') }, 3000);
			break;
		default:
			break;
	}
});

sendMsg('html5videoscript-loaded');

const elements = document.querySelectorAll('button, input');
for (element of elements) {
	element.addEventListener('click', async (msg) => {
		const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
		if (!tab?.id) return;
		if(!html5videoscriptLoaded) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: false },
				files: ["script.js"]
			});
			html5videoscriptLoaded = true;
		}

		if(msg.target.nodeName === "BUTTON") {
			const button = msg.target.id;
			await chrome.tabs.sendMessage(tab.id, { type: "popup-command", button });
		}
	})
};

const playbackSpeedField = document.getElementById('playback-speed');
function setPlaybackSpeedField(value) {
	playbackSpeedField.textContent = value + "x";
}
sendMsg('get-playback-rate');

const mutedButton = document.getElementById('toggleMuteBtn');
function setMuteButton(muted) {
	if (muted === true) {
		mutedButton.textContent = "\u{1F507}\u{fe0e}";
	} else {
		mutedButton.textContent = "\u{1F50A}\u{fe0e}"
	}
};
sendMsg('get-muted-value');

const volumeSlider = document.getElementById('volumeSlider');
function setVolumeSlider(value) {
	volumeSlider.value = value * 100;
}
sendMsg('get-volume-value');

volumeSlider.addEventListener('change', function() {
	const value = volumeSlider.value;
	sendMsg('change-volume', value);
});

const incrementTime = document.getElementById('incr');
chrome.storage.local.get({
      incrementTime: defaultIncrementTime
    },
    async function (settings) {
		const value = settings.incrementTime;
		incrementTime.value = value;
		await sendMsg('change-increment', value);
});

incrementTime.addEventListener('change', function() {
	const value = incrementTime.value;
	chrome.storage.local.set({ 'incrementTime': value }, async () => {
	await sendMsg('change-increment', value);
  });
});