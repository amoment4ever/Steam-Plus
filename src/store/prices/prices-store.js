import { sendBackgroundRequest } from '@core/utils/index'
import { makeAutoObservable } from 'mobx'

export class PricesStore {
  constructor() {
    this.csmoneyPrices = {}

    makeAutoObservable(this)
  }

  async getCsmoneyPrices() {
    const data = await sendBackgroundRequest('getCsmoneyPrices')

    if (!data?.error) {
      this.setCsmoneyPrices(data)
    }
  }

  setCsmoneyPrices(csmoneyPrices) {
    this.csmoneyPrices = csmoneyPrices
  }
}
