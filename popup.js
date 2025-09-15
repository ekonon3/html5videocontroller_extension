const defaultIncrementTime = 15;
let html5videoscriptLoaded = false;

async function syncChange (commandType, value) {
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
		default:
	}
});

syncChange('html5videoscript-loaded');

const buttons = document.getElementsByClassName('btn');
for (button of buttons) {
	button.addEventListener('click', async (msg) => {
		const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
		if (!tab?.id) return;
		if(!html5videoscriptLoaded) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: false },
				files: ["script.js"]
			});
			html5videoscriptLoaded = true;
		}
		const button = msg.target.id;
		await chrome.tabs.sendMessage(tab.id, { type: "popup-command", button });
	})
};

const playbackSpeedField = document.getElementById('playback-speed');
function setPlaybackSpeedField(value) {
	playbackSpeedField.textContent = value + "x";
}

syncChange('get-playbackrate');

const mutedButton = document.getElementById('toggleMuteBtn');
function setMuteButton(muted) {
	console.log(muted);
	if (muted) {
		mutedButton.textContent = "\u{1F507}\u{fe0e}";
	} else {
		mutedButton.textContent = "\u{1F50A}\u{fe0e}"
	}
};

syncChange('get-mutedvalue');

const incrementTime = document.getElementById('incr');
chrome.storage.local.get({
      incrementTime: defaultIncrementTime
    },
    async function (settings) {
		const value = settings.incrementTime;
		incrementTime.value = value;
		await syncChange('change-increment', value);
});

incrementTime.addEventListener('change', function() {
	const value = incrementTime.value;
	chrome.storage.local.set({ 'incrementTime': value }, async () => {
	await syncChange('change-increment', value);
  });
});