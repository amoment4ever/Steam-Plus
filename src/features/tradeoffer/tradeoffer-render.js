/* eslint-disable react/no-this-in-sfc */
import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'

import { Button } from '@shared/component/button/button'
import styles from './tradeoffer-render-styles.css'

export class TradeOfferRender {
  constructor(tradeOfferStore) {
    this.tradeOfferStore = tradeOfferStore
  }

  get $dom() {
    return window[`tradeofferid_${this.tradeOfferStore.tradeofferId}`]
  }

  get hasContainer() {
    return !!this.$dom.querySelector('.react_container')
  }

  get $receiveItems() {
    return this.$dom.querySelector(
      `.tradeoffer_items.${
        this.tradeOfferStore.isOurOffer ? 'secondary' : 'primary'
      }`
    )
  }

  get $sentItems() {
    return this.$dom.querySelector(
      `.tradeoffer_items.${
        !this.tradeOfferStore.isOurOffer ? 'secondary' : 'primary'
      }`
    )
  }

  createContainer() {
    this.$sentTotalContainer = document.createElement('div')
    this.$sentTotalContainer.classList.add('.react_container')
    this.$sentItems.appendChild(this.$sentTotalContainer)

    this.$receiveTotalContainer = document.createElement('div')
    this.$receiveTotalContainer.classList.add('.react_container')
    this.$receiveItems.appendChild(this.$receiveTotalContainer)

    this.$fastSellContainer = document.createElement('div')
    this.$fastSellContainer.classList.add('.react_container')
    this.$dom.append(this.$fastSellContainer)
  }

  async acceptOffer() {
    let message = ''
    const middleElement = this.$dom.querySelector('.tradeoffer_items_rule')
    const offerContent = this.$dom.querySelector('.tradeoffer_items_ctn')

    try {
      const res = await this.tradeOfferStore.acceptOffer()

      if (res.needs_email_confirmation || res.needs_mobile_confirmation) {
        message = 'Accepted - Awaiting Confirmation'
      } else {
        message = 'Trade Accepted'
        middleElement.classList.add('accepted')
      }
    } catch (err) {
      console.log(err)
      message =
        err.errorMessage ||
        'Could not accept trade offer, most likely Steam is having problems.'
    }

    offerContent.classList.remove('active')
    offerContent.classList.add('inactive')

    middleElement.classList.remove('tradeoffer_items_rule')
    middleElement.classList.add('tradeoffer_items_banner')
    middleElement.style.height = ''
    middleElement.innerText = message
  }

  render() {
    if (this.hasContainer) return
    this.createContainer()

    const TotalToGive = observer(() => {
      return (
        <div className={styles.total}>
          Total:{' '}
          <CurrencyComponentView
            amount={this.tradeOfferStore.tradeOfferSummary.itemsToGiveSumm}
            currencyCode="USD"
          />
        </div>
      )
    })

    const TotalToReceive = observer(() => {
      return (
        <div className={styles.total}>
          Total:{' '}
          <CurrencyComponentView
            amount={this.tradeOfferStore.tradeOfferSummary.itemsToReceiveSumm}
            currencyCode="USD"
          />
        </div>
      )
    })

    const FastSellController = observer(() => {
      return (
        !this.tradeOfferStore.isOurOffer && (
          <Button
            onClick={() => {
              this.acceptOffer()
            }}
            className={styles.fast_sell_btn}
          >
            Fast accept
          </Button>
        )
      )
    })

    ReactDOM.render(<FastSellController />, this.$fastSellContainer)
    ReactDOM.render(<TotalToReceive />, this.$receiveTotalContainer)
    ReactDOM.render(<TotalToGive />, this.$sentTotalContainer)
  }
}
