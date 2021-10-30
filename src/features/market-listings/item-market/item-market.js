/* eslint-disable react/no-this-in-sfc */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { store } from '@store/store-context'
import { makeObservable, observable, action } from 'mobx'
import c from 'classnames'
import { sendBackgroundRequest } from '@core/utils/index'
import { Tooltip } from '@shared/component/tooltip/tooltip'
import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import { Loader } from '@shared/component/loader/loader'

import { Button } from '@shared/component/button/button'
import { Status } from '@shared/component/status/index'
import StickerSlotIcon from '@shared/icons/sticker-slot-component.svg'
import styles from './item-market-styles.css'

import ProfileIcon from '../icon-profile-component.svg'
import { getBuyerKYC } from './utils'

const { pricesStore } = store

export class ItemMarket {
  constructor(itemOrigin, listingId, appId, listingInfoItem) {
    this.itemOrigin = itemOrigin
    this.listingId = listingId
    this.appId = appId
    this.isLoading = false
    this.itemOwner = null
    this.inspectDetails = null
    this.listingInfoItem = listingInfoItem
    this.buyingStatus = null
    this.errorBuyText = ''

    this.getDetails()

    makeObservable(this, {
      setLoading: action,
      getDetails: action.bound,
      isLoading: observable,
      itemOwner: observable,
      inspectDetails: observable,
      setInspectDetails: action,
      buyingStatus: observable,
      setBuyingStatus: action,
      buyHandler: action.bound,
      errorBuyText: observable,
      setErrorBuyText: action,
    })
  }

  setErrorBuyText(errorBuyText) {
    this.errorBuyText = errorBuyText
  }

  setBuyingStatus(buyingStatus) {
    this.buyingStatus = buyingStatus
  }

  get marketHashName() {
    return this.itemOrigin?.market_hash_name
  }

  get stickers() {
    let stickers = []
    for (const description in this.itemOrigin.descriptions) {
      if (
        this.itemOrigin.descriptions[description].value.includes(
          'name="sticker_info'
        )
      ) {
        stickers = this.itemOrigin.descriptions[description].value
          .match(/<img [^>]*src="[^"]*"[^>]*>/gm)
          .map((src, index) => {
            const stickerDetails = this.inspectDetails?.stickers?.[index] || {}
            return {
              src: src.replace(/.*src="([^"]*)".*/, '$1'),
              ...stickerDetails,
              price:
                pricesStore.csmoneyPrices?.[`Sticker | ${stickerDetails.name}`],
              marketLink: `https://steamcommunity.com/market/listings/${this.appId}/Sticker | ${stickerDetails.name}`,
            }
          })
      }
    }

    if (stickers.length) {
      const resultStickers = []
      for (let i = 0; i < 4; i += 1) {
        const slotSticker = stickers.find(({ slot }) => slot === i)
        resultStickers.push(
          slotSticker || {
            empty: true,
          }
        )
      }
      return resultStickers
    }

