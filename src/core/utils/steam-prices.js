/* eslint-disable eqeqeq */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */

// eslint-disable-next-line import/no-cycle
import { store } from '@store/store-context'

/* eslint-disable max-len */
export const getPublisherFee = (rgItem = {}, defaultFeeValue = false) => {
  const { wallet_publisher_fee_percent_default } = store.userStore.wallet

  return (
    rgItem?.market_fee ||
    rgItem?.description?.market_fee ||
    wallet_publisher_fee_percent_default ||
    defaultFeeValue
  )
}

export const steamBuyerPrice = (
  receivedAmount,
  publisherFee,
  g_rgWalletInfo
) => {
  const { wallet_fee_percent, wallet_fee_minimum, wallet_fee_base } =
    g_rgWalletInfo

  const nSteamFee = parseInt(
    Math.floor(
      Math.max(
        receivedAmount * parseFloat(wallet_fee_percent),
        wallet_fee_minimum
      ) + parseInt(wallet_fee_base)
    )
  )
  const nPublisherFee = parseInt(
    Math.floor(
      publisherFee > 0 ? Math.max(receivedAmount * publisherFee, 1) : 0
    )
  )

  return receivedAmount + nSteamFee + nPublisherFee
}

export function CalculateFeeAmount(amount, publisherFee) {
  if (!store.userStore.wallet.wallet_fee) {
    return 0
  }

  publisherFee = typeof publisherFee === 'undefined' ? 0 : publisherFee

  // Since CalculateFeeAmount has a Math.floor, we could be off a cent or two. Let's check:
  let iterations = 0 // shouldn't be needed, but included to be sure nothing unforseen causes us to get stuck
  let nEstimatedAmountOfWalletFundsReceivedByOtherParty = parseInt(
    (amount - parseInt(store.userStore.wallet.wallet_fee_base)) /
      (parseFloat(store.userStore.wallet.wallet_fee_percent) +
        parseFloat(publisherFee) +
        1)
  )

  let bEverUndershot = false
  let fees = CalculateAmountToSendForDesiredReceivedAmount(
    nEstimatedAmountOfWalletFundsReceivedByOtherParty,
    publisherFee
  )
  while (fees.amount != amount && iterations < 10) {
    if (fees.amount > amount) {
      if (bEverUndershot) {
        fees = CalculateAmountToSendForDesiredReceivedAmount(
          nEstimatedAmountOfWalletFundsReceivedByOtherParty - 1,
          publisherFee
        )
        fees.steam_fee += amount - fees.amount
        fees.fees += amount - fees.amount
        fees.amount = amount
        break
      } else {
        nEstimatedAmountOfWalletFundsReceivedByOtherParty--
      }
    } else {
      bEverUndershot = true
      nEstimatedAmountOfWalletFundsReceivedByOtherParty++
    }

    fees = CalculateAmountToSendForDesiredReceivedAmount(
      nEstimatedAmountOfWalletFundsReceivedByOtherParty,
      publisherFee
    )
    iterations++
  }

  // fees.amount should equal the passed in amount

  return fees
}

function CalculateAmountToSendForDesiredReceivedAmount(
  receivedAmount,
  publisherFee
) {
  if (!store.userStore.wallet.wallet_fee) {
    return receivedAmount
  }

  publisherFee = typeof publisherFee === 'undefined' ? 0 : publisherFee

  const nSteamFee = parseInt(
    Math.floor(
      Math.max(
        receivedAmount * parseFloat(store.userStore.wallet.wallet_fee_percent),
        store.userStore.wallet.wallet_fee_minimum
      ) + parseInt(store.userStore.wallet.wallet_fee_base)
    )
  )
  const nPublisherFee = parseInt(
    Math.floor(
      publisherFee > 0 ? Math.max(receivedAmount * publisherFee, 1) : 0
    )
  )
  const nAmountToSend = receivedAmount + nSteamFee + nPublisherFee

  return {
    steam_fee: nSteamFee,
    publisher_fee: nPublisherFee,
    fees: nSteamFee + nPublisherFee,
    amount: parseInt(nAmountToSend),
  }
}
