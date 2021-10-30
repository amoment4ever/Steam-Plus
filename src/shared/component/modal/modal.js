/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import ReactDOM from 'react-dom'
import c from 'classnames'

import { CSSTransition } from 'react-transition-group'

import CloseIcon from '@shared/icons/close-component.svg'
import styles from './modal-styles.css'

const transitionClassNames = {
  enter: styles.container_enter,
  enterActive: styles.container_enter_active,
  exit: styles.container_exit,
  exitActive: styles.container_exit_active,
}

const modalExtension = document.createElement('div')

modalExtension.id = 'modalExtension'
document.body.appendChild(modalExtension)
export const Modal = ({
  children,
  isOpen,
  closeHandler,
  classNameBody,
  className,
  classNameTitle,
  classNameFooter,
  title,
  footer,
  onExited,
}) => {
  function handleCloseModal() {
    if (closeHandler && isOpen) closeHandler()
  }

  function handleEscPress({ key }) {
    if (key === 'Escape') handleCloseModal()
  }

  function handleInsideModalClick(event) {
    event.stopPropagation()
  }

  return ReactDOM.createPortal(
    <CSSTransition
      onExited={onExited}
      in={isOpen}
      timeout={400}
      classNames={transitionClassNames}
      unmountOnExit
    >
      <div
        role="dialog"
        onKeyDown={handleEscPress}
        onClick={handleCloseModal}
        className={styles.overlay}
      >
        <div
          onClick={handleInsideModalClick}
          aria-modal="true"
          tabIndex={-1}
          className={c(styles.modal, className)}
        >
          {title && (
            <div className={c(styles.title, classNameTitle)}>{title}</div>
          )}
          <div className={c(styles.body, classNameBody)}>{children}</div>
          {closeHandler && (
            <CloseIcon onClick={handleCloseModal} className={styles.close} />
          )}
          {footer && (
            <div className={c(styles.footer, classNameFooter)}>{footer}</div>
          )}
        </div>
      </div>
    </CSSTransition>,
    document.querySelector('#modalExtension')
  )
}