    return stickers
  }

  setLoading(isLoading) {
    this.isLoading = isLoading
  }

  get domId() {
    return `listing_${this.listingId}`
  }

  get $dom() {
    return window[this.domId]
  }

  get inspect() {
    return this.itemOrigin.actions?.[0].link.replace(
      '%assetid%',
      this.itemOrigin.id
    )
  }

  get $profileContainer() {
    return this.$dom.querySelector('.playerAvatar')
  }

  get $nameContainer() {
    return this.$dom.querySelector('.market_listing_item_name_block')
  }

  createContainer() {
    this.$linkContainer = document.createElement('div')
    this.$linkContainer.classList.add('react_element', styles.container)
    this.$profileContainer.appendChild(this.$linkContainer)
    this.$profileContainer.classList.add(
      'profile_container',
      styles.profile_container
    )

    this.$infoContainer = document.createElement('div')
    this.$infoContainer.classList.add('react_element', styles.container)
    this.$nameContainer.appendChild(this.$infoContainer)
    this.$nameContainer.classList.add('name_container', styles.name_container)

    this.$instantBuyContainer = document.createElement('div')
    this.$instantBuyContainer.classList.add(
      'react_element',
      'market_listing_price_listings_block'
    )

    this.$dom
      .querySelector('.market_listing_price_listings_block')
      .insertAdjacentElement('beforebegin', this.$instantBuyContainer)
  }

  async getDetails() {
    if (this.inspectDetails) return

    if (!this.inspect || this.appId !== 730) return

    const data = await sendBackgroundRequest('getFloat', this.inspect)
    this.setInspectDetails(data)
  }

  setInspectDetails(data) {
    this.inspectDetails = data
  }

  async getInfo() {
    this.setLoading(true)
    const data = await sendBackgroundRequest(
      'getMarketItemInfo',
      this.listingId
    )

    this.itemOwner = data?.link

    this.setLoading(false)
  }

  get hasContainer() {
    return this.$dom.querySelector('.react_element')
  }

  async buyHandler() {
    this.setBuyingStatus('loading')
    try {
      await store.userStore.buyItem(this.listingInfoItem, getBuyerKYC())

      this.setBuyingStatus('success')

      store.notificationsStore.addNotification({
        text: `Success bought ${this.marketHashName}`,
      })
    } catch (exc) {
      const errorBuyText = exc.response?.data?.message

      if (errorBuyText) {
        this.setErrorBuyText(errorBuyText)

        store.notificationsStore.addNotification({
          text: errorBuyText,
          type: 'error',
        })
      }

      this.setBuyingStatus('error')
    }
  }

  render() {
    if (this.hasContainer) return

    this.createContainer()

    const Charesteristic = ({ value, description, className }) => {
      return (
        <div className={c(styles.char, className)}>
          <div className={styles.char_desc}>{description}</div>
          <div className={styles.char_value}>{value ?? 'N/A'}</div>
        </div>
      )
    }

    const Info = observer(() => {
      return (
        <>
          <div className={styles.info}>
            <Charesteristic
              description="Float"
              value={this.inspectDetails?.floatvalue?.toFixed(7)}
            />
            <Charesteristic
              description="Pattern"
              value={this.inspectDetails?.paintseed}
            />
          </div>
          <div className={styles.info_stickers}>
            {this.stickers.map(
              ({ src, name, wear, slot, price, marketLink, empty }, index) => {
                if (empty) {
                  return (
                    <StickerSlotIcon
                      // eslint-disable-next-line react/no-array-index-key
                      key={`${this.itemOrigin.id}_sticker_img_${index}`}
                      className={styles.info_sticker_slot}
                    />
                  )
                }
                const scratched = 100 - wear * 100
                const TooltipContent = () => {
                  return (
                    <div>
                      {name}
                      <br />
                      scratched: {scratched.toFixed(2)}% slot: {slot ?? 'N/A'}
                      <br />
                      price:{' '}
                      {price ? (
                        <CurrencyComponentView
                          amount={price}
                          currencyCode="USD"
                        />
                      ) : (
                        'N/A'
                      )}
                    </div>
                  )
                }

                return (
                  <Tooltip
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${this.itemOrigin.id}_sticker_img_${index}`}
                    content={<TooltipContent />}
                  >
                    <a
                      href={marketLink}
                      onClick={(e) => e.preventDefault()}
                      className={styles.info_sticker_wrapper}
                    >
                      <img
                        className={styles.info_sticker}
                        alt={src}
                        src={src}
                        onClick={() => {
                          window.open(marketLink, '_blank')
                        }}
                      />
                      <div
                        className={c(scratched ? styles.red_s : styles.green_s)}
                      >
                        {scratched.toFixed(2)}%
                      </div>
                    </a>
                  </Tooltip>
                )
              }
            )}
          </div>
        </>
      )
    })

    const Controller = observer(() => {
      const clickHandler = async () => {
        if (!this.itemOwner) {
          await this.getInfo()
        }

        if (this.itemOwner) {
          window.open(this.itemOwner, '_blank')
        } else {
          store.notificationsStore.addNotification({
            text: 'Owner acquisition error',
          })
        }
      }

      if (this.isLoading) {
        return (
          <div className={c(styles.loader_wrapper, styles.profile_icon)}>
            <Loader size={15} />
          </div>
        )
      }

      return (
        <Tooltip content="Open profile">
          <ProfileIcon onClick={clickHandler} className={styles.profile_icon} />
        </Tooltip>
      )
    })

    const BuyController = observer(() => {
      return (
        <div
          className={c(
            styles.instant_buy_container,
            'market_listing_right_cell market_listing_action_buttons'
          )}
        >
          {!this.buyingStatus && (
            <Button onClick={this.buyHandler}>Instant buy</Button>
          )}
          {this.buyingStatus && (
            <Tooltip
              content={this.errorBuyText}
              show={!!this.errorBuyText}
              position="left"
            >
              <Status status={this.buyingStatus} />
            </Tooltip>
          )}
        </div>
      )
    })

    ReactDOM.render(<BuyController />, this.$instantBuyContainer)
    ReactDOM.render(<Controller />, this.$linkContainer)
    ReactDOM.render(<Info />, this.$infoContainer)
  }
}
