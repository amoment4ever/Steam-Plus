import { store } from '@store/store-context'
import { priceQueue } from '@core/utils/queue'

const { pricesStore } = store
pricesStore.getCsmoneyPrices()

window.addEventListener('load', async () => {
  await store.userStore.getInfo()
  await store.tradeOffersStore.getTradeOffersFromApi({
    activesOnly: true,
    sent: true,
    includeDescriptions: true,
    received: true,
  })

  const $tradeoffers = Array.from(document.querySelectorAll('.tradeoffer'))

  $tradeoffers.forEach(($tradeoffer) => {
    const tradeofferId = $tradeoffer.id.split('_')[1]

    const tradeOfferStore =
      store.tradeOffersStore.sentTradeOffers.find(
        (tradeOffer) => tradeOffer.tradeofferId === tradeofferId
      ) ||
      store.tradeOffersStore.receivedTradeOffers.find(
        (tradeOffer) => tradeOffer.tradeofferId === tradeofferId
      )

    if (tradeOfferStore) {
      tradeOfferStore.itemsToGive.forEach((item) => {
        priceQueue.push(async () => {
          await item.getDetails()
          item.render.renderParams()
        })
      })

      tradeOfferStore.itemsToReceive.forEach((item) => {
        priceQueue.push(async () => {
          await item.getDetails()
          item.render.renderParams()
        })
      })

      tradeOfferStore.tradeofferRender.render()
    }
  })
})
