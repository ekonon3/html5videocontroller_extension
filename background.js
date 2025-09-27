async function isScriptLoaded() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.id) return;
	let result = await chrome.tabs.sendMessage(tab.id, { type: "html5videoscript-loaded"})
	.then(response => {
		if(response === 'true') {
			console.log(response);
			return true;
		}
	})
	.catch(err => {
		console.log(err);
		return false;
	})
	return result;
};

chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
	const res = await isScriptLoaded();
	if(res !== true) {
		await chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: false },
				files: ["script.js"]
			});
	}
    await chrome.tabs.sendMessage(tab.id, { type: "command", command });

	} catch (e) {
    console.log(e);
  }
});

chrome.runtime.onMessage.addListener(function(msg) {
	switch(msg.type) {
		case "playback-rate":
			return;
		case "html5videoscript-loaded":
			return;
		case "mute-value":
			return;
		case "volume-value":
			return;
		default:
			return;
	}
});
