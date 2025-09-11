const defaultIncrementTime = 15;
const defaultPlaybackSpeed = 1;

async function syncChange (commandType, value) {
	const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
	if (!tab?.id) return;
	await chrome.tabs.sendMessage(tab.id, { type: commandType, value });
}

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
		console.log("Retrieved settings:");
		console.log("incrementTime:", value);
		incrementTime.value = value;
		await syncChange('change-increment', value);
});

incrementTime.addEventListener('change', function() {
	const value = incrementTime.value;
	chrome.storage.local.set({ 'incrementTime': value }, async () => {
    console.log('Incremenet value saved to local storage:', value);
	await syncChange('change-increment', value);
  });
});


const playbackSpeed = document.getElementById('playback-speed');
//playbackSpeed.value = "3.55";
/*
chrome.storage.session.get({
      playbackSpeed: defaultPlaybackSpeed
    },
    async function (settings) {
		const value = settings.playbackSpeed;
		console.log("Retrieved settings:");
		console.log("playbackSpeed:", value);
		playbackSpeed.value = value;
		await syncChange('change-playback-speed', value);
});

playbackSpeed.addEventListener('change', function() {
	const value = playbackSpeed.value;
	chrome.storage.session.set({ 'playbackSpeed': value }, async () => {
    console.log('Playback speed value saved to session storage:', value);
	await syncChange('change-playback-speed', value);
  });
});
*/
