export function getCurrencyCode(currencyId) {
  for (const code in window.g_rgCurrencyData) {
    if (window.g_rgCurrencyData[code].eCurrencyCode === currencyId) {
      return code
    }
  }
  return 'Unknown'
}

export function getCurrencySymbol(wallet_currency) {
  const currencyCode = getCurrencyCode(wallet_currency)

  return window.g_rgCurrencyData[currencyCode]
    ? window.g_rgCurrencyData[currencyCode].strSymbol
    : `${window.currencyCode} `
}
