/* eslint-disable react/no-this-in-sfc */
import React from 'react'
import ReactDOM from 'react-dom'
import { store } from '@store/store-context'
import { computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'

import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import styles from './friend-request-styles.css'
import CsgoIcon from './csgoicon-component.svg'

const { pricesStore } = store

pricesStore.getCsmoneyPrices()

export class FriendRequest {
  constructor($dom) {
    this.$dom = $dom
    this.inventory = null

    makeObservable(this, {
      inventory: observable,
      inventoryCosts: computed,
    })
  }

  get steamId() {
    return this.$dom.dataset.steamid
  }

  createContainer() {
    const $container = document.createElement('div')
    $container.classList.add('react_element')
    this.$container = $container

    this.$dom
      ?.querySelector('.actions')
      .insertAdjacentElement('beforebegin', $container)
  }

  get hasContainer() {
    return this.$dom.querySelector('.react_element')
  }

  renderInventoryCosts() {
    if (this.hasContainer && this.inventoryCosts > 0) return

    this.createContainer()

    const Controller = observer(() => {
      return (
        <div className={styles.container}>
          <CsgoIcon />
          <div>
            Inventory costs{' '}
            <CurrencyComponentView
              amount={this.inventoryCosts}
              currencyCode="USD"
            />
          </div>
        </div>
      )
    })

    ReactDOM.render(<Controller />, this.$container)
  }

  get inventoryCosts() {
    return this.inventory?.reduce((acc, item) => {
      const itemPrice =
        pricesStore?.csmoneyPrices?.[item.description.market_hash_name] || 0

      return +(acc + itemPrice).toFixed(2)
    }, 0)
  }

  async loadInventory() {
    const inventory = await store.userStore.loadOtherInventory({
      steamId: this.steamId,
      appId: 730,
      contextId: 2,
    })

    this.inventory = inventory
  }
}
