import React, { useState } from 'react'
import { CalculateFeeAmount, getPublisherFee } from '@core/utils/steam-prices'
import { CurrencyComponent } from '@features/currency/currency'
import { Button } from '@shared/component/button/button'
import { store } from '@store/store-context'
import { Loader } from '@shared/component/loader/loader'
import { observer } from 'mobx-react'
import styles from './fast-sell-btn.css'

export const FastSellButton = observer(({ container: $container }) => {
  const [disabled, setDisabled] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const clickHandler = async () => {
    const { selectedItem } = store.selectedItemStore
    const { fees } = CalculateFeeAmount(
      selectedItem.overviewMinPrice - 1,
      getPublisherFee()
    )
    setDisabled(true)
    $container
      .querySelector('.item_market_action_button')
      .classList.add(styles.disabled)

    setLoading(true)
    await store.userStore.listItemOnMarket({
      amount: 1,
      price: selectedItem.overviewMinPrice - 1 - fees,
      item: selectedItem,
      notify: true,
    })
    setLoading(false)
  }
  return (
    <div className={styles.btn}>
      {store.selectedItemStore.selectedItem?.overviewMinPrice && (
        <Button disabled={disabled} onClick={clickHandler}>
          Fast sell:{' '}
          <CurrencyComponent
            amount={
              (store.selectedItemStore.selectedItem.overviewMinPrice - 1) / 100
            }
          />
        </Button>
      )}
      {isLoading && <Loader className={styles.loader} size="18" />}
    </div>
  )
})
