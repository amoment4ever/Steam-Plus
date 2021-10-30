import { makeAutoObservable } from 'mobx'
import { getNumbersFromString, sendBackgroundRequest } from '@core/utils/index'
import { ItemRender } from '@features/item/item'
// eslint-disable-next-line import/no-cycle
import { CalculateFeeAmount, getPublisherFee } from '@core/utils/steam-prices'
import { getSteamItemInfo } from '@pages/Background/actions/index'

const numberRegex = /(\d+|\.\d+|\d+\.\d+|\d+\.)$/

const cacheMinPrices = {}

export class ItemStore {
  constructor(itemOrigin, globalStore, inventoryStore) {
    this.itemOrigin = itemOrigin
    this.globalStore = globalStore
    this.inventoryStore = inventoryStore
    this.render = new ItemRender(this)
    this.overview = null
    this.lowesPrice = null
    this.lowesPriceLoading = false
    this.lowesPriceCallback = null
    this.inputPrice = null
    this.priceLoadError = false
    this.inspectDetails = null
    this.listingStatus = null
    this.listingMessage = null
    this.tradeLock = null

    makeAutoObservable(this, {
      itemOrigin: false,
      globalStore: false,
      render: false,
      inventoryStore: false,
    })
  }

  get nameColor() {
    const nameColor = this.itemOrigin?.description?.name_color
    return nameColor ? `#${nameColor}` : '#D2D2D2'
  }

  get marketHashName() {
    return this.itemOrigin.description?.market_hash_name
  }

  get itemType() {
    return this.itemOrigin.description.tags.find(
      (tag) => tag.category === 'Type'
    )?.name
  }

  get stickers() {
    // const stickerExp = /Sticker: (.*?)<\/center/

    const stickers = []

    for (const description of this.itemOrigin.description.descriptions) {
      if (
        /sticker_info/.test(description.value) &&
        this.inspectDetails?.stickers?.length
      ) {
        const stickerImgs = Array.from(
          description.value.matchAll(/src="([^"]+)"/g)
        ).map(([, url]) => url)

        this.inspectDetails?.stickers.forEach((sticker, index) => {
          stickers.push({
            stickerName: sticker.name,
            stickerImg: stickerImgs[index],
            stickerPrice:
              this.globalStore.pricesStore.csmoneyPrices?.[
                `Sticker | ${sticker.name}`
              ],
            stickerWear: sticker.wear,
          })
        })
      }
    }

