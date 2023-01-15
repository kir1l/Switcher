const btnConfig = document.getElementById('configure')!,
	keysOut = document.getElementById('key-out')!,
	btnReset = document.querySelector<HTMLButtonElement>('.btn-reset')!,
	btnSave = document.querySelector<HTMLButtonElement>('.btn-save')!,
	doneModal = document.querySelector('.done-modal')!

let keyAmount = 0,
	lastKey = '',
	shortcut: string[] = [],
	flag = false

btnConfig.onclick = (): void => {
	document.querySelector('.page-settings')?.classList.add('page-active')
}

document.onkeydown = (event: KeyboardEvent): void => {
	event.preventDefault()
	let { key } = event

	if (flag) return // make sure the key is pressed
	if (lastKey == key) return // exclude repetition of characters
	if (keyAmount >= 2) return // set the maximum amount
	if (lastKey) keysOut.textContent += ' + ' // put a "+" sign between characters

	shortcut.push(key)
	keysOut.textContent += key

	lastKey = key
	flag = false

	keyAmount++
}

document.onkeyup = () => (flag = true)

function reset(): void {
	flag = false
	lastKey = ''
	keysOut.textContent = ''
	shortcut = []
	keyAmount = 0
}

function sendMessageToBackground(data: any): void {
	// @ts-ignore
	chrome.runtime.sendMessage({
		//send a message to the background script
		from: 'popup',
		data: data,
	})
}

btnReset.onclick = (): void => reset()

btnSave.onclick = (): void => {
	if (shortcut.length <= 0) return

	sendMessageToBackground(shortcut)
	reset()

	doneModal.classList.add('done-modal-active')
	setTimeout(() => {
		doneModal.classList.remove('done-modal-active')
	}, 1000)
}
