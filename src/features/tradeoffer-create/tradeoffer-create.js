/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-this-in-sfc */
import React from 'react'
import ReactDOM from 'react-dom'
import {
  getParnerSteamId,
  getTradeItemsIds,
  quickAcceptTradeoffer,
  // selectPageToTrade,
  // selectAllToTrade,
  // clearTradeMe,
  // clearTradeThem,
} from '@features/bridge/index'
import { Button } from '@shared/component/button/button'
import { store } from '@store/store-context'
import { InventoryStore } from '@store/inventory/inventory-store'
import { makeObservable, observable, computed, action } from 'mobx'
import { observer } from 'mobx-react'
import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import { debounce } from '@core/utils/debounce'
import { SelectItemField } from '@features/select-inventory/select-item-filed/select-item-field'
import { priceQueue } from '@core/utils/queue'
import { sleep } from '@core/utils/index'
import styles from './tradeofeer-styles.css'

export class TradeOfferCreate {
  constructor() {
    this.partner = null
    this.selector = '.trade_area'
    this.yourInventoryStore = new InventoryStore(store)
    this.partnerInventoryStore = new InventoryStore(store)

    this.yourItemsIds = []
    this.theirItemsIds = []
    this.activeInventory = null

    this.slotsFix = debounce(() => {
      document.querySelectorAll('.itemHolder.trade_slot').forEach((slot) => {
        if (
          slot.parentNode.id !== 'your_slots' &&
          slot.parentNode.id !== 'their_slots'
        )
          slot.remove()
      })
    }, 500)

    makeObservable(this, {
      yourItemsIds: observable,
      theirItemsIds: observable,
      yourItemsSum: computed,
      theirItemsSum: computed,
      yourItems: computed,
      theirItems: computed,
      selectHandler: action,
      setYourIds: action,
      setTheirItemsIds: action,
    })
  }

  get $dom() {
    return document.querySelector(this.selector)
  }

  restoreInventory(inventory) {
    if (store.userStore.steamId === inventory.owner) {
      this.yourInventoryStore.restoreInventory(inventory)
      this.activeInventory = this.yourInventoryStore
    }

    if (inventory.owner === this.partner) {
      this.partnerInventoryStore.restoreInventory(inventory)
      this.activeInventory = this.partnerInventoryStore
    }

    const $page =
      this.activeInventory.inventoryPage?.childNodes[
        this.activeInventory.currentPage
      ]

    if ($page) {
      for (const $itemHolder of $page.childNodes) {
        const $item = $itemHolder.querySelector('.item')

        if (!$item || !$item.id) continue

        const [, , assetId] = $item.id.split('_')

        const item = this.activeInventory.assets[assetId]
        if (this.activeInventory.appId === 730) {
          priceQueue.push(async () => {
            await item.getDetails()
            item.render.renderParams()
          })
        }

        item?.render.renderField(SelectItemField)
      }
    }

    this.selectHandler()
  }

  setPatrner(partner) {
    this.partner = partner
  }

  createContainer() {
    this.$dom.style.position = 'relative'

    this.$container = document.createElement('div')
    this.$container.classList.add('.react_container')
    this.$dom.appendChild(this.$container)

    this.$info_container = document.createElement('div')
    this.$info_container.classList.add('.react_container')
    this.$dom.prepend(this.$info_container)

    this.$inventory_container = document.createElement('div')
    this.$inventory_container.classList.add('.react_container')
    document
      .querySelector('.trade_box_contents')
      .prepend(this.$inventory_container)

    this.$your_container = document.createElement('div')
    this.$your_container.classList.add('.react_container')
    document
      .querySelector('#trade_yours .offerheader')
      .append(this.$your_container)

    this.$their_container = document.createElement('div')
    this.$their_container.classList.add('.react_container')
    document
      .querySelector('#trade_theirs .offerheader')
      .append(this.$their_container)
  }

  get hasContainer() {
    return !!this.$dom.querySelector('.react_container')
  }

  get $yourItems() {
    return this.$dom.querySelector('#your_slots')
  }

  get $theirItems() {
    return this.$dom.querySelector('#their_slots')
  }

  selectItem($item) {
    const clickEvent = document.createEvent('MouseEvents')
    clickEvent.initEvent('dblclick', true, true)
    $item.dispatchEvent(clickEvent)
    this.slotsFix()
  }

  setYourIds(yourItemsIds) {
    this.yourItemsIds = yourItemsIds
  }

  setTheirItemsIds(theirItemsIds) {
    this.theirItemsIds = theirItemsIds
  }

