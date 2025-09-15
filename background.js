chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
	chrome.scripting.executeScript({
			target: { tabId: tab.id, allFrames: true },
			files: ["script.js"]
		});
    await chrome.tabs.sendMessage(tab.id, { type: "command", command });

	} catch (e) {
    // Content script might not be ready on some pages (e.g., chrome://)
    // Ignore silently.
  }
});