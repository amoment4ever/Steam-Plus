import { OwnMarketListing } from '@features/own-market-listing/own-market-listing-store'
import { renderNotificationManager } from '@features/notifications/notification-manager/index'

const ownMarketListing = new OwnMarketListing()

ownMarketListing.init()

renderNotificationManager()
