import React from 'react'
import c from 'classnames'
import styles from './loader-styles.css'

export const Loader = ({ size = 20, className }) => (
  <div
    className={c(styles.loader, className)}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderWidth: `${Math.round(size / 10)}px`,
    }}
  />
)
