/* eslint-disable prefer-destructuring */
import { api } from '@core/api'
import qs from 'qs'

const apiKeyHtmlPage = {}

export const getApiKey = async ({ steamid, domain, sessionId }) => {
  if (apiKeyHtmlPage[steamid]) return apiKeyHtmlPage[steamid]

  let apiKey

  try {
    const body = await api.get(
      'https://steamcommunity.com/dev/apikey?l=english'
    )

    if (body.match(/<h2>Access Denied<\/h2>/)) {
      throw new Error('Access Denied')
    }

    if (
      body.match(
        /You must have a validated email address to create a Steam Web API key./
      )
    ) {
      throw new Error(
        'You must have a validated email address to create a Steam Web API key.'
      )
    }

    const match = body.match(/<p>Key: ([0-9A-F]+)<\/p>/)
    if (match) {
      // We already have an API key registered
      apiKey = match[1]
    } else {
      await api.post(
        'https://steamcommunity.com/dev/registerkey?l=english',
        qs.stringify({
          domain,
          agreeToTerms: 'agreed',
          sessionid: sessionId,
          Submit: 'Register',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        }
      )

      apiKey = await getApiKey({ steamid, domain, sessionId })
    }

    apiKeyHtmlPage[steamid] = apiKey

    return apiKey
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getFloat = async (inspect) => {
  try {
    const data = await api.get('/float/', { url: inspect })
    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getCsmoneyPrices = async () => {
  try {
    const data = await api.get('/items/prices/csmoney')

    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getSteamItemInfo = async (url) => {
  try {
    const data = await api.get(url)

    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getBans = async (steamid) => {
  try {
    const data = await api.post('/user/bans', {
      steamid,
    })

    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getPrice = async (item) => {
  try {
    const data = await api.post('/items/extra/', item)
    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getMarketItemInfo = async (listingId) => {
  try {
    const data = await api.get(`/market/${listingId}`)

    return data
  } catch (exc) {
    console.error(exc)
  }

  return { error: true }
}

export const getTradeOffersFromApi = async ({
  activesOnly,
  historicalOnly,
  includeDescriptions,
  sent,
  received,
  apiKey,
}) => {
  try {
    const data = await api.get(
      `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?get_received_offers=${Number(
        !!received
      )}&get_sent_offers=${Number(!!sent)}&active_only=${Number(
        !!activesOnly
      )}&historical_only${Number(!!historicalOnly)}&get_descriptions=${Number(
        !!includeDescriptions
      )}&language=english&key=${apiKey}`
    )

    return data
  } catch (err) {
    console.error(err)
  }

  return { error: true }
}
