import { sendBackgroundRequest } from '@core/utils/index'
import { TradeOffer } from './tradeoffer'

export class TradeOffeersStore {
  constructor(globalStore) {
    this.globalStore = globalStore
    this.sentTradeOffers = []
    this.receivedTradeOffers = []
    this.descriptions = []
  }

  get apiKey() {
    return this.globalStore.userStore.apiKey
  }

  setData(data) {
    this.descriptions = data.descriptions
    if (data.trade_offers_sent) {
      const sentTradeOffers = []
      data.trade_offers_sent.forEach((tradeOfferOrigin) => {
        const tradeOffer = new TradeOffer(
          tradeOfferOrigin,
          this,
          this.globalStore
        )
        sentTradeOffers.push(tradeOffer)
        tradeOffer.restoreItems()
      })
      this.sentTradeOffers = sentTradeOffers
    }

    if (data.trade_offers_received) {
      const receivedTradeOffers = []
      data.trade_offers_received.forEach((tradeOfferOrigin) => {
        const tradeOffer = new TradeOffer(
          tradeOfferOrigin,
          this,
          this.globalStore
        )
        receivedTradeOffers.push(tradeOffer)
        tradeOffer.restoreItems()
      })
      this.receivedTradeOffers = receivedTradeOffers
    }
  }

  async getTradeOffersFromApi({
    activesOnly,
    historicalOnly,
    includeDescriptions,
    sent,
    received,
  }) {
    if (!this.apiKey) {
      await this.globalStore.userStore.getApiKey()
    }

    if (!this.apiKey) {
      throw new Error("USER DON'T HAVE API KEY")
    }

    const data = await sendBackgroundRequest('getTradeOffersFromApi', {
      activesOnly,
      historicalOnly,
      includeDescriptions,
      sent,
      received,
      apiKey: this.apiKey,
    })

    if (data.response) {
      this.setData(data.response)
    }
  }
}
