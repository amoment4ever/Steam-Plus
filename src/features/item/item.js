import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { makeObservable, observable, action } from 'mobx'

import { CsmPrice } from '@features/csm-price/index'
import { sendBackgroundRequest } from '@core/utils/index'
import LockIcon from '@shared/icons/lock-component.svg'
import styles from './styles.css'

export class ItemRender {
  constructor(itemStore) {
    this.itemStore = itemStore
    this.priceInfo = null

    makeObservable(this, {
      priceInfo: observable,
      setPriceInfo: action,
    })
  }

  get $dom() {
    const { appId, contextId, assetId } = this.itemStore
    const { classid, instanceid } = this.itemStore.itemOrigin

    const $container = this.itemStore.inventoryStore.container

    return (
      document.getElementById(`${appId}_${contextId}_${assetId}`) ||
      document.getElementById(`item${appId}_${contextId}_${assetId}`) ||
      ($container || document).querySelector(
        `[data-economy-item="classinfo/${appId}/${classid}/${instanceid}"]`
      )
    )
  }

  get fullPrice() {
    if (!this.priceInfo) return null

    const { csm_price, overpay_float = 0, overpay_pattern = 0 } = this.priceInfo

    return +(csm_price + overpay_float + overpay_pattern).toFixed(2)
  }

  renderField(FieldComponent) {
    if (this.$itemField) return
    this.$itemField = document.createElement('div')
    this.$dom.appendChild(this.$itemField)
    ReactDOM.render(
      <FieldComponent
        id={this.$dom.id}
        disabled={!this.itemStore.itemOrigin.description.marketable}
      />,
      this.$itemField
    )
  }

  renderTradableLock() {
    if (this.$tradeLock) return
    if (
      !this.itemStore.itemOrigin.description.tradable &&
      this.itemStore.tradeLock
    ) {
      const cooldown =
        (new Date(this.itemStore.tradeLock) - Date.now()) / 1000 / 60
      let cooldownStr = ''
      if (cooldown <= 60) {
        cooldownStr = `${Math.round(cooldown)}m`
      } else if (cooldown / 60 <= 24) {
        cooldownStr = `${Math.round(cooldown / 60)}h`
      } else {
        cooldownStr = `${Math.round(cooldown / 60 / 24)}d`
      }
      this.$tradeLock = document.createElement('div')

      const Controller = observer(() => {
        return (
          <div
            className={
              this.itemStore.itemOrigin?.description?.fraudwarnings
                ? styles.trade_lock
                : styles.trade_lock_top
            }
          >
            <LockIcon />
            {cooldownStr}
          </div>
        )
      })

      ReactDOM.render(<Controller />, this.$tradeLock)

      this.$dom.appendChild(this.$tradeLock)
    }
  }

  renderParams() {
    this.renderPrice()
    this.renderTradableLock()
    if (this.$float || this.$pattern) return

    this.$float = document.createElement('div')
    this.$pattern = document.createElement('div')

    this.$float.classList.add(styles.float)
    this.$pattern.classList.add(styles.pattern)

    const { floatvalue, paintseed } = this.itemStore.inspectDetails || {}

    if (!floatvalue || !paintseed) return

    this.$float.innerHTML = floatvalue.toFixed(6)
    this.$pattern.innerHTML = paintseed

    this.$dom.appendChild(this.$float)
    this.$dom.appendChild(this.$pattern)

    const Controller = observer(() => {
      return (
        <>
          {paintseed}
          {(this.priceInfo?.rank && `(${this.priceInfo?.rank})`) || null}
        </>
      )
    })

    ReactDOM.render(<Controller />, this.$pattern)
  }

  get rankPattern() {
    return this.priceInfo?.rank
  }

  setPriceInfo(data) {
    this.priceInfo = data
  }

  async renderPrice() {
    if (this.$price) return

    this.$price = document.createElement('div')
    this.$price.classList.add(styles.price)

    const { marketHashName } = this.itemStore
    const { floatvalue, paintseed, paintindex } =
      this.itemStore.inspectDetails || {}

    if (!this.priceInfo && floatvalue) {
      const data = await sendBackgroundRequest('getPrice', {
        name: marketHashName,
        float: floatvalue,
        paintindex,
        pattern: paintseed,
      })

      this.setPriceInfo(data)
    }

    const PriceComponent = observer(() => {
      if (!this.priceInfo?.csm_price && !this.itemStore.csmoneyPrice)
        return null

      return (
        <CsmPrice
          priceInfo={
            this.priceInfo || { csm_price: this.itemStore.csmoneyPrice }
          }
          className={styles.csm_price}
        />
      )
    })

    ReactDOM.render(<PriceComponent />, this.$price)

    this.$dom.appendChild(this.$price)
  }
}
