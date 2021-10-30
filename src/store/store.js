/* eslint-disable consistent-return */

import { SellItemsStore } from '@features/select-inventory/sell-items-store'
import { NotificationsStore } from '@features/notifications/notifications-store'
import { SelectedItem } from './selected-item/selected-item-store'
// eslint-disable-next-line import/no-cycle
import { InventoryStore } from './inventory/inventory-store'
import { UserStore } from './user/user-store'
import { PricesStore } from './prices/prices-store'
import { TradeOffeersStore } from './tradeoffers/tradeoffers-store'

export class Store {
  constructor() {
    this.pricesStore = new PricesStore()
    this.userStore = new UserStore(this)
    this.inventoryStore = new InventoryStore(this)
    this.selectedItemStore = new SelectedItem(this)
    this.sellItemsStore = new SellItemsStore(this)
    this.notificationsStore = new NotificationsStore()
    this.tradeOffersStore = new TradeOffeersStore(this)
  }
}
