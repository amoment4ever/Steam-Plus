import { getInventory } from '@features/bridge/index'
import { store } from '@store/store-context'
import { debounce } from '@core/utils/debounce'
import { TradeOfferCreate } from '@features/tradeoffer-create/tradeoffer-create'

const { pricesStore } = store

pricesStore.getCsmoneyPrices()

const tradeOfferCreate = new TradeOfferCreate()

const inventoryHandler = debounce(async () => {
  const inventory = await getInventory()
  tradeOfferCreate.restoreInventory(inventory)
}, 500)

window.addEventListener('load', async () => {
  inventoryHandler()

  tradeOfferCreate.init()

  document
    .querySelector('#inventory_box')
    .addEventListener('DOMNodeInserted', inventoryHandler)
})
