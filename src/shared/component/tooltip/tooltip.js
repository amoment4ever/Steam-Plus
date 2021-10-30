/* eslint-disable consistent-return */
import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import c from 'classnames'

import { CSSTransition } from 'react-transition-group'
import styles from './tooltip-styles.css'

const buildScrollHandler = (callback) => () => {
  callback(false)
}

const cssTransitionClasses = {
  enter: styles.tooltip_enter,
  enterActive: styles.tooltip_enter_active,
  exit: styles.tooltip_exit,
  exitActive: styles.tooltip_exit_active,
}

export const Tooltip = ({
  className,
  contentClassName,
  children,
  content,
  position = 'right',
  marginContent = 0,
  show = true,
}) => {
  const [isVisible, setVisible] = useState(false)
  const [coordinates, setCoordinates] = useState({})
  const timer = useRef(null)
  const scrollHandler = useRef(buildScrollHandler(setVisible))

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('scroll', scrollHandler.current, {
        passive: true,
      })
    } else {
      document.removeEventListener('scroll', scrollHandler.current)
    }
  }, [isVisible])

  const mouseOverHandler = (event) => {
    const { x, y, height, width } =
      event.currentTarget.firstChild.getBoundingClientRect()

    timer.current = setTimeout(() => {
      setVisible(true)
    }, 200)

    switch (position) {
      case 'top':
        return setCoordinates({
          left: x + width / 2 + window.scrollX,
          top: y - 9 + window.scrollY - marginContent,
          transform: 'translate(-50%, -100%)',
        })
      case 'top-right':
        return setCoordinates({
          left: x + width + 5 + window.scrollX + marginContent,
          top: y - 9 + window.scrollY - marginContent,
          transform: 'translateY(-100%)',
        })
      case 'bottom':
        return setCoordinates({
          left: x + width / 2 + window.scrollX,
          top: y + height + 5 + window.scrollY + marginContent,
          transform: 'translateX(-50%)',
        })
      case 'left':
        return setCoordinates({
          left: x - 5 + window.scrollX - marginContent,
          top: y + 1 + window.scrollY,
          transform: 'translateX(-100%)',
        })
      case 'right':
        return setCoordinates({
          left: x + width + 5 + window.scrollX + marginContent,
          top: y + (height - 23) / 2 + window.scrollY,
        })
      case 'bottom_right':
        return setCoordinates({
          left: x + width + 5 + window.scrollX + marginContent,
          top: y + height + 5 + window.scrollY + marginContent,
        })
      default:
    }
  }

  const mouseLeaveHandler = () => {
    clearTimeout(timer.current)
    setVisible(false)
  }

  return (
    <div
      onMouseEnter={mouseOverHandler}
      onMouseLeave={mouseLeaveHandler}
      className={c(styles.wrapper, className)}
    >
      {children}
      {show &&
        ReactDOM.createPortal(
          <CSSTransition
            classNames={cssTransitionClasses}
            in={isVisible}
            timeout={300}
            unmountOnExit
          >
            <div className={styles.tooltip} style={coordinates}>
              <div className={c(contentClassName, styles.tooltip__content)}>
                {content}
              </div>
            </div>
          </CSSTransition>,
          document.querySelector('#tooltips')
        )}
    </div>
  )
}
