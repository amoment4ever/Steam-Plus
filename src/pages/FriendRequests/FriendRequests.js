import { mainEmitter } from '@core/utils/event-emitter'
import { sleep } from '@core/utils/index'
import { inventoryLoadQueue } from '@core/utils/queue'
import { FriendRequest } from '@features/friend-request/friend-requets'

mainEmitter.on('load_user_info', () => {
  if (window.location.href.includes('pending')) {
    const $friendRequests = Array.from(
      document.querySelectorAll('.selectable.invite_row')
    )

    const friends = $friendRequests.map(
      ($friendDom) => new FriendRequest($friendDom)
    )

    friends.forEach((friend) => {
      inventoryLoadQueue.push(async () => {
        await friend.loadInventory()
        friend.renderInventoryCosts()
        await sleep(3000)
      })
    })
  }
})
