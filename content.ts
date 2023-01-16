const en2ruChars = {
	f: 'а',
	',': 'б',
	d: 'в',
	u: 'г',
	l: 'д',
	t: 'е',
	'`': 'ё',
	';': 'ж',
	p: 'з',
	b: 'и',
	q: 'й',
	r: 'к',
	k: 'л',
	v: 'м',
	y: 'н',
	j: 'о',
	g: 'п',
	h: 'р',
	c: 'с',
	n: 'т',
	e: 'у',
	a: 'ф',
	'[': 'х',
	w: 'ц',
	i: 'ш',
	o: 'щ',
	']': 'ъ',
	s: 'ы',
	m: 'ь',
	"'": 'э',
	'.': 'ю',
	z: 'я',
	' ': ' ',
}

const ru2enChars = {
	а: 'f',
	б: ',',
	в: 'd',
	г: 'u',
	д: 'l',
	е: 't',
	ё: '`',
	ж: ';',
	з: 'p',
	и: 'b',
	й: 'q',
	к: 'r',
	л: 'k',
	м: 'v',
	н: 'y',
	о: 'j',
	п: 'g',
	р: 'h',
	с: 'c',
	т: 'n',
	у: 'e',
	ф: 'a',
	х: '[',
	ц: 'w',
	ш: 'i',
	щ: 'o',
	ъ: ']',
	ы: 's',
	ь: 'm',
	э: "'",
	ю: '.',
	я: 'z',
	' ': ' ',
}

let shortcutKeys: string[] = ['Control', 'q'],
	flag = false

;(async function () {
	const response = await chrome.storage.local.get(['keys'])
	shortcutKeys = response.keys
})()

function isCyrillic(str: string): boolean {
	return /[а-я]/i.test(str)
}

function isUpperCase(char: string): boolean {
	if (!char) return false
	if (!/[A-Za-zа-яА-Я]/i.test(char)) return false // символы (, . ; ...) не могут быть в верхнем регистре
	return char.toUpperCase() == char
}

// prettier-ignore
function changeChar(text: string, input: HTMLInputElement | HTMLTextAreaElement) {
	let result : string = ''
	let arrFromText = text.split('')

   arrFromText.forEach(char => {
      let res = ''

      if(isCyrillic(char)) {
         res = ru2enChars[char.toLowerCase()] ? ru2enChars[char.toLowerCase()] : char
      } else {
         res = en2ruChars[char.toLowerCase()] ? en2ruChars[char.toLowerCase()] : char
      }

      if(isUpperCase(char)) {
         res = res.toUpperCase()
      }

      result += res
   })

	input.setRangeText(result)
}

const handleKeyDown =
	(input: HTMLInputElement | HTMLTextAreaElement): any =>
	(keydownEvent: KeyboardEvent): void => {
		keydownEvent.preventDefault()

		const { key } = keydownEvent
		if (key === shortcutKeys[0]) flag = true
		if (key === shortcutKeys[1] && flag) {
			const selection = window.getSelection()!.toString()
			changeChar(selection, input)

			flag = false
		}
	}

document.addEventListener('focus', (focusEvent: FocusEvent) : void => {
   const target = focusEvent.target as EventTarget

   if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      target.onselect = () : void => {
         document.onkeydown = handleKeyDown(target)
      }
      target.onblur = () => {
         target.onselect = null
         document.onkeydown = null
      }
   }
}, true)

chrome.runtime.sendMessage({ from: 'content' }) //first, tell the background page that this is the tab that wants to receive the messages.
chrome.runtime.onMessage.addListener(function (msg) {
	// get data from popup
	if (msg.from == 'background') {
		shortcutKeys = msg.data
		chrome.storage.local.set({ keys: shortcutKeys }) // save data to local storage
	}
})