  async selectHandler() {
    const yourItemsIds = await getTradeItemsIds('me')
    this.setYourIds(yourItemsIds)

    const types = {}
    for (const item of this.yourItems) {
      if (this.yourInventoryStore.appId === 730) {
        priceQueue.push(async () => {
          await item.getDetails()
          item.render.renderParams()
        })
      }
      types[item.itemType] = (types[item.itemType] || 0) + 1
      item?.render.renderField(SelectItemField)
    }
    // console.log(types)
    const theirItemsIds = await getTradeItemsIds('them')
    this.setTheirItemsIds(theirItemsIds)

    for (const item of this.theirItems) {
      if (this.partnerInventoryStore.appId === 730) {
        priceQueue.push(async () => {
          await item.getDetails()
          item.render.renderParams()
        })
      }

      item?.render.renderField(SelectItemField)
    }
  }

  get yourItems() {
    return this.yourItemsIds.map((assetId) => {
      return this.yourInventoryStore.assets[assetId]
    })
  }

  get theirItems() {
    return this.theirItemsIds.map((assetId) => {
      return this.partnerInventoryStore.assets[assetId]
    })
  }

  get yourItemsSum() {
    return this.yourItems.reduce((acc, item) => {
      return acc + (item?.render?.fullPrice || 0)
    }, 0)
  }

  get theirItemsSum() {
    return this.theirItems.reduce((acc, item) => {
      return acc + (item?.render?.fullPrice || 0)
    }, 0)
  }

  async selectPage() {
    const { currentPage, owner, appId, contextId } = this.activeInventory
    const $page = this.$dom.querySelector(
      `#inventory_${owner}_${appId}_${contextId}`
    )

    const $currentPage = $page.childNodes[currentPage]
    const $itemsArray = $currentPage.querySelectorAll('.item')

    for (const $item of $itemsArray) {
      this.selectItem($item)
      await sleep(40)
    }
  }

  async selectAll() {
    const { owner, appId, contextId } = this.activeInventory

    const $page = this.$dom.querySelector(
      `#inventory_${owner}_${appId}_${contextId}`
    )

    const $itemsArray = $page.querySelectorAll('.item')

    for (const $item of $itemsArray) {
      this.selectItem($item)
      await sleep(10)
    }
  }

  async clearTradeMe() {
    for (const item of this.yourItems) {
      this.selectItem(item.render.$dom)
      await sleep(10)
    }
    this.slotsFix()
  }

  async clearTradeThem() {
    for (const item of this.theirItems) {
      this.selectItem(item.render.$dom)
      await sleep(10)
    }
    this.slotsFix()
  }

  async init() {
    const partner = await getParnerSteamId()

    const debouncedCallback = debounce(this.selectHandler.bind(this), 100)
    this.observer = new MutationObserver(debouncedCallback)

    const mutationOptions = {
      attributes: false,
      childList: true,
      subtree: true,
    }

    this.observer.observe(this.$yourItems, mutationOptions)
    this.observer.observe(this.$theirItems, mutationOptions)

    this.$dom.addEventListener('click', (event) => {
      const $item = event.target.closest('.item')

      if ($item) {
        this.selectItem($item)
      }
    })

    this.setPatrner(partner.profileData)
    this.render()
  }

  quickAccept() {
    quickAcceptTradeoffer()
  }

  render() {
    if (this.hasContainer) return
    this.createContainer()

    const InfoController = observer(() => (
      <div className={styles.info_container}>
        <div>Trade Summary</div>
        <div className={styles.info_rows}>
          <div className={styles.info_row}>
            <span>Your</span>
            <span>{this.yourItemsIds.length} items</span>
            <CurrencyComponentView
              amount={this.yourItemsSum}
              currencyCode="USD"
            />
          </div>
          <div className={styles.info_row}>
            <span>Their</span>
            <span>{this.theirItemsIds.length} items</span>
            <CurrencyComponentView
              amount={this.theirItemsSum}
              currencyCode="USD"
            />
          </div>
        </div>
      </div>
    ))

    const InventoryController = () => {
      return (
        <div className={styles.inventory_container}>
          <Button onClick={() => this.selectPage()}>Select Page</Button>
          <Button onClick={() => this.selectAll()}>Select All</Button>
        </div>
      )
    }

    const Controller = () => {
      return (
        <div className={styles.container}>
          <Button onClick={this.quickAccept}>Quick Accept</Button>
          <Button
            onClick={() => {
              this.clearTradeMe()
              this.clearTradeThem()
            }}
          >
            Clear All
          </Button>
        </div>
      )
    }

    const YourController = () => {
      return (
        <div className={styles.container_trade}>
          <Button onClick={() => this.clearTradeMe()}>Clear</Button>
        </div>
      )
    }

    const TheirController = () => {
      return (
        <div className={styles.container_trade}>
          <Button onClick={() => this.clearTradeThem()}>Clear</Button>
        </div>
      )
    }

    ReactDOM.render(<InfoController />, this.$info_container)
    ReactDOM.render(<InventoryController />, this.$inventory_container)
    ReactDOM.render(<Controller />, this.$container)
    ReactDOM.render(<YourController />, this.$your_container)
    ReactDOM.render(<TheirController />, this.$their_container)
  }
}
