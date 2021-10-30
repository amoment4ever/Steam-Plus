/* eslint-disable react/no-this-in-sfc */
/* eslint-disable guard-for-in */
/* eslint-disable max-classes-per-file */
import { Checkbox } from '@shared/component/checkbox/checkbox'
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { makeObservable, observable, action } from 'mobx'
import { Button } from '@shared/component/button/button'
import { store } from '@store/store-context'
import { Loader } from '@shared/component/loader/loader'
import buttonStyles from '@shared/component/button/button-styles.css'
import { api } from '@core/api'
import { getNumbersFromString } from '@core/utils/index'
import { CurrencyComponent } from '@features/currency/currency'
import styles from './own-market-listing-styles.css'

class OwnMarketListingItem {
  constructor(marketListing, id, block) {
    this.marketListing = marketListing
    this.id = id
    this.isSelected = false
    this.block = block
    this.itemName = this.$dom.querySelector(
      '.market_listing_item_name_link'
    ).innerText

    makeObservable(this, {
      isSelected: observable,
      setSelected: action,
    })

    this.render()
  }

  get $dom() {
    return window[this.id]
  }

  async removeFromSale() {
    const { itemName } = this

    const [type, id] = this.id.split('_')

    if (type === 'mybuyorder') {
      await store.userStore.removeBuyOrder({
        buy_orderid: id,
        marketHashName: itemName,
      })
    } else {
      await store.userStore.removeFromListing({
        listingId: id,
        marketHashName: itemName,
      })
    }

    if (this.$dom) {
      this.$dom.remove()
    }
  }

  createContainer() {
    this.$container = document.createElement('div')
    this.$container.classList.add('react_element', styles.container)
    this.$dom.appendChild(this.$container)
  }

  setSelected(isSelected) {
    this.isSelected = isSelected
  }

  render() {
    if (!this.$dom) return
    if (!this.$dom.querySelector('.react_element')) {
      this.createContainer()

      const Controller = observer(() => {
        return (
          <Checkbox
            isChecked={this.isSelected}
            onClick={() => this.setSelected(!this.isSelected)}
          />
        )
      })

      ReactDOM.render(<Controller />, this.$container)
    }
  }
}

export class OwnMarketListing {
  constructor(globalStore) {
    this.globalStore = globalStore
    this.items = {}
    this.id = 'tabContentsMyListings'
    this.isLoading = false
    this.myListing = {}
    this.totalBuyerPay = 0
    this.totalYouReceive = 0
    this.$htmlReponse = document.createElement('div')

    makeObservable(this, {
      isLoading: observable,
      setLoading: action,
      items: observable,
    })

    this.geMyListing()
  }

  get $dom() {
    return window[this.id]
  }

  pageHandler(page) {
    if (page.assets) {
      for (const appId in page.assets) {
        for (const contextId in page.assets[appId]) {
          for (const assetId in page.assets[appId][contextId]) {
            this.myListing[`${appId}_${contextId}_${assetId}`] =
              page.assets[appId][contextId][assetId]
          }
        }
      }
    }

    this.$htmlReponse.innerHTML =
      page.results_html + this.$htmlReponse.innerHTML
  }

  async geMyListing() {
    const firstPage = await OwnMarketListing.getPage(0, 100)

    this.pageHandler(firstPage)

    const totalCount = firstPage.total_count
    const morePages = Math.ceil(totalCount / 100) - 1
    if (morePages > 0) {
      for (const [index] of Object.entries([...new Array(morePages)])) {
        const page = await OwnMarketListing.getPage((index + 1) * 100, 100)
        this.pageHandler(page)
      }
    }

    let buyerPay = 0
    let youReceive = 0

    this.$htmlReponse
      .querySelectorAll(
        '#tabContentsMyActiveMarketListingsTable .market_listing_row[id^="mylisting_"]'
      )
      .forEach(($div) => {
        const [$buyerPay, $youRecive] = $div
          .querySelector('.market_listing_price > span')
          .querySelectorAll('span')

        buyerPay += +getNumbersFromString($buyerPay.innerHTML)
        youReceive += +getNumbersFromString($youRecive.innerHTML)
      })

    buyerPay = +buyerPay?.toFixed(2)
    youReceive = +youReceive?.toFixed(2)

    this.totalYouReceive = youReceive
    this.totalBuyerPay = buyerPay
    this.renderTotal()
  }

