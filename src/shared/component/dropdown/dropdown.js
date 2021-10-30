/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useRef, useState } from 'react'
import c from 'classnames'

import { CSSTransition } from 'react-transition-group'
import { useOutsideClickHandler } from '@core/utils/hooks/use-click-outside'
import Arrow from '@shared/icons/arrow-component.svg'
import styles from './dropdown-styles.css'

const Element = ({ children, className, ...otherProps }) => {
  return (
    <div className={c(styles.element, className)} {...otherProps}>
      {children}
    </div>
  )
}

const transitionClassNames = {
  enter: styles.container_enter,
  enterActive: styles.container_enter_active,
  exit: styles.container_exit,
  exitActive: styles.container_exit_active,
}

export const Dropdown = ({ label, children, onSelect, bordered, disabled }) => {
  const [isOpen, setOpen] = useState(false)

  const refLabel = useRef(null)

  const toggle = () => setOpen(!isOpen)

  useOutsideClickHandler(refLabel, () => {
    setOpen(false)
  })

  return (
    <div
      className={c(
        styles.dropdown_wrapper,
        disabled && styles.disabled,
        isOpen && styles.open
      )}
    >
      <div
        ref={refLabel}
        onClick={toggle}
        className={c(styles.label, bordered && styles.bordered)}
      >
        {label}
        <Arrow className={styles.label_icon} />
      </div>
      <CSSTransition
        in={isOpen}
        timeout={400}
        classNames={transitionClassNames}
        unmountOnExit
      >
        <div onClick={onSelect} className={styles.dropdown_content}>
          {children}
        </div>
      </CSSTransition>
    </div>
  )
}

Dropdown.Element = Element
