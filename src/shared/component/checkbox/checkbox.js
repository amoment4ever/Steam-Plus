import React from 'react'
import c from 'classnames'

import CheckboxIcon from '@shared/icons/check-component.svg'
import styles from './checkbox-styles.css'

export const Checkbox = ({
  isChecked = false,
  disabled = false,
  label,
  onClick,
}) => {
  const changeHandler = (e) => {
    if (!disabled) {
      onClick(e)
    }
  }
  return (
    <div
      onClick={changeHandler}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex="0"
      className={c(styles.container, disabled && styles.disabled)}
      onKeyPress={changeHandler}
    >
      <div className={c(styles.checkbox, isChecked && styles.checked)}>
        {isChecked && <CheckboxIcon className={styles.icon} />}
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
