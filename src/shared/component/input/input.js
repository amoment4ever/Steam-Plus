import c from 'classnames'
import React, { useRef } from 'react'

import Arrow from '@shared/icons/arrow-component.svg'

import styles from './input-styles.module.css'

export const Input = ({
  value,
  onChange,
  type = 'text',
  error,
  size,
  placeholder,
  name,
  disabled,
  step,
  className,
}) => {
  const inputRef = useRef(null)

  const onChangeHandler = (event) => {
    if (onChange) {
      onChange({
        value: event.target.value,
        target: event.target,
        currentTarget: event.currentTarget,
      })
    }
  }

  const arrowHandler = (derc) => {
    if (onChange) {
      if (derc) {
        inputRef.current.stepDown()
      } else {
        inputRef.current.stepUp()
      }
      onChange({
        value: inputRef.current.value,
        target: inputRef.current,
        currentTarget: inputRef.current,
      })
    }
  }

  return (
    <div
      className={c(
        styles['input-wrapper'],
        error && styles.error,
        disabled && styles.disabled,
        className,
        type === 'number' && styles.number
      )}
    >
      <input
        ref={inputRef}
        name={name}
        disabled={disabled}
        placeholder={placeholder}
        size={size}
        type={type}
        value={value}
        step={step}
        onChange={onChangeHandler}
        className={c(styles.input)}
      />
      {type === 'number' && (
        <div className={styles.arrows}>
          <Arrow
            onClick={() => {
              arrowHandler(false)
            }}
            className={c(styles.arrow, styles.arrow_top)}
          />
          <Arrow
            onClick={() => {
              arrowHandler(true)
            }}
            className={styles.arrow}
          />
        </div>
      )}
    </div>
  )
}
