const buttons = document.getElementsByClassName('btn');
for (button of buttons) {
	button.addEventListener('click', async (msg) => {
		const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

		if (!tab?.id) return;
		const button = msg.target.id;
		await chrome.tabs.sendMessage(tab.id, { type: "popup-command", button });
	})
};