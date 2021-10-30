/* eslint-disable no-param-reassign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect } from 'react'
import { Modal } from '@shared/component/modal/modal'
import { observer } from 'mobx-react'
import { Scrollbars } from 'react-custom-scrollbars'
import c from 'classnames'

import { store } from '@store/store-context'
import { Button } from '@shared/component/button/button'
import { Checkbox } from '@shared/component/checkbox/checkbox'
import { Input } from '@shared/component/input/input'
import DeleteIcon from '@shared/icons/close-component.svg'
import { Status } from '@shared/component/status/index'
import { Tooltip } from '@shared/component/tooltip/tooltip'
import { Dropdown } from '@shared/component/dropdown/dropdown'
import styles from './sell-modal-styles.css'

const { sellItemsStore, userStore } = store

const Title = observer(() => {
  return (
    <div className={styles.title}>
      Selected <span>{sellItemsStore.selectedItems.length} items</span>
    </div>
  )
})

const Footer = observer(() => {
  return (
    <div className={styles.footer}>
      <div className={styles['footer__price-bullet']}>
        <div className={styles['footer__price-title']}>Total</div>
        <div>
          {userStore.currencySign +
            (
              (sellItemsStore.allItemsResultPrice +
                sellItemsStore.allItemsResultFees) /
              100
            ).toFixed(2)}
        </div>
      </div>
      <div className={styles['footer__price-bullet']}>
        <div className={styles['footer__price-title']}>Comission</div>
        <div>
          {userStore.currencySign +
            (sellItemsStore.allItemsResultFees / 100).toFixed(2)}
        </div>
      </div>
      <div className={styles['footer__price-bullet']}>
        <div className={styles['footer__price-title']}>You get</div>
        <div>
          {userStore.currencySign +
            (sellItemsStore.allItemsResultPrice / 100).toFixed(2)}
        </div>
      </div>
      <Tooltip
        className={styles.price_difference_tooltip}
        content="Enabled only in auto-sell mode"
        position="top"
        show={!sellItemsStore.autoSell}
      >
        <div
          className={c(
            styles.price_difference,
            (!sellItemsStore.autoSell || sellItemsStore.listing) &&
              styles.disabled_price_difference
          )}
        >
          <Dropdown
            onSelect={sellItemsStore.setDifferenceType}
            label={
              <div className={styles.select_label}>
                {sellItemsStore.differenceType}
              </div>
            }
          >
            <Dropdown.Element>Value</Dropdown.Element>
            <Dropdown.Element>Precentage</Dropdown.Element>
          </Dropdown>
          <Input
            className={styles.input_difference}
            value={sellItemsStore.difference}
            onChange={sellItemsStore.setDifference}
            type="number"
            step={sellItemsStore.differenceType === 'Value' ? '0.01' : '1'}
          />
        </div>
      </Tooltip>

      <div className={styles.footer__chekbox}>
        <Checkbox
          isChecked={sellItemsStore.autoSell}
          disabled={sellItemsStore.listing}
          label="Auto sell"
          onClick={() => sellItemsStore.setAutoSell(!sellItemsStore.autoSell)}
        />
      </div>
      {(sellItemsStore.listing && (
        <div className={styles.listing__status}>
          <span>
            {sellItemsStore.listingCount - sellItemsStore.listingErrorsCount}
            {' / '}
            {sellItemsStore.selectedItems.length}
          </span>
          {(sellItemsStore.listingDone && (
            <Tooltip
              // show={!!sellItemsStore.listingErrorsCount}
              show={false}
              content="there are posting errors"
            >
              <Status
                status={
                  !sellItemsStore.listingErrorsCount ? 'success' : 'error'
                }
              />
            </Tooltip>
          )) || <Status status="loading" />}
        </div>
      )) || (
        <Button
          disabled={!sellItemsStore.selectedItems.length}
          onClick={sellItemsStore.sellItems}
        >
          List on sale
        </Button>
      )}
    </div>
  )
})

const Name = ({ item }) => {
  const { shortExterior, isStattrak, isSouvenir } = item
  const float = (item.inspectDetails?.floatvalue || '').toString()

  return (
    <div className={styles.item_name}>
      {isStattrak && (
        <span>
          <span className={styles.stattrak}>StatTrak™</span> /{' '}
        </span>
      )}
      {isSouvenir && (
        <span>
          <span className={styles.souvenir}>Souvenir</span> /{' '}
        </span>
      )}
      {shortExterior} {float && `/ ${float.substring(0, 6)}`}
    </div>
  )
}

const Item = observer(({ item, onRemove }) => {
  const { iconUrl } = item

  // sellPrice указывается в баксах, из-за инпута. TODO: переделать
  const price = sellItemsStore.autoSell ? item.lowesPrice : item.sellPrice * 100
  const { getPrice, listPrice } = sellItemsStore.calcSellPrice(price)

  const getPriceView = (getPrice / 100).toFixed(2)
  const listPriceView = (listPrice / 100).toFixed(2)

  return (
    <div className={styles.item}>
      <a
        target="_blank"
        href={`https://steamcommunity.com/market/listings/730/${encodeURI(
          item.marketHashName
        )}`}
        rel="noreferrer"
      >
        <img className={styles.item_img} src={iconUrl} alt="img" />
      </a>
      <div>
        <Name item={item} />
        <div className={styles.item_stickers}>
          {item.stickers.map(({ stickerImg, stickerName }, index) => {
            return (
              <img
                key={`${stickerName + index}`}
                src={stickerImg}
                alt="img"
                className={styles.item_sticker}
              />
            )
          })}
        </div>
      </div>
      {item.lowesPrice ? (
        <div
          className={styles.price}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (item.lowesPrice) {
              item.sellPrice = (item.lowesPrice / 100).toString()
            }
          }}
        >
          {userStore.currencySign + item.lowesPrice / 100}
        </div>
      ) : (
        <Tooltip show={item.priceLoadError} content="failed to load price">
          <Status status={item.priceLoadError ? 'error' : 'loading'} />
        </Tooltip>
      )}

      <Input
        value={
          sellItemsStore.autoSell
            ? userStore.currencySign + (listPriceView || '')
            : userStore.currencySign + (item.sellPrice || '')
        }
        onChange={(e) => {
          item.sellPrice = e.target.value.replace(userStore.currencySign, '')
        }}
        disabled={sellItemsStore.autoSell || sellItemsStore.listing}
      />

      <div className={styles.price}>
        {getPrice > 0 ? userStore.currencySign + getPriceView : '-'}
      </div>

      {(sellItemsStore.listing && (
        <Tooltip show={!!item.listingMessage} content={item.listingMessage}>
          <Status status={item.listingStatus || 'loading'} />
        </Tooltip>
      )) || (
        <Tooltip content="remove">
          <DeleteIcon
            data-id={item.id}
            onClick={onRemove}
            className={styles.delete}
          />
        </Tooltip>
      )}
    </div>
  )
})

export const SellModal = observer(() => {
  const onRemove = (event) => {
    const { id } = event.currentTarget.dataset
    sellItemsStore.setSelectedItems(id)
  }

  useEffect(() => {
    if (sellItemsStore.isModalOpen) {
      sellItemsStore.fetchLowPrices()
    }
  }, [sellItemsStore.isModalOpen])

  return (
    <Modal
      isOpen={sellItemsStore.isModalOpen}
      title={<Title />}
      footer={<Footer />}
      closeHandler={sellItemsStore.closeModal}
      className={styles.modal}
    >
      <div className={styles['table-head']}>
        <p>Lowest Price</p>
        <p>Price</p>
        <p>You get</p>
      </div>
      <Scrollbars style={{ height: '100%' }}>
        <div className={styles.table}>
          {sellItemsStore.selectedItemsFull.map((item) => {
            return <Item key={item.id} onRemove={onRemove} item={item} />
          })}
        </div>
      </Scrollbars>
    </Modal>
  )
})
