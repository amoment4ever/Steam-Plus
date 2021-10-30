import { store } from '@store/store-context'
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { CopyCopmponent } from '@shared/component/copy/copy'
import styles from './copy-styles.css'

export class CopyName {
  constructor($container) {
    this.$container = $container
    this.$container.innerText = ''
    this.$name = document.createElement('div')
    this.$container.appendChild(this.$name)
  }

  render() {
    const Name = observer(() => {
      return (
        <span className={styles.container}>
          <span style={{ flex: 1 }}>
            {store.selectedItemStore.item?.description?.name}
          </span>
          <CopyCopmponent
            copyText={store.selectedItemStore.selectedItem?.fullItemName}
            className={styles.copy_icon}
            copyTooltipText="copy full name"
          />
        </span>
      )
    })

    ReactDOM.render(<Name />, this.$name)
  }
}
