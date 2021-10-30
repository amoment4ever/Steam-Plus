/* eslint-disable react/button-has-type */
import c from 'classnames'
import React from 'react'

import styles from './button-styles.css'

export const Button = ({
  children,
  onClick,
  disabled,
  outline,
  className,
  ...otherProps
}) => (
  <button
    onClick={() => {
      if (!disabled) {
        onClick()
      }
    }}
    className={c(
      styles.button,
      className,
      outline && styles.button_outline,
      disabled && styles.disabled
    )}
    {...otherProps}
  >
    <span className={styles.text}>{children}</span>
  </button>
)
