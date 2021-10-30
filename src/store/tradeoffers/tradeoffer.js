import { TradeOfferRender } from '@features/tradeoffer/tradeoffer-render'
import { ItemStore } from '@store/inventory/item-store'
import SteamID from 'steamid'

const formatItems = (
  items = [],
  descriptions = [],
  store,
  inventoryStoreFake
) => {
  return items.map((itemOrigin) => {
    const description = descriptions.find(
      (item) =>
        itemOrigin.classid === item.classid &&
        itemOrigin.instanceid === item.instanceid
    )

    const item = {
      ...itemOrigin,
      description,
    }

    return new ItemStore(item, store, inventoryStoreFake)
  })
}

export class TradeOffer {
  constructor(tradeOfferOrigin, tradeOfferStore, globalStore) {
    this.tradeOfferStore = tradeOfferStore
    this.tradeOfferOrigin = tradeOfferOrigin
    this.globalStore = globalStore
    this.tradeofferRender = new TradeOfferRender(this)
    this.itemsToGive = []
    this.itemsToReceive = []
  }

  get partnerSteam64Id() {
    return SteamID.fromIndividualAccountID(
      this.tradeOfferOrigin.accountid_other
    ).getSteamID64()
  }

  get partnerId() {
    return this.tradeOfferOrigin.accountid_other
  }

  async acceptOffer() {
    const data = await this.globalStore.userStore.acceptOffer(
      this.tradeofferId,
      this.partnerSteam64Id
    )

    return data
  }

  get isOurOffer() {
    return this.tradeOfferOrigin.is_our_offer
  }

  get tradeOfferSummary() {
    const itemsToReceiveSumm = this.itemsToReceive.reduce(
      (acc, item) => acc + item.csmoneyPrice,
      0
    )

    const itemsToGiveSumm = this.itemsToGive.reduce(
      (acc, item) => acc + item.csmoneyPrice,
      0
    )

    return {
      itemsToReceiveSumm,
      itemsToGiveSumm,
    }
  }

  get tradeofferId() {
    return this.tradeOfferOrigin.tradeofferid
  }

  restoreItems() {
    this.itemsToReceive = formatItems(
      this.tradeOfferOrigin.items_to_receive,
      this.tradeOfferStore.descriptions,
      this.globalStore,
      { owner: this.partnerSteam64Id }
    )

    this.itemsToGive = formatItems(
      this.tradeOfferOrigin.items_to_give,
      this.tradeOfferStore.descriptions,
      this.globalStore,
      { owner: this.globalStore.userStore.steamId }
    )
  }
}
