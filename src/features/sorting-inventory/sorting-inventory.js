/* eslint-disable react/no-this-in-sfc */
import React from 'react'
import ReactDOM from 'react-dom'
import { makeObservable, observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'

import { SelectItemField } from '@features/select-inventory/select-item-filed/select-item-field'
import { Dropdown } from '@shared/component/dropdown/dropdown'
import { priceQueue } from '@core/utils/queue'

import { Loader } from '@shared/component/loader/loader'
import SortingIcon from './sorting-component.svg'
import SortingIconMax from './sorting-max-component.svg'
import styles from './sorting-styles.css'

const sortFunctions = {
  default: (a, b) => b.itemOrigin.index - a.itemOrigin.index,
  priceAsc: (a, b) => (b.csmoneyPrice || 0) - (a.csmoneyPrice || 0),
  priceDesc: (a, b) => (a.csmoneyPrice || 0) - (b.csmoneyPrice || 0),
  floatAsc: (a, b) => {
    if (!a.inspectDetails?.floatvalue) {
      return -1
    }

    if (!b.inspectDetails?.floatvalue) {
      return 1
    }

    return (
      +(b.inspectDetails?.floatvalue || 0) -
      +(a.inspectDetails?.floatvalue || 0)
    )
  },
  floatDesc: (a, b) =>
    +(a.inspectDetails?.floatvalue || 0) - +(b.inspectDetails?.floatvalue || 0),
}

const sortNames = {
  default: () => 'Default',
  floatDesc: () => (
    <>
      <SortingIconMax className={styles.sort_icon} />
      <div>Float max</div>
    </>
  ),
  floatAsc: () => (
    <>
      <SortingIcon className={styles.sort_icon} />
      <div>Float min</div>
    </>
  ),
  priceDesc: () => (
    <>
      <SortingIconMax className={styles.sort_icon} />
      <div>Price max</div>
    </>
  ),
  priceAsc: () => (
    <>
      <SortingIcon className={styles.sort_icon} />
      <div>Price min</div>
    </>
  ),
}

const loadAllItems = (items) => {
  return new Promise((resolve) => {
    items.forEach((item) => {
      priceQueue.push(async () => {
        await item.getDetails()
        await item.render.renderPrice()
      })
    })

    priceQueue.on('end', resolve)
  })
}

export class SortInventory {
  constructor(inventoryStore, idElement, numberOfItemsPerPage) {
    this.sort = 'default'
    this.id = idElement
    this.numberOfItemsPerPage = numberOfItemsPerPage

    this.inventoryStore = inventoryStore
    this.detailsFetching = false

    makeObservable(this, {
      sort: observable,
      isCsInventory: computed,
      detailsFetching: observable,
      setDetailsFetching: action,
    })
  }

  setSort(sort) {
    this.sort = sort
  }

  get isCsInventory() {
    return this.inventoryStore.appId === 730
  }

  get hasContainer() {
    return window[this.id]
  }

  get sortedInventory() {
    return Object.values(this.inventoryStore.assets).sort(
      sortFunctions[this.sort]
    )
  }

  setDetailsFetching(detailsFetching) {
    this.detailsFetching = detailsFetching
  }

  async handleSort(sort) {
    this.setSort(sort)
    if (sort === 'floatDesc' || sort === 'floatAsc') {
      this.setDetailsFetching(true)
      await loadAllItems(this.sortedInventory)
      this.setDetailsFetching(false)
    } else if (sort !== 'default') {
      this.setDetailsFetching(true)
      const dopplers = this.sortedInventory.filter((item) =>
        item.marketHashName?.includes('Doppler')
      )
      if (dopplers.length) {
        await loadAllItems(dopplers)
      }
      this.setDetailsFetching(false)
    }
    this.sortInventory()

    const $page =
      this.inventoryStore.inventoryPage?.childNodes[
        this.inventoryStore.currentPage
      ]

    if ($page) {
      for (const $itemHolder of $page.childNodes) {
        const $item = $itemHolder.firstChild

        if (!$item || !$item.id) continue

        const [, , assetId] = $item.id.split('_')
        const item = this.inventoryStore.assets[assetId]
        if (this.inventoryStore.appId === 730) {
          priceQueue.push(async () => {
            if (sort !== 'floatDesc' && sort !== 'floatAsc') {
              await item.getDetails()
            }
            item.render.renderParams()
          })
        }

        item?.render.renderField(SelectItemField)
      }
    }
  }

  sortInventory() {
    const sortedElementsDom = this.sortedInventory
      .slice()
      .filter((item) => !!item.render.$dom)
      .map((item) => item.render.$dom.parentElement)

    Array.from(this.inventoryStore.inventoryPages).forEach((page) => {
      // eslint-disable-next-line no-param-reassign
      page.innerHTML = ''

      for (let i = 0; i < this.numberOfItemsPerPage; i += 1) {
        const $item = sortedElementsDom.pop()

        if ($item) {
          page.appendChild($item)
        } else {
          const emptySlot = document.createElement('div')
          emptySlot.classList.add('itemHolder', 'disabled')
          page.appendChild(emptySlot)
        }
      }
    })
  }

  render() {
    if (this.hasContainer) return
    const $container = document.createElement('div')
    $container.id = this.id
    window.active_inventory_page.prepend($container)

    const Controller = observer(() => {
      return (
        this.isCsInventory && (
          <div className={styles.sorting}>
            Sort:
            <Dropdown
              disabled={this.detailsFetching}
              label={sortNames[this.sort]()}
            >
              <Dropdown.Element onClick={() => this.handleSort('default')}>
                {sortNames.default()}
              </Dropdown.Element>
              <Dropdown.Element onClick={() => this.handleSort('floatDesc')}>
                {sortNames.floatDesc()}
              </Dropdown.Element>
              <Dropdown.Element onClick={() => this.handleSort('floatAsc')}>
                {sortNames.floatAsc()}
              </Dropdown.Element>
              <Dropdown.Element onClick={() => this.handleSort('priceDesc')}>
                {sortNames.priceDesc()}
              </Dropdown.Element>
              <Dropdown.Element onClick={() => this.handleSort('priceAsc')}>
                {sortNames.priceAsc()}
              </Dropdown.Element>
            </Dropdown>
            {this.detailsFetching && (
              <Loader className={styles.loader} size="14" />
            )}
          </div>
        )
      )
    })

    ReactDOM.render(<Controller />, $container)
  }
}