  static async getPage(start, count) {
    return api.get('https://steamcommunity.com/market/mylistings', {
      count,
      start,
    })
  }

  renderTotal() {
    if (this.totalBuyerPay && this.totalYouReceive) {
      const $listing = window.tabContentsMyActiveMarketListingsTable

      const $container = document.createElement('div')
      $listing.style.position = 'relative'
      $listing.appendChild($container)

      const Controller = () => {
        return (
          <div className={styles.total_container}>
            Total selling: <CurrencyComponent amount={this.totalBuyerPay} />(
            <CurrencyComponent amount={this.totalYouReceive} />)
          </div>
        )
      }

      ReactDOM.render(<Controller />, $container)
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading
  }

  get $headers() {
    return this.$dom.querySelectorAll('.market_listing_table_header')
  }

  createHeadersContainers() {
    this.$headers.forEach(($header, index) => {
      this[`$container_${index}`] = document.createElement('div')
      this[`$container_${index}`].classList.add('react_element')
      $header.appendChild(this[`$container_${index}`])
      // eslint-disable-next-line no-param-reassign
      $header.style.position = 'relative'
    })
  }

  init() {
    this.observer = new MutationObserver(this.listingHandler.bind(this))

    this.observer.observe(this.$dom, {
      attributes: true,
      childList: true,
      subtree: true,
    })

    this.listingHandler()
    this.changePickAndSellButton()
  }

  // eslint-disable-next-line class-methods-use-this
  changePickAndSellButton() {
    const $button = document.querySelector('.pick_and_sell_button')
    $button.classList.add('pick_and_sell_button_updated', buttonStyles.button)
    $button.style.width = '125px'
    const $btnContent = $button.querySelector(
      '.item_market_action_button_contents'
    )
    if ($btnContent) {
      $btnContent.style.background = 'unset'
      $btnContent.textContent = 'Open inventory'
    }
  }

  getShowedItems(index) {
    return Array.from(
      this.$headers[index].parentElement.querySelectorAll('.market_listing_row')
    )
      .map((element) => element.id)
      .map((id) => this.items[id])
  }

  listingHandler() {
    this.$headers.forEach((_, index) => {
      this.$headers[index].parentElement
        .querySelectorAll('.market_listing_row')
        .forEach((element) => {
          if (this.items[element.id]) {
            this.items[element.id].render()
            return
          }
          this.items[element.id] = new OwnMarketListingItem(
            this,
            element.id,
            index
          )
        })
    })

    if (
      this.$headers.length &&
      !this.$headers[0].querySelector('.react_element')
    ) {
      const Controller = observer(({ index }) => {
        const selectAll = () => {
          const items = this.getShowedItems(index)
          items.forEach((item) => {
            item.setSelected(true)
          })
        }

        const isSelectedOne = Object.values(this.items).find(
          (item) => index === item.block && item.isSelected
        )

        const removeFromSaleHandler = async () => {
          this.setLoading(true)
          for (const item of Object.values(this.items).filter(
            ({ block, isSelected }) => block === index && isSelected
          )) {
            await item.removeFromSale()
            delete this.items[item.id]
          }

          this.setLoading(false)
        }

        return (
          <div className={styles.buttons}>
            {isSelectedOne && (
              <Button
                disabled={this.isLoading}
                onClick={removeFromSaleHandler}
                className={styles.delete_from_sell}
              >
                {this.isLoading ? <Loader size="15" /> : 'Remove from sale'}
              </Button>
            )}
            <Button disabled={this.isLoading} outline onClick={selectAll}>
              Select all
            </Button>
          </div>
        )
      })

      this.$headers.forEach((_, index) => {
        this.createHeadersContainers()

        ReactDOM.render(
          <Controller index={index} />,
          this[`$container_${index}`]
        )
      })
    }
  }
}