    return stickers
  }

  get csmoneyPrice() {
    return (
      this.render.fullPrice ||
      this.globalStore.pricesStore.csmoneyPrices?.[this.fullItemName]
    )
  }

  get fullItemName() {
    return this.render?.priceInfo?.name || this.marketHashName
  }

  get inspect() {
    return this.itemOrigin.description.actions?.[0]?.link
      .replace('%owner_steamid%', this.inventoryStore.owner)
      .replace('%assetid%', this.assetId)
  }

  get contextId() {
    return this.itemOrigin.contextid || this.inventoryStore.contextId
  }

  get appId() {
    return +this.itemOrigin.description.appid
  }

  get iconUrl() {
    return `https://community.akamai.steamstatic.com/economy/image/${this.itemOrigin.description.icon_url}`
  }

  get id() {
    return `${this.appId}_${this.contextId}_${this.assetId}`
  }

  get shortExterior() {
    if (this.marketHashName.includes('Factory New')) return 'FN'
    if (this.marketHashName.includes('Minimal Wear')) return 'MW'
    if (this.marketHashName.includes('Field-Tested')) return 'FT'
    if (this.marketHashName.includes('Well-Worn')) return 'WW'
    if (this.marketHashName.includes('Battle-Scarred')) return 'BS'
    return ''
  }

  get isStattrak() {
    return this.marketHashName.includes('StatTrak')
  }

  get isSouvenir() {
    return this.marketHashName.includes('Souvenir')
  }

  get assetId() {
    return this.itemOrigin.assetid
  }

  get price() {
    return parseFloat(this.inputPrice) * 100
  }

  get lowesPriceFees() {
    return this.lowesPrice
      ? CalculateFeeAmount(this.lowesPrice, getPublisherFee())
      : null
  }

  get lowesPriceResult() {
    return this.lowesPriceFees
      ? this.lowesPrice - this.lowesPriceFees.fees
      : null
  }

  get sellPriceFees() {
    return this.price ? CalculateFeeAmount(this.price, getPublisherFee()) : null
  }

  get sellPriceResult() {
    return this.sellPriceFees ? this.price - this.sellPriceFees.fees : null
  }

  get sellPrice() {
    return this.inputPrice
  }

  set sellPrice(value) {
    const max = this.globalStore.userStore.wallet.wallet_max_balance / 100
    const newVal = value?.match(numberRegex)?.[0]
    const newPrice = value ? newVal || this.inputPrice : null
    this.inputPrice = newPrice > max ? max : newPrice
  }

  setTradeLock(date) {
    this.tradeLock = date
  }

  setListingStatus(value) {
    this.listingStatus = value
  }

  setListingMessage(value) {
    this.listingMessage = value
  }

  setLowesPriceCallback(value) {
    this.lowesPriceCallback = value
  }

  setLowesPriceLoading(value) {
    this.lowesPriceLoading = value
  }

  get isCachedMinPrice() {
    return !!cacheMinPrices[this.marketHashName]
  }

  async getSteamPrice() {
    if (this.lowesPrice) return
    this.setLowesPriceLoading(true)

    let price = cacheMinPrices[this.marketHashName] || null
    this.priceLoadError = false

    if (!price) {
      if (this.inspect) {
        price = await this.getPriceByListings()
        if (!price) {
          await this.getPriceByPriceoverview()
          price = this.overviewMinPrice
        }
      } else {
        await this.getPriceByPriceoverview()
        price = this.overviewMinPrice
      }
    }

    if (!price) {
      this.priceLoadError = true
    } else {
      this.lowesPrice = price
      cacheMinPrices[this.marketHashName] = price
    }
    if (this.lowesPriceCallback) {
      this.lowesPriceCallback(!this.lowesPrice)
    }
    this.setLowesPriceLoading(false)
  }

  async getPriceByListings() {
    const currencyID = this.globalStore.userStore.wallet.wallet_currency
    const country = this.globalStore.userStore.wallet.wallet_country
    const { language } = this.globalStore.userStore
    const response = await getSteamItemInfo(
      `https://steamcommunity.com/market/listings/${this.appId}/${this.marketHashName}/render/?query=&start=0&count=10&country=${country}&language=${language}&currency=${currencyID}`
    )

    if (response.success === true && response.listinginfo) {
      const listingInfo = Object.values(response.listinginfo)
      for (const listing of listingInfo) {
        if (listing.converted_price && listing.converted_fee) {
          return listing.converted_price + listing.converted_fee
        }
      }
    }
    return null
  }

  get overviewMinPrice() {
    const priceString =
      getNumbersFromString(this.overview?.lowest_price) || null
    return priceString ? parseFloat(priceString) * 100 : null
  }

  setOverview(overview) {
    this.overview = overview
  }

  async getPriceByPriceoverview() {
    if (this.overviewMinPrice && this.overviewMinPrice) return
    const currencyID = this.globalStore.userStore.wallet.wallet_currency
    const country = this.globalStore.userStore.wallet.wallet_country
    const response = await getSteamItemInfo(
      `https://steamcommunity.com/market/priceoverview/?country=${country}&currency=${currencyID}&appid=${this.appId}&market_hash_name=${this.marketHashName}`
    )
    if (response.success === true) {
      this.setOverview(response)
    }
  }

  async getDetails() {
    if (this.inspectDetails) return this.inspectDetails

    if (!this.inspect || this.appId !== 730) return null

    const data = await sendBackgroundRequest('getFloat', this.inspect)
    this.inspectDetails = data

    return data
  }
}
