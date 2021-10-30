import React from 'react'
import { currencies } from './currencies-list'

const prettyPrintPrice = (currency = 'RUB', price) => {
  const nf = new Intl.NumberFormat()

  return price >= 0
    ? currencies[currency].sign + nf.format(price).replace(',', '.')
    : `-${currencies[currency].sign}${nf
        .format(Math.abs(price))
        .replace(',', '.')}`
}

export const CurrencyComponentView = ({ amount, className, currencyCode }) => {
  return (
    <span className={className}>{prettyPrintPrice(currencyCode, amount)}</span>
  )
}
