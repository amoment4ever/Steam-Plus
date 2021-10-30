/* eslint-disable react/no-array-index-key */
import { FloatRange } from '@shared/component/float-range/index'
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import c from 'classnames'

import { store } from '@store/store-context'
import { CurrencyComponentView } from '@features/currency/cyrrency-view'
import { FastSellButton } from '@features/fast-sell-button/fast-sell-button'
import { CsmPrice } from '@features/csm-price/index'
import styles from './selected-item-styles.css'

export class SelectedItem {
  constructor() {
    this.parentSelector = '.inventory_page_right'
  }

  // eslint-disable-next-line class-methods-use-this
  get isItemOwner() {
    return store.inventoryStore.owner === store.userStore.steamId
  }

  createContainer() {
    if (this.$containersTrade) {
      this.$containersTrade.forEach(($el) => $el.remove())
    }
    this.$containers = []
    this.$containersTrade = []
    this.$containersExtra = []

    for (const $child of this.$dom.children) {
      const $container = document.createElement('div')
      $container.classList.add('react_element', styles.container)
      const $tradeContainer = document.createElement('div')
      $tradeContainer.classList.add('react_element', styles.container)
      $child.querySelector('.item_desc_descriptors').prepend($container)
      $child.querySelector('.item_desc_descriptors').prepend($container)
      this.$containers.push($container)
      $child.querySelector('.item_desc_description').append($tradeContainer)
      this.$containersTrade.push($tradeContainer)
    }

    for (const $child of this.$dom.children) {
      const $containerExtra = document.createElement('div')
      $containerExtra.classList.add('react_element')
      const $actions = $child.querySelector('.item_market_actions')
      if (this.isItemOwner) {
        if ($actions.firstChild?.style) {
          $actions.firstChild.style.display = 'none'
        }
      }
      $actions.prepend($containerExtra)
      $actions.style.display = 'block'
      this.$containersExtra.push($containerExtra)
    }
  }

  get $dom() {
    return document.querySelector(this.parentSelector)
  }

  rednerPriceBlock() {
    const { selectedItemStore } = store

    this.$containersExtra.forEach(($container) => {
      const Controller = observer(() => {
        const { priceInfo, fullPrice } =
          selectedItemStore.selectedItem?.render || {}

        return (
          <div className={styles.price_container}>
            <div
              className={styles.price_info}
              style={{ marginBottom: this.isItemOwner ? '13px' : 0 }}
            >
              {selectedItemStore.marketLink && (
                <a
                  target="_blank"
                  href={selectedItemStore.marketLink}
                  className={styles.price_market_link}
                  rel="noreferrer"
                >
                  View in Community Market
                </a>
              )}
              <div>{`Starting at: ${
                selectedItemStore.selectedItem?.overview?.lowest_price || 'N/A'
              }`}</div>
              <div>
                {selectedItemStore.selectedItem?.overview?.volume
                  ? `Volume: ${selectedItemStore.selectedItem.overview.volume} sold in the last 24 hours`
                  : `Volume: N/A`}
              </div>
              <div>{`Median price: ${
                selectedItemStore.selectedItem?.overview?.median_price || 'N/A'
              }`}</div>
            </div>
            <CsmPrice
              priceInfo={
                priceInfo || {
                  csm_price: selectedItemStore.selectedItem?.csmoneyPrice,
                }
              }
              fullPrice={fullPrice}
              showTooltip
            />
            {this.isItemOwner && (
              <FastSellButton container={$container.offsetParent} />
            )}
          </div>
        )
      })
      ReactDOM.render(<Controller />, $container)
    })
  }

  renderFloatBlock() {
    const { selectedItemStore } = store

    this.$containers.forEach(($container) => {
      const Controller = observer(() => {
        const Charesteristic = ({ value, description, className }) => {
          return (
            <div className={c(styles.char, className)}>
              <div className={styles.char_value}>{value || 'N/A'}</div>
              <div className={styles.char_desc}>{description}</div>
            </div>
          )
        }

        let patternWithRank =
          selectedItemStore.selectedItem?.inspectDetails?.paintseed

        if (selectedItemStore.selectedItem?.render.rankPattern) {
          patternWithRank += ` / ${selectedItemStore.selectedItem.render.rankPattern}`
        }

        return (
          <div>
            <FloatRange
              value={selectedItemStore.selectedItem?.inspectDetails?.floatvalue}
              max={selectedItemStore.selectedItem?.inspectDetails?.max}
              min={selectedItemStore.selectedItem?.inspectDetails?.min}
            />
            <div className={styles.chars}>
              <Charesteristic
                description="Float"
                value={
                  selectedItemStore.selectedItem?.inspectDetails?.floatvalue &&
                  selectedItemStore.selectedItem?.inspectDetails?.floatvalue.toFixed(
                    7
                  )
                }
              />
              <Charesteristic description="Pattern" value={patternWithRank} />
            </div>
          </div>
        )
      })

      ReactDOM.render(<Controller />, $container)
    })
  }

  renderStickersBlock() {
    const { selectedItemStore } = store
    const $stickersContainer = this.$dom.querySelectorAll('#sticker_info')

    if (!selectedItemStore.selectedItem?.inspectDetails?.stickers.length) return

    $stickersContainer.forEach(($container) => {
      const $stickers = document.createElement('div')
      $container.after($stickers)
      $container.remove()

      const Controller = () => {
        return (
          <div className={styles.sticker_container}>
            {selectedItemStore.selectedItem?.stickers.map(
              (
                { stickerName, stickerImg, stickerPrice, stickerWear },
                index
              ) => {
                const scratched = 100 - stickerWear * 100

                return (
                  <div key={index} className={styles.sticker}>
                    <a
                      title={stickerName}
                      target="_blank"
                      href={`https://steamcommunity.com/market/listings/730/Sticker | ${stickerName}`}
                      rel="noreferrer"
                    >
                      <img src={stickerImg} alt={stickerName} />
                    </a>
                    <div className={styles.sticker_info}>
                      <span className={styles.sticker_name}>{stickerName}</span>
                      {stickerWear && (
                        <span className={styles.sticker_wear}>
                          scratched:{' '}
                          <span
                            className={c(
                              scratched ? styles.red_s : styles.green_s
                            )}
                          >
                            {scratched.toFixed(2)}%
                          </span>
                        </span>
                      )}
                    </div>
                    <div>
                      {stickerPrice && (
                        <CurrencyComponentView
                          amount={stickerPrice}
                          className={styles.sticker_price}
                          currencyCode="USD"
                        />
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )
      }

      ReactDOM.render(<Controller />, $stickers)
    })
  }

  renderTradeLockBlock() {
    const { selectedItemStore } = store

    this.$containersTrade.forEach(($container) => {
      const Controller = observer(() => {
        return (
          selectedItemStore.selectedItem.tradeLock &&
          !this.isItemOwner && (
            <div className={styles.trade_lock}>
              {`Tradable After ${new Date(
                selectedItemStore.selectedItem.tradeLock
              )?.toGMTString()}`}
            </div>
          )
        )
      })
      ReactDOM.render(<Controller />, $container)
    })
  }

  render() {
    const { inventoryStore } = store
    if (inventoryStore.appId !== 730) return

    this.createContainer()

    const $marketContent = document.querySelectorAll(
      '#iteminfo0_market_content, #iteminfo1_market_content'
    )

    $marketContent.forEach(($element) => {
      $element.classList.add(styles.market_content_sticky)
      $element.classList.add(styles.background_alpha)
    })

    this.rednerPriceBlock()
    this.renderFloatBlock()
    this.renderTradeLockBlock()
    this.renderStickersBlock()
  }
}
