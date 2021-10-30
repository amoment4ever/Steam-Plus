import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import c from 'classnames'

import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import { Tooltip } from '@shared/component/tooltip/tooltip'
import LogoIcon from './price-logo-component.svg'
import styles from './csm-price.styles.css'

export const CsmPrice = observer(({ priceInfo, className, showTooltip }) => {
  const overpay = useMemo(() => {
    if (!priceInfo) return null

    const { overpay_float = 0, overpay_pattern = 0 } = priceInfo

    return +(overpay_float + overpay_pattern).toFixed(2)
  })
  const fullPrice = useMemo(() => {
    if (!priceInfo) return null

    const { csm_price } = priceInfo

    return +(csm_price + overpay).toFixed(2)
  })

  const showTooltipIcon = overpay > 0 || !!showTooltip

  return (
    <div className={c(styles.total_price, className)}>
      {fullPrice ? (
        <Tooltip
          position="top-right"
          contentClassName={styles.prices_tooltip}
          show={showTooltipIcon}
          content={
            <div className={styles.prices_block}>
              <div className={styles.row}>
                <div className={styles.row_label}>Float</div>
                <div className={styles.row_value}>
                  {(!!priceInfo?.overpay_float && (
                    <CurrencyComponentView
                      amount={priceInfo?.overpay_float}
                      currencyCode="USD"
                    />
                  )) ||
                    'N/A'}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.row_label}>Pattern</div>
                <div className={styles.row_value}>
                  {priceInfo?.overpay_pattern ? (
                    <CurrencyComponentView
                      amount={priceInfo?.overpay_pattern}
                      currencyCode="USD"
                    />
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.row_label}>Default Price</div>
                <div className={styles.row_value}>
                  {priceInfo?.csm_price ? (
                    <CurrencyComponentView
                      className={styles.row_label}
                      amount={priceInfo?.csm_price}
                      currencyCode="USD"
                    />
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
              <LogoIcon />
            </div>
          }
        >
          <CurrencyComponentView amount={fullPrice} currencyCode="USD" />
          {showTooltipIcon && (
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.total_price_hint}
            >
              <path d="M5 0C2.24308 0 0 2.24288 0 5C0 7.75712 2.24308 10 5 10C7.75692 10 10 7.75712 10 5C10 2.24288 7.75692 0 5 0ZM7.40385 5.38462H5.38462V7.5C5.38462 7.71231 5.21231 7.88462 5 7.88462C4.78769 7.88462 4.61538 7.71231 4.61538 7.5V5.38462H2.59615C2.38385 5.38462 2.21154 5.21231 2.21154 5C2.21154 4.78769 2.38385 4.61538 2.59615 4.61538H4.61538V2.69231C4.61538 2.48 4.78769 2.30769 5 2.30769C5.21231 2.30769 5.38462 2.48 5.38462 2.69231V4.61538H7.40385C7.61615 4.61538 7.78846 4.78769 7.78846 5C7.78846 5.21231 7.61615 5.38462 7.40385 5.38462Z" />
            </svg>
          )}
        </Tooltip>
      ) : (
        'N/A'
      )}
    </div>
  )
})
