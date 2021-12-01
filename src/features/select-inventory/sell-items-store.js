import { sleep } from '@core/utils/index'
// eslint-disable-next-line import/no-cycle
import { CalculateFeeAmount, getPublisherFee } from '@core/utils/steam-prices'
import { makeAutoObservable, action } from 'mobx'

export class SellItemsStore {
  constructor(globalStore) {
    this.globalStore = globalStore
    this.selectedItems = []
    this.isModalOpen = false
    this.selectMode = false
    this.autoSell = false
    this.listing = false
    this.listingCount = 0
    this.listingErrorsCount = 0
    this.listingDone = false
    this.difference = -0.01
    this.differenceType = 'Value'

    makeAutoObservable(this, {
      closeModal: action.bound,
      sellItems: action.bound,
      fetchLowPrices: action.bound,
      setDifference: action.bound,
      setDifferenceType: action.bound,
    })
  }

  calcSellPrice(price) {
    let listPrice = Number(price)

    if (this.differenceType === 'Value' && this.autoSell) {
      listPrice = +(listPrice + Number(this.difference) * 100).toFixed(2)
    }

    if (this.differenceType === 'Precentage' && this.autoSell) {
      const percent = (100 + Number(this.difference)) / 100
      listPrice = +(listPrice * percent).toFixed(2)
    }

    const allFees = CalculateFeeAmount(listPrice, getPublisherFee())

    return {
      listPrice: Number(listPrice),
      fees: Number(allFees?.fees),
      getPrice: listPrice - Number(allFees?.fees),
    }
  }

  setSelectMode(value) {
    this.selectMode = value
  }

  setDifferenceType(event) {
    this.differenceType = event.target.innerText.trim()

    if (this.differenceType === 'Value') {
      this.difference = -0.01
    }

    if (this.differenceType === 'Precentage') {
      this.difference = -1
    }
  }

  setDifference({ value }) {
    this.difference = value.replace(',', '.')
  }

  setAutoSell(value) {
    this.autoSell = value
  }

  openModal() {
    this.isModalOpen = true
  }

  closeModal() {
    if (!this.listing) {
      this.isModalOpen = false
    }
    if (this.listingDone) {
      this.isModalOpen = false
      this.resetItems()
    }
  }

  resetItems() {
    this.selectMode = false
    this.autoSell = false
    this.listing = false
    this.listingCount = 0
    this.listingErrorsCount = 0
    this.listingDone = false
    this.selectedItemsFull.forEach((item) => {
      item.setListingStatus(null)
      item.setListingMessage(null)
      item.setLowesPriceCallback(null)
    })
    this.selectedItems = []
  }

  get selectedItemsFull() {
    return this.selectedItems.map((id) => {
      const [, , assetId] = id.split('_')
      return this.globalStore.inventoryStore.assets[assetId]
    })
  }

  get allItemsResultPrice() {
    return this.selectedItemsFull.reduce((sum, curr) => {
      const price = this.autoSell ? curr.lowesPrice : curr.sellPrice * 100
      const { listPrice, getPrice } = this.calcSellPrice(price)

      return listPrice ? getPrice + sum : sum
    }, 0)
  }

  get selectedItemsPrice() {
    return this.selectedItemsFull.reduce((sum, curr) => {
      return sum + (curr.csmoneyPrice || 0)
    }, 0)
  }

  get allItemsResultFees() {
    return this.selectedItemsFull.reduce((sum, curr) => {
      const price = this.autoSell ? curr.lowesPrice : curr.sellPrice * 100
      const { listPrice, fees } = this.calcSellPrice(price)

      return listPrice ? fees + sum : sum
    }, 0)
  }

  setSelectedItems(payload) {
    if (Array.isArray(payload)) {
      this.selectedItems = payload
      return
    }
    const index = this.selectedItems.indexOf(payload)
    if (index < 0) {
      this.selectedItems.push(payload)
      return
    }
    this.selectedItems.splice(index, 1)
  }

  checkListingDone() {
    if (this.selectedItems.length === this.listingCount) {
      this.listingDone = true
    }
  }

  async listingItem(item) {
    const { fees, getPrice } = this.autoSell
      ? this.calcSellPrice(item.lowesPrice)
      : this.calcSellPrice(item.sellPrice * 100)

    const data = await this.globalStore.userStore.listItemOnMarket({
      amount: 1,
      price: getPrice > 0 && fees ? getPrice : null,
      item,
    })
    this.listingCount += 1
    if (data.success) {
      item.setListingStatus('success')
    } else {
      item.setListingStatus('error')
      item.setListingMessage(data.message)
      this.listingErrorsCount += 1
    }
    this.checkListingDone()
  }

  async sellItems() {
    this.listing = true
    for (const item of this.selectedItemsFull) {
      if (!this.autoSell && !item.sellPriceResult) {
        this.listingCount += 1
        this.listingErrorsCount += 1
        item.setListingStatus('error')
        item.setListingMessage('price field is not filled')
        this.checkListingDone()
        continue
      }
      item.setListingStatus('loading')
      if (this.autoSell && !item.lowesPrice) {
        if (!item.lowesPriceLoading) {
          this.listingCount += 1
          this.listingErrorsCount += 1
          item.setListingStatus('error')
          item.setListingMessage('low price not received')
          this.checkListingDone()
          continue
        }
        item.setLowesPriceCallback((error) => {
          if (error) {
            this.listingCount += 1
            this.listingErrorsCount += 1
            item.setListingStatus('error')
            item.setListingMessage('low price not received')
            this.checkListingDone()
            return
          }
          this.listingItem.call(this, item)
        })
        continue
      }
      await this.listingItem(item)
    }
  }

  async fetchLowPrices() {
    if (this.isModalOpen) {
      this.selectedItemsFull.forEach((item) => {
        item.setLowesPriceLoading(true)
      })
      for (const item of this.selectedItemsFull) {
        if (!item.isCachedMinPrice) {
          await sleep(1000)
        }
        await item.getSteamPrice()
      }
    }
  }
}
