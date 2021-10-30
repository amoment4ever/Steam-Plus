import React from 'react'
import ReactDOM from 'react-dom'
import c from 'classnames'
import { store } from '@store/store-context'
import { observer } from 'mobx-react'
import { Notification } from '../notification/index'
import styles from './notifications-manager.css'

export const NotificationsManager = observer(({ className }) => {
  const { notificationsStore } = store

  return (
    <div className={c(styles.container, className)}>
      {notificationsStore.notifications.map((notification) => (
        <Notification
          store={notificationsStore}
          {...notification}
          key={notification.id}
        />
      ))}
    </div>
  )
})

export const renderNotificationManager = () => {
  const $container = document.createElement('div')

  document.body.appendChild($container)
  ReactDOM.render(<NotificationsManager />, $container)
}

renderNotificationManager()
