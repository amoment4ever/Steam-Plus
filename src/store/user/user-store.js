import React from 'react'
import { getUserInfo } from '@features/bridge/index'
import { makeAutoObservable } from 'mobx'
import qs from 'qs'
import { currencies } from '@features/currency/currencies-list'
import { api } from '@core/api'
import { sendBackgroundRequest } from '@core/utils/index'
import { mainEmitter } from '@core/utils/event-emitter'
import CheckIcon from './check-component.svg'

export class UserStore {
  constructor(globalStore) {
    this.steamId = null
    this.sessionID = null
    this.language = null
    this.wallet = null
    this.currency = {
      code: 'USD',
      symbol: '$',
    }
    this.globalStore = globalStore
    this.apiKey = null

    makeAutoObservable(this)

    window.addEventListener('load', () => {
      this.getInfo()
    })
  }

  get currencySign() {
    return currencies[this.currency.code]?.sign
  }

  async getApiKey() {
    this.apiKey = await sendBackgroundRequest('getApiKey', {
      steamid: this.steamId,
      domain: 'fdsafasdfasd',
      sessionId: this.sessionID,
    })
  }

  async getInfo() {
    const data = await getUserInfo()

    this.setInfo(data)
    mainEmitter.emit('load_user_info', data)
  }

  // eslint-disable-next-line class-methods-use-this
  async loadOtherInventory({ steamId, appId, contextId, count = 2000 }) {
    const inventory = await api.get(
      `https://steamcommunity.com/profiles/${steamId}/inventory/json/${appId}/${contextId}/`,
      { l: 'english', count }
    )

    const formattedInventory = Object.keys(inventory.rgInventory).map(
      (assetId) => {
        const { classid, instanceid } = inventory.rgInventory[assetId]
        const description = inventory.rgDescriptions[`${classid}_${instanceid}`]

        return {
          ...inventory.rgInventory[assetId],
          description,
        }
      }
    )

    return formattedInventory
  }

  setInfo(data) {
    const { steamId, sessionID, language, wallet, currency } = data

    this.steamId = steamId
    this.sessionID = sessionID
    this.language = language
    this.wallet = wallet

    if (currency.code) {
      this.currency = currency
    }
  }

  async acceptOffer(offerId, partnerId) {
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
        referrer: `https://steamcommunity.com/tradeoffer/${offerId}/`,
        body: qs.stringify({
          sessionid: this.sessionID,
          serverid: 1,
          tradeofferid: offerId,
          partner: partnerId,
          captcha: '',
        }),
      }
    )
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

  async buyItem(listingItemInfo, kyc = {}) {
    const data = {
      sessionid: this.sessionID,
      currency: this.wallet.wallet_currency,
      fee: listingItemInfo.converted_fee,
      subtotal: listingItemInfo.converted_price,
      total: listingItemInfo.converted_fee + listingItemInfo.converted_price,
      quantity: 1,
      save_my_address: 1,
      ...kyc,
    }

    return api.post(
      `https://steamcommunity.com/market/buylisting/${listingItemInfo.listingid}`,
      qs.stringify(data),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      }
    )
  }

  async removeFromListing({ marketHashName, listingId }) {
    await api.post(
      `https://steamcommunity.com/market/removelisting/${listingId}`,
      qs.stringify({
        sessionid: this.sessionID,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      }
    )

    this.globalStore.notificationsStore.addNotification({
      text: `${marketHashName} removed from listing`,
    })
  }

  async removeBuyOrder({ marketHashName, buy_orderid }) {
    await api.post(
      `https://steamcommunity.com/market/cancelbuyorder`,
      qs.stringify({
        sessionid: this.sessionID,
        buy_orderid,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
      }
    )

    this.globalStore.notificationsStore.addNotification({
      text: `${marketHashName} removed from buyOrders`,
      icon: <CheckIcon />,
    })
  }

  async listItemOnMarket({ amount, price, item, notify }) {
    const { marketHashName, itemOrigin } = item

    const { appid, contextid, assetid } = itemOrigin

    let data

    try {
      data = await api.post(
        'https://steamcommunity.com/market/sellitem/',
        qs.stringify({
          appid,
          contextid,
          amount,
          price,
          assetid,
          sessionid: this.sessionID,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
        }
      )
    } catch (err) {
      data = err?.response
    }

    const { success, message } = data

    if (notify) {
      if (!success && message) {
        this.globalStore.notificationsStore.addNotification({
          text: message,
          type: 'error',
        })
      }

      if (success) {
        this.globalStore.notificationsStore.addNotification({
          text: `${marketHashName} listed on market`,
          icon: <CheckIcon />,
        })
      }
    }

    return data
  }
}
