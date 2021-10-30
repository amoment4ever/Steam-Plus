import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { store } from '@store/store-context'
import { Button } from '@shared/component/button/button'
import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import styles from './select-inventory.css'

const { sellItemsStore, inventoryStore, userStore } = store

export const SelectInventory = observer(() => {
  useEffect(() => {
    sellItemsStore.closeModal()
    sellItemsStore.resetItems()
  }, [inventoryStore.appId])

  const toggleSelect = () => {
    sellItemsStore.setSelectMode(!sellItemsStore.selectMode)
    if (!sellItemsStore.selectMode) {
      sellItemsStore.setSelectedItems([])
    }
  }
  const selectAll = () => {
    const $page =
      inventoryStore.inventoryPage?.childNodes[inventoryStore.currentPage]
    const $items = $page?.querySelectorAll(`.item.app${inventoryStore.appId}`)
    const ids = [...sellItemsStore.selectedItems]
    $items.forEach(({ id }) => {
      if (id) {
        const itemStore = inventoryStore.assets[id.split('_').reverse()[0]]
        if (itemStore?.itemOrigin.description.marketable && !ids.includes(id)) {
          ids.push(id)
        }
      }
    })
    sellItemsStore.setSelectedItems(ids)
  }

  return (
    !!inventoryStore.count && (
      <div className={styles.panel}>
        {userStore.steamId === inventoryStore.owner && (
          <>
            <Button onClick={toggleSelect}>
              {sellItemsStore.selectMode ? 'Cancel' : 'Select for sale'}
            </Button>
            <Button
              style={{
                visibility: sellItemsStore.selectMode ? 'visible' : 'hidden',
              }}
              outline
              onClick={selectAll}
            >
              Select page
            </Button>
          </>
        )}
        <div style={{ margin: '0 auto' }}>
          {sellItemsStore.selectMode ? (
            <span>
              Selected: {sellItemsStore.selectedItems.length} items /{' '}
              <CurrencyComponentView
                currencyCode="USD"
                amount={sellItemsStore.selectedItemsPrice}
              />
            </span>
          ) : (
            <span>
              {`Total: ${inventoryStore.count} items`}
              {inventoryStore.appId === 730 && (
                <>
                  <> / </>
                  <CurrencyComponentView
                    amount={inventoryStore.totalPrice}
                    currencyCode="USD"
                  />
                </>
              )}
            </span>
          )}
        </div>
        <Button
          style={{
            visibility: sellItemsStore.selectedItems.length
              ? 'visible'
              : 'hidden',
            margin: '0 auto',
          }}
          onClick={() => {
            sellItemsStore.openModal()
          }}
        >
          Sell
        </Button>
      </div>
    )
  )
})
