import { makeAutoObservable } from 'mobx'
import { uid } from 'uid'

export class NotificationsStore {
  constructor() {
    this.notifications = []

    makeAutoObservable(this)
  }

  addNotification(notification) {
    // eslint-disable-next-line no-param-reassign
    notification.id = uid(10)
    this.notifications.push(notification)
  }

  deleteNotification({ id }) {
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    )
  }
}
