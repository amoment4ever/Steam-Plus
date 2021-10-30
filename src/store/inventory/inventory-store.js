import { makeAutoObservable, action } from 'mobx'
// eslint-disable-next-line import/no-cycle
import { ItemStore } from './item-store'

export class InventoryStore {
  constructor(globalStore) {
    this.assets = {}
    this.currentPage = 0
    this.count = 0
    this.owner = ''
    this.appId = 730
    this.contextId = 2
    this.selectedItems = []
    this.globalStore = globalStore

    makeAutoObservable(this, {
      restoreInventory: action.bound,
    })
  }

  get inventoryPage() {
    return document.querySelector(
      `#inventory_${this.owner}_${this.appId}_${this.contextId}`
    )
  }

  get inventoryPages() {
    return this.inventoryPage.querySelectorAll('.inventory_page')
  }

  get totalPrice() {
    return Object.values(this.assets).reduce(
      (sum, { csmoneyPrice }) => (csmoneyPrice || 0) + sum,
      0
    )
  }

  restoreInventory(inventory) {
    const { assets, owner, currentPage, contextId, appId, count } = inventory
    this.contextId = contextId
    this.appId = appId
    this.count = count

    Object.entries(assets).forEach(([assetId, itemOrigin]) => {
      if (this.assets[assetId] && itemOrigin.cache_expiration) {
        this.assets[assetId].setTradeLock(itemOrigin.cache_expiration)
        return
      }
      if (this.assets[assetId] || !itemOrigin.assetid) return
      this.assets[assetId] = new ItemStore(itemOrigin, this.globalStore, this)
    })

    this.owner = owner
    this.currentPage = currentPage
  }
}
