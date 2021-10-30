/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable max-classes-per-file */
import React from 'react'
import ReactDOM from 'react-dom'
import { debounce } from '@core/utils/debounce'
import {
  getMarketListingItems,
  resizeItemsPerMarketPage,
} from '@features/bridge/index'
import { makeObservable, observable, action } from 'mobx'
import { observer } from 'mobx-react'
import { store } from '@store/store-context'
import { PaginationController } from '@shared/component/pagination-controller/pagination-controller'
import { ItemMarket } from './item-market/item-market'
import styles from './market-listing-styles.css'

const { pricesStore } = store

pricesStore.getCsmoneyPrices()

export class MarketListingsPage {
  constructor() {
    this.id = 'searchResultsRows'
    this.listingInfo = {}
    this.perPage = 10

    makeObservable(this, {
      perPage: observable,
      setPerPage: action.bound,
    })
  }

  setPerPage(event) {
    this.perPage = +event.target.textContent
    resizeItemsPerMarketPage(this.perPage)
  }

  get $dom() {
    return window[this.id]
  }

  get $itemsElements() {
    return this.$dom.querySelectorAll('.market_listing_row')
  }

  get hasContainer() {
    return this.$dom.querySelector('.react_element')
  }

  init() {
    this.$dom.addEventListener(
      'DOMNodeInserted',
      debounce(this.marketHandler.bind(this), 50)
    )

    this.$dom.addEventListener(
      'DOMNodeInserted',
      debounce(this.renderItemsPerPage.bind(this), 50)
    )

    this.marketHandler()
    this.renderItemsPerPage()
  }

  renderItemsPerPage() {
    if (this.hasContainer || !this.$dom) return

    const Controller = observer(() => {
      return (
        <div className={styles.per_page_items}>
          <div className={styles.per_page_label}>Show:</div>
          <PaginationController
            onSelect={this.setPerPage}
            elements={[10, 25, 50, 100]}
            selected={this.perPage}
          />
        </div>
      )
    })

    const $head = this.$dom.querySelector('.market_listing_table_header')

    if ($head) {
      const $space = document.createElement('span')
      $space.classList.add(
        'market_listing_right_cell',
        'market_listing_action_buttons'
      )

      $head
        .querySelector('.market_listing_price_listings_block')
        .prepend($space)
    }

    this.$container = document.createElement('div')
    this.$container.classList.add('.react_element')
    this.$dom.prepend(this.$container)

    ReactDOM.render(<Controller />, this.$container)
  }

  async marketHandler() {
    const { assets, listingInfo } = await getMarketListingItems()
    this.listingInfo = listingInfo

    this.listingInfo = {}

    Object.entries(listingInfo).forEach(([listingId, listingInfoItem]) => {
      const { appid, contextid, id } = listingInfoItem.asset

      const itemMarket = new ItemMarket(
        assets[appid][contextid][id],
        listingId,
        appid,
        listingInfoItem
      )

      this.listingInfo[listingId] = {
        listingInfo,
        item: itemMarket,
      }

      itemMarket.render()
    })
  }
}
