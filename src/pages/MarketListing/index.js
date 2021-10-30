import { MarketListingsPage } from '@features/market-listings/market-listings-page'
import { renderNotificationManager } from '@features/notifications/notification-manager/index'

window.addEventListener('load', () => {
  const marketListingPage = new MarketListingsPage()

  if (marketListingPage.$dom) {
    marketListingPage.init()
  }
})

renderNotificationManager()
