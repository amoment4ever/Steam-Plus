import { renderNotificationManager } from '@features/notifications/notification-manager/index'
import { Profile } from '@features/profile/profile'

window.addEventListener('load', () => {
  const profile = new Profile()

  profile.render()
})

renderNotificationManager()
