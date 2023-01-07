/* eslint-disable no-new */
import React from 'react'
import ReactDOM from 'react-dom'
import { debounce } from '@core/utils/debounce'
import {
  getInventory,
  getSelectedItem,
  overrideGetOverviewFunc,
  loadFullInventory,
} from '@features/bridge/index'
import { CopyName } from '@features/copy-name/index'
import { SelectInventory } from '@features/select-inventory/index'
import { store } from '@store/store-context'
import { SellModal } from '@features/select-inventory/sell-modal/sell-modal'
import { SelectItemField } from '@features/select-inventory/select-item-filed/select-item-field'
import { renderNotificationManager } from '@features/notifications/notification-manager/index'
import { SelectedItem } from '@features/selected-item/selected-item'
import { priceQueue } from '@core/utils/queue'
import { SortInventory } from '@features/sorting-inventory/sorting-inventory'

import styles from './inventory.styles.css'

const { selectedItemStore, inventoryStore, pricesStore } = store

pricesStore.getCsmoneyPrices()

const selectedItemHandler = debounce(async () => {
  const selectedItem = await getSelectedItem()
  selectedItemStore.restoreItem(selectedItem)
}, 200)

const inventoryHandler = debounce(async () => {
  const inventory = await getInventory()

  inventoryStore.restoreInventory(inventory)

  const $page =
    inventoryStore.inventoryPage?.childNodes[inventoryStore.currentPage]

  if ($page) {
    for (const $itemHolder of $page.childNodes) {
      const $item = $itemHolder.firstChild

      if (!$item || !$item.id) continue

      const [, , assetId] = $item.id.split('_')
      const item = inventoryStore.assets[assetId]
      if (inventoryStore.appId === 730) {
        priceQueue.push(async () => {
          await item.getDetails()
          item.render.renderParams()
        })
      }

      item?.render.renderField(SelectItemField)
    }
  }
}, 4)

window.addEventListener('load', () => {
  inventoryHandler()
  overrideGetOverviewFunc()
  selectedItemHandler()
  document
    .querySelector('#inventory_pagecontrols')
    .addEventListener('DOMNodeInserted', inventoryHandler)
  document
    .querySelector('.inventory_page_right')
    .addEventListener('DOMNodeInserted', selectedItemHandler)

  // loadFullInventory().then(() => {
  const sortInventory = new SortInventory(
    inventoryStore,
    'sort_inventory_element',
    25
  )
  inventoryHandler().then(() => {
    sortInventory.render()
  })

  // })
})

const $container = document.querySelector('#inventory_logos')
const $selectPanelContainer = document.createElement('div')
$container.appendChild($selectPanelContainer)
$container.classList.add(styles.container)
$selectPanelContainer.style.flex = '1'
ReactDOM.render(<SelectInventory />, $selectPanelContainer)

const selectedItem = new SelectedItem()

selectedItemStore.eventEmitter.on('changedItem', () => {
  const $nameArray = selectedItemStore.$dom.querySelectorAll('.hover_item_name')
  $nameArray.forEach((element) => {
    const copyFeature = new CopyName(element)
    copyFeature.render()
  })
  selectedItem.render()
})

const $sellModalContainer = document.createElement('div')
document.body.appendChild($sellModalContainer)

ReactDOM.render(<SellModal />, $sellModalContainer)

renderNotificationManager()
