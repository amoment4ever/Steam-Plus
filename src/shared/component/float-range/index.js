import React from 'react'
import c from 'classnames'

import { Tooltip } from '@shared/component/tooltip/tooltip'
import FloatPointerIcon from './float-pointer-component.svg'
// import TriangleIcon from './triangle-component.svg'
import styles from './float-range-styles.css'

export const FloatRange = ({ className, max, min, value }) => {
  let exterior
  switch (true) {
    case value < 0.07:
      exterior = 'Factory New (FN)'
      break
    case value < 0.15:
      exterior = 'Minimal Wear (MW) '
      break
    case value < 0.37:
      exterior = 'Field-Tested (FT)'
      break
    case value < 0.44:
      exterior = 'Well-Worn (WW)'
      break
    default:
      exterior = 'Battle-Scarred (BS)'
      break
  }

  return (
    <div className={c(styles.wrapper, className)}>
      <div className={styles.bar} />

      {value > 0 ? (
        <>
          {min > 0 && (
            <>
              <div
                style={{
                  left: 0,
                  borderRadius: '2px 0px 0px 2px',
                  width: `${+min * 100}%`,
                }}
                className={styles.bar_bound}
              />
              <div
                style={{ left: `${+min * 100}%` }}
                className={styles.bound_label}
              >
                {min}
              </div>
            </>
          )}
          {max && 1 - max > 0 && (
            <>
              <div
                style={{
                  right: 0,
                  borderRadius: '0px 2px 2px 0px',
                  width: `${(1 - max) * 100}%`,
                }}
                className={styles.bar_bound}
              />
              <div
                style={{ left: `${+max * 100}%` }}
                className={styles.bound_label}
              >
                {max}
              </div>
            </>
          )}
          <Tooltip content={exterior}>
            <FloatPointerIcon
              style={{ left: `${+value * 100}%` }}
              className={styles.pointer}
            />
          </Tooltip>
        </>
      ) : (
        <div className={c(styles.bar_bound, styles.bar_bound_full)} />
      )}
    </div>
  )
}

export const FloatRangeWithLabel = ({ float, max, min, className }) => (
  <div className={c(styles.float_with_label, className)}>
    <div className={styles.float_label}>
      <span>Float:</span>
      <span className={styles.float_value}>{float}</span>
    </div>
    <FloatRange value={float} max={max} min={min} />
  </div>
)
