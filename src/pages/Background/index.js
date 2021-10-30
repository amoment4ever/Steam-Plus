import { autoAcceptOffers } from '@features/auto-accept-offers/auto-accept-offers'

import {
  getCsmoneyPrices,
  getFloat,
  getBans,
  getPrice,
  getMarketItemInfo,
  getTradeOffersFromApi,
  getApiKey,
} from './actions/index'

// тоже экшены. сюда вынесены, чтобы не создавать рекурсивных зависимостей
const getAutoAcceptState = async () => {
  return autoAcceptOffers.getState()
}
const toggleAutoAcceptOffers = async () => {
  autoAcceptOffers.toggle()
  return autoAcceptOffers.getState()
}
const setApiCheckInterval = async (value) => {
  autoAcceptOffers.setRate(value)
  return autoAcceptOffers.getState()
}

const actions = {
  getFloat,
  getCsmoneyPrices,
  getBans,
  getPrice,
  getMarketItemInfo,
  getTradeOffersFromApi,
  getApiKey,
  getAutoAcceptState,
  toggleAutoAcceptOffers,
  setApiCheckInterval,
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, payload } = request

  if (actions[action]) {
    actions[action](payload).then((result) => {
      sendResponse(result)
    })
  }

  return true
})
