/* eslint-disable max-len */
import { getCurrencyCode, getCurrencySymbol } from '@core/utils/currency-helper'
import { sleep } from '@core/utils/index'
import { overridSteaMinventoryLoad } from './overrides-steam'

window.addEventListener('message', async (e) => {
  if (e.data.type === 'request_assets') {
    if (window.location.href.includes('tradeoffer/')) {
      const assets = Object.entries(
        window.g_ActiveInventory.rgInventory || {}
      ).map((item) => [
        item[0],
        {
          description: {
            ...item[1],
            element: null,
            homeElement: null,
          },
          assetid: item[1].id,
          contextid: item[1].contextid,
        },
      ])

      window.postMessage(
        {
          type: 'response_assets',
          data: {
            currentPage: window.g_ActiveInventory.pageCurrent,
            contextId: window.g_ActiveInventory.contextid,
            appId: window.g_ActiveInventory.appid,
            count: window.g_ActiveInventory.rgItemElements.length,
            owner: window.g_ActiveInventory.owner.strSteamId,
            assets: Object.fromEntries(assets),
          },
        },
        '*'
      )
      return
    }

    const currentPage = window.g_ActiveInventory.m_iCurrentPage
    const contextId = window.g_ActiveInventory.m_contextid
    const count = window.g_ActiveInventory.m_rgChildInventories
      ? Object.values(window.g_ActiveInventory.m_rgChildInventories).reduce(
          (sum, curr) => curr.m_cItems + sum,
          0
        )
      : window.g_ActiveInventory.m_cItems
    const appId = window.g_ActiveInventory.m_appid
    const assets = window.g_ActiveInventory.m_rgChildInventories
      ? Object.values(window.g_ActiveInventory.m_rgChildInventories)
          .map(({ m_rgAssets }) =>
            Object.entries(m_rgAssets).map(([key, val]) => [
              key,
              { ...val, element: null, homeElement: null },
            ])
          )
          .flat()
      : window.g_ActiveInventory.m_rgItemElements
          .map((fn) =>
            fn?.[0].children[0].id.replace(`${appId}_${contextId}_`, '')
          )
          .map((id, index) => [
            id,
            {
              ...window.g_ActiveInventory.m_rgAssets[id],
              index,
              element: null,
              homeElement: null,
            },
          ])

    window.postMessage(
      {
        type: 'response_assets',
        data: {
          currentPage,
          contextId,
          appId,
          count,
          owner: window.g_ActiveInventory.m_owner.strSteamId,
          assets: Object.fromEntries(assets),
        },
      },
      '*'
    )
  }

  if (e.data.type === 'get_listing_info') {
    window.postMessage(
      {
        type: 'response_get_listing_info',
        data: {
          assets: window.g_rgAssets,
          listingInfo: window.g_rgListingInfo,
        },
      },
      '*'
    )
  }

  if (e.data.type === 'resize_items_per_page') {
    window.g_oSearchResults.m_cPageSize = e.data.perPage
    window.g_oSearchResults.GoToPage(0, true)
  }

  if (e.data.type === 'quickAcceptTradeoffer') {
    window.g_bConfirmPending = false
    window.UserYou.bReady = true
    window.ConfirmTradeOffer()
  }

  if (e.data.type === 'loadFullInventory') {
    overridSteaMinventoryLoad()
    if (window.g_ActiveInventory.GetCountTotalItems() < 75) {
      await window.g_ActiveInventory.LoadMoreAssets()
    }

    window.g_ActiveInventory.LoadCompleteInventory().done(() => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < window.g_ActiveInventory.m_cPages; i++) {
        window.g_ActiveInventory.m_rgPages[i].EnsurePageItemsCreated()
        window.g_ActiveInventory.PreloadPageImages(i)
      }

      window.postMessage(
        {
          type: 'loadedFullInventory',
        },
        '*'
      )
    })
  }

  if (e.data.type === 'profile_data') {
    window.postMessage(
      {
        type: 'response_profile_data',
        data: {
          profileData: window.g_rgProfileData,
        },
      },
      '*'
    )
  }

  if (e.data.type === 'get_partnerSteamId') {
    window.postMessage(
      {
        type: 'response_get_partnerSteamId',
        data: {
          profileData: window.g_ulTradePartnerSteamID,
        },
      },
      '*'
    )
  }

  if (e.data.type === 'get_trade_items_ids') {
    window.postMessage(
      {
        type: 'response_get_trade_items_ids',
        data: {
          ids: window.g_rgCurrentTradeStatus[e.data.data]?.assets.map(
            ({ assetid }) => assetid
          ),
          user: e.data.data,
        },
      },
      '*'
    )
  }

  if (e.data.type === 'request_override_overview') {
    // eslint-disable-next-line no-new-func
    window.PopulateMarketActions = new Function(
      `return ${window.PopulateMarketActions.toString().replace(
        `var strInfo = '';`,
        `var strInfo = '';window.g_ActiveInventory.selectedItem.overview = transport.responseJSON;`
      )}`
    )()
  }

  if (e.data.type === 'request_selected_item') {
    window.postMessage(
      {
        type: 'response_selected_item',
        data: {
          ...window.g_ActiveInventory.selectedItem,
          homeElement: undefined,
          element: undefined,
        },
      },
      '*'
    )
  }

  if (e.data.type === 'user_request') {
    window.postMessage(
      {
        type: 'response_user',
        data: {
          steamId: window.g_steamID,
          sessionID: window.g_sessionID,
          language: window.g_strLanguage,
          wallet: window.g_rgWalletInfo,
          currency: {
            code:
              window.g_rgWalletInfo &&
              getCurrencyCode(window.g_rgWalletInfo.wallet_currency),
            symbol:
              window.g_rgWalletInfo &&
              getCurrencySymbol(window.g_rgWalletInfo.wallet_currency),
          },
        },
      },
      '*'
    )
  }

  if (e.data.type === 'select_page_to_trade') {
    for (const $item of window.g_ActiveInventory.pageList[
      window.g_ActiveInventory.pageCurrent
    ].children) {
      window.MoveItemToTrade($item)
      await sleep(4)
    }
  }

  if (e.data.type === 'select_all_to_trade') {
    for (const $item of window.g_ActiveInventory.rgItemElements) {
      window.MoveItemToTrade($item)
      await sleep(4)
    }
  }

  if (e.data.type === 'select_trade_me') {
    for (const { appid, assetid, contextid } of [
      ...window.g_rgCurrentTradeStatus.me.assets,
    ]) {
      window.MoveItemToInventory(
        window.UserYou.rgContexts[appid][contextid].inventory.rgInventory[
          assetid
        ].element
      )
    }
  }

  if (e.data.type === 'select_trade_them') {
    for (const { appid, assetid, contextid } of [
      ...window.g_rgCurrentTradeStatus.them.assets,
    ]) {
      window.MoveItemToInventory(
        window.UserThem.rgContexts[appid][contextid].inventory.rgInventory[
          assetid
        ].element
      )
      await sleep(4)
    }
  }
})
