/* eslint-disable consistent-return */
import { TRADEODDER_STATE } from '@shared/contants/tradeofferstate'
import {
  getApiKey,
  getTradeOffersFromApi,
} from '@pages/Background/actions/index'
import SteamID from 'steamid'

import { updateDynamicRules } from '@pages/Background/request-processor'
import qs from 'querystring'
import { clientStorage } from '@core/utils/clientstorage'

class AutoAcceptOffers {
  constructor() {
    this.state = {
      isTurnedOn: false,
      apiCheckInterval: 12000,
    }
    this.timerId = null

    this.restoreState()
  }

  static getSessionId() {
    return chrome.cookies.get({
      url: 'https://steamcommunity.com/',
      name: 'sessionid',
    })
  }

  getState() {
    return this.state
  }

  static getSteamLoginSecureCookie() {
    return chrome.cookies.get({
      url: 'https://steamcommunity.com/',
      name: 'steamLoginSecure',
    })
  }

  stop() {
    clearTimeout(this.timerId)
    this.state.isTurnedOn = false
    this.saveState()
  }

  async restoreState() {
    const state = await clientStorage.get('autoAcceptOffersState')
    if (state) {
      this.state = state
    }
  }

  saveState() {
    clientStorage.set('autoAcceptOffersState', this.getState())
  }

  turnOn() {
    this.state.isTurnedOn = true
    this.initTimer()
    this.saveState()
  }

  toggle() {
    if (this.state.isTurnedOn) {
      this.stop()
    } else {
      this.turnOn()
    }
  }

  setRate(value) {
    const MINIMAL_RATE = 2000
    this.state.apiCheckInterval = Math.max(value, MINIMAL_RATE)

    if (this.state.isTurnedOn) {
      this.stop()
      this.turnOn()
    }
  }

  initTimer() {
    this.timerId = setTimeout(() => {
      this.start()
    }, this.state.apiCheckInterval)
  }

  async start() {
    if (!this.state.isTurnedOn) return

    const sessionIdCookie = await AutoAcceptOffers.getSessionId()
    const steamLoginSecureCookie =
      await AutoAcceptOffers.getSteamLoginSecureCookie()

    if (!sessionIdCookie?.value || !steamLoginSecureCookie?.value) {
      return this.initTimer()
    }

    const sessionId = sessionIdCookie?.value
    const steamId = decodeURIComponent(steamLoginSecureCookie?.value).split(
      '||'
    )[0]

    if (!sessionId || !steamId) {
      return this.initTimer()
    }

    const apiKey = await getApiKey({
      steamid: steamId,
      domain: 'fdsafasdfasd',
      sessionId,
    })

    const { response } = await getTradeOffersFromApi({
      activesOnly: true,
      received: true,
      apiKey,
    })

    const { trade_offers_received: tradeOffersReceived } = response

    if (!tradeOffersReceived) {
      return this.initTimer()
    }

    for (const tradeOffer of tradeOffersReceived) {
      const { items_to_receive, items_to_give } = tradeOffer

      if (
        items_to_receive?.length &&
        !items_to_give?.length &&
        TRADEODDER_STATE.Active === tradeOffer.trade_offer_state
      ) {
        console.log('accept ', tradeOffer)

        const partnerSteam64Id = SteamID.fromIndividualAccountID(
          tradeOffer.accountid_other
        ).getSteamID64()

        try {
          const data = await AutoAcceptOffers.acceptOffer(
            tradeOffer.tradeofferid,
            partnerSteam64Id,
            sessionId
          )

          console.log(data)
        } catch (err) {
          console.error(err)
        }
      }
    }

    this.initTimer()
  }

  static async acceptOffer(offerId, partnerId, sessionID) {
    const myHeaders = new Headers()
    myHeaders.append(
      'Content-Type',
      'application/x-www-form-urlencoded; charset=UTF-8'
    )

    const request = new Request(
      `https://steamcommunity.com/tradeoffer/${offerId}/accept`,
      {
        method: 'POST',
        headers: myHeaders,
        body: qs.stringify({
          sessionid: sessionID,
          serverid: 1,
          tradeofferid: offerId,
          partner: partnerId,
          captcha: '',
        }),
      }
    )

    await updateDynamicRules([
      {
        requestHeaders: [
          {
            header: 'referer',
            operation: 'set',
            value: `https://steamcommunity.com/tradeoffer/${offerId}/`,
          },
        ],
        urlFilter: `https://steamcommunity.com/tradeoffer/${offerId}/`,
      },
    ])

    // Пришлось использовать fetch, потому что не работает смена реферрера в axios
    const response = await fetch(request)
    const data = await response.json()

    if (!response.ok) {
      console.log(
        `Error code: ${response.status} Status: ${response.statusText}`
      )
      // eslint-disable-next-line no-throw-literal
      throw {
        status: response.status,
        statusText: response.statusText,
        errorMessage: data?.strError,
      }
    }

    return data
  }
}

export const autoAcceptOffers = new AutoAcceptOffers()
