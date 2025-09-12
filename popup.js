const defaultIncrementTime = 15;

async function syncChange (commandType, value) {
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	if (!tab?.id) return;
	await chrome.tabs.sendMessage(tab.id, { type: commandType, value });
};

const buttons = document.getElementsByClassName('btn');
for (button of buttons) {
	button.addEventListener('click', async (msg) => {
		const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
		if (!tab?.id) return;
		const button = msg.target.id;
		await chrome.tabs.sendMessage(tab.id, { type: "popup-command", button });
	})
};


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


const playbackSpeedField = document.getElementById('playback-speed');
syncChange('get-playbackrate', null);

function setPlaybackSpeedField(value) {
	playbackSpeedField.textContent = value + "x";
}

chrome.runtime.onMessage.addListener(function(msg) {
  if (msg.type === "playback-rate") {
    console.log("Received message from content script:", msg.value);
	setPlaybackSpeedField(msg.value);
  }
});