import React from 'react'
import { observer } from 'mobx-react'
import c from 'classnames'

import { store } from '@store/store-context'
import styles from './select-item-field.css'

const { sellItemsStore } = store

export const SelectItemField = observer(({ id, disabled }) => {
  const clickHandler = () => {
    if (!disabled && sellItemsStore.selectMode) {
      sellItemsStore.setSelectedItems(id)
    }
  }

  if (!sellItemsStore.selectMode) {
    return null
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={c(
        styles.field,
        sellItemsStore.selectedItems.includes(id) && styles.field_selected,
        sellItemsStore.selectMode && styles.field_top,
        disabled && sellItemsStore.selectMode && styles.field_disabled
      )}
      onClick={clickHandler}
    />
  )
})
