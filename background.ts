var contentTabId: number
chrome.runtime.onMessage.addListener(function (msg, sender) {
	console.log(
		`Received message in background from ${msg.from}, data: `,
		msg.data
	)
	if (msg.from == 'content') {
		//get content scripts tab id
		contentTabId = sender.tab!.id!
	}
	if (msg.from == 'popup' && contentTabId) {
		//got message from popup
		chrome.tabs.sendMessage(contentTabId, {
			//send it to content script
			from: 'background',
			data: msg.data,
		})
	}
})
