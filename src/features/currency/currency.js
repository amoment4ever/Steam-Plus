import React from 'react'
import { store } from '@store/store-context'
import { observer } from 'mobx-react'
import { CurrencyComponentView } from './cyrrency-view'

export const CurrencyComponent = observer(({ amount, className }) => {
  return (
    <CurrencyComponentView
      className={className}
      amount={amount}
      currencyCode={store.userStore.currency?.code}
    />
  )
})
