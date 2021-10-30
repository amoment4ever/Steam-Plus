/* eslint-disable react/no-this-in-sfc */
import React, { useEffect, useRef } from 'react'
import c from 'classnames'
import { useLocalObservable, observer } from 'mobx-react'
import styles from './styles.css'

export const Notification = observer(({ id, text, store, type, icon }) => {
  const notificationRef = useRef(null)

  const notificationStore = useLocalObservable(() => ({
    isOpen: true,
    closeNotification() {
      const { height } = notificationRef.current.getBoundingClientRect()
      notificationRef.current.style.marginBottom = `-${height}px`
      this.isOpen = false

      setTimeout(() => {
        store.deleteNotification({ id })
      }, 500)
    },
    timerId: null,
  }))

  useEffect(() => {
    setTimeout(() => {
      notificationStore.closeNotification()
    }, 3000)
  }, [])

  return (
    <div
      ref={notificationRef}
      className={c(
        styles.notification,
        styles.animated,
        !notificationStore.isOpen && styles.close,
        type === 'error' && styles.error,
        icon && styles.notification_with_icon
      )}
    >
      {icon && <div className={styles.icon_notification}>{icon}</div>}
      {text}
    </div>
  )
})
