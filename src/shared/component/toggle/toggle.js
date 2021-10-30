/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import c from 'classnames'
import styles from './toggle-styles.css'

export const Toggle = ({ value = false, onChange }) => {
  return (
    <div
      onClick={() => onChange(!!value)}
      className={c(styles.container, !!value && styles.turned_on)}
    >
      <div className={styles.circle} />
    </div>
  )
}
