export const sendBackgroundRequest = (action, payload) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, payload }, (response) => {
      resolve(response)
    })
  })
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export const getNumbersFromString = (string) => {
  const regex = /\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/g
  const numString = string?.match(regex)?.join('')
  if (numString) {
    const sepparatorReg = /[,|.]/
    if (numString.length >= 3) {
      const suffixSeparator = numString.at(-3)
      if (sepparatorReg.test(suffixSeparator)) {
        const [price, suffix] = numString.split(suffixSeparator)
        return [price.replace(sepparatorReg, ''), suffix].join('.')
      }
    }
    return numString.replace(sepparatorReg, '')
  }
  return ''
}
