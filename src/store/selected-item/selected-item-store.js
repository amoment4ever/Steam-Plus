import { EventEmitter } from '@core/utils/event-emitter'

export class SelectedItem {
  constructor(globalStore) {
    this.item = null
    this.$dom = null
    this.globalStore = globalStore
    this.eventEmitter = new EventEmitter('selectedItemEmitter')
    this.firstItem = true
  }

  restoreItem(item) {
    if (this.item?.assetid !== item.assetid) {
      this.item = item
      this.$dom = document.querySelector('.inventory_page_right')
      this.eventEmitter.emit('changedItem', item)
      if (
        this.globalStore.inventoryStore.owner !==
          this.globalStore.userStore.steamId ||
        this.firstItem
      ) {
        this.selectedItem?.getPriceByPriceoverview()
      }
      this.firstItem = false
    } else if (item.overview) {
      this.selectedItem?.setOverview(item.overview)
    }
  }

  get selectedItem() {
    return this.globalStore.inventoryStore?.assets[this.item?.assetid]
  }

  get marketLink() {
    if (!this.selectedItem) return null
    return `https://steamcommunity.com/market/listings/730/${encodeURI(
      this.selectedItem.marketHashName
    )}`
  }
}
