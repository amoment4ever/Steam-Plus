// register the message listener in the page scope
export function injectScript(file_path, tag) {
  const node = document.getElementsByTagName(tag)[0]
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  node.appendChild(script)
}

injectScript(chrome.runtime.getURL('bridge.bundle.js'), 'head')

export function injectTooltip() {
  const tooltip = document.createElement('div')
  tooltip.id = 'tooltips'
  document.body.appendChild(tooltip)
}

injectTooltip()

let gActiveInventoryPromises = []
let gSelectedItemPromises = []
let gUserRequests = []
let gListingRequests = []
let gProfileData = []
let gPartnerSteamId = []
const gTradeItemsIds = {
  me: [],
  them: [],
}
let loadFullInventoryPromises = []

export const getInventory = () => {
  window.postMessage(
    {
      type: 'request_assets',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_assets') {
      gActiveInventoryPromises.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gActiveInventoryPromises = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gActiveInventoryPromises.push(resolve)
  })
}

export const getSelectedItem = () => {
  window.postMessage(
    {
      type: 'request_selected_item',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_selected_item') {
      gSelectedItemPromises.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gSelectedItemPromises = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gSelectedItemPromises.push(resolve)
  })
}

export const overrideGetOverviewFunc = () => {
  window.postMessage(
    {
      type: 'request_override_overview',
    },
    '*'
  )
}

export const getUserInfo = () => {
  window.postMessage(
    {
      type: 'user_request',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_user') {
      gUserRequests.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gUserRequests = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gUserRequests.push(resolve)
  })
}

export const getMarketListingItems = () => {
  window.postMessage(
    {
      type: 'get_listing_info',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_get_listing_info') {
      gListingRequests.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gListingRequests = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gListingRequests.push(resolve)
  })
}

export const getProfileData = () => {
  window.postMessage(
    {
      type: 'profile_data',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_profile_data') {
      gProfileData.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gProfileData = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gProfileData.push(resolve)
  })
}

export const getParnerSteamId = () => {
  window.postMessage(
    {
      type: 'get_partnerSteamId',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_get_partnerSteamId') {
      gPartnerSteamId.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      gPartnerSteamId = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gPartnerSteamId.push(resolve)
  })
}

export const getTradeItemsIds = (user) => {
  window.postMessage(
    {
      type: 'get_trade_items_ids',
      data: user,
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'response_get_trade_items_ids') {
      gTradeItemsIds[event.data.data.user].forEach((promiseResolver) =>
        promiseResolver(event.data.data.ids)
      )
      gTradeItemsIds[event.data.data.user] = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    gTradeItemsIds[user].push(resolve)
  })
}

export const loadFullInventory = () => {
  window.postMessage(
    {
      type: 'loadFullInventory',
    },
    '*'
  )

  window.addEventListener('message', function resolver(event) {
    if (event.data.type === 'loadedFullInventory') {
      loadFullInventoryPromises.forEach((promiseResolver) =>
        promiseResolver(event.data.data)
      )
      loadFullInventoryPromises = []

      this.window.removeEventListener('message', this)
    }
  })

  return new Promise((resolve) => {
    loadFullInventoryPromises.push(resolve)
  })
}

export const quickAcceptTradeoffer = () => {
  window.postMessage(
    {
      type: 'quickAcceptTradeoffer',
    },
    '*'
  )
}

export const selectPageToTrade = () => {
  window.postMessage(
    {
      type: 'select_page_to_trade',
    },
    '*'
  )
}

export const selectAllToTrade = () => {
  window.postMessage(
    {
      type: 'select_all_to_trade',
    },
    '*'
  )
}

export const clearTradeMe = () => {
  window.postMessage(
    {
      type: 'select_trade_me',
    },
    '*'
  )
}

export const clearTradeThem = () => {
  window.postMessage(
    {
      type: 'select_trade_them',
    },
    '*'
  )
}

export const resizeItemsPerMarketPage = (perPage) => {
  window.postMessage(
    {
      type: 'resize_items_per_page',
      perPage,
    },
    '*'
  )
}
