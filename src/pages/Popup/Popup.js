/* eslint-disable react/no-this-in-sfc */
import { sendBackgroundRequest } from '@core/utils/index'
import { Toggle } from '@shared/component/toggle/toggle'
import React, { useEffect } from 'react'
import { useLocalObservable, observer } from 'mobx-react'
import { Tabs } from '@shared/component/tabs/index'
import { Input } from '@shared/component/input/input'
import { debounce } from '@core/utils/debounce'

import styles from './Popup.css'

const email = 'steamplus.app@gmail.com'

const Row = ({ title, value }) => {
  return (
    <div className={styles.row}>
      <div className={styles.row_title}>{title}</div>
      <div className={styles.row_value}>{value}</div>
    </div>
  )
}

const Popup = observer(() => {
  const autoAcceptState = useLocalObservable(() => ({
    state: {
      isTurnedOn: false,
      apiCheckInterval: 12000,
    },
    async getState() {
      const data = await sendBackgroundRequest('getAutoAcceptState')
      this.setState(data)
    },
    setState(data) {
      this.state = data
    },
    async toggleAutoAccept() {
      const data = await sendBackgroundRequest('toggleAutoAcceptOffers')
      this.setState(data)
    },

    debouncedSetRate: debounce(() => {
      sendBackgroundRequest(
        'setApiCheckInterval',
        autoAcceptState.state.apiCheckInterval
      )
    }, 100),

    setRate({ value }) {
      this.setState({ ...this.state, apiCheckInterval: value * 1000 })
      this.debouncedSetRate()
    },
  }))

  useEffect(() => {
    autoAcceptState.getState()
  }, [])

  return (
    <div className={styles.app}>
      <Tabs
        classNameActive={styles.tab_btn_active}
        classNameHead={styles.tab_head}
      >
        <Tabs.Tab label="Tradeoffers">
          <div className={styles.rows}>
            <Row
              title="Auto accept empty offers"
              value={
                <Toggle
                  value={autoAcceptState.state.isTurnedOn}
                  onChange={() => {
                    autoAcceptState.toggleAutoAccept()
                  }}
                />
              }
            />
            <div className={styles.rate}>
              <div>Rate(s):</div>
              <Input
                type="number"
                className={styles.rate_field}
                value={autoAcceptState.state.apiCheckInterval / 1000}
                onChange={autoAcceptState.setRate}
              />
            </div>
          </div>
        </Tabs.Tab>
        <Tabs.Tab label="Feedback">
          If you have any suggestions for improving the product, write to us at
          the official{' '}
          <a className={styles.mail} href={`mailto:${email}`}>
            {email}
          </a>{' '}
          mail
        </Tabs.Tab>
      </Tabs>
    </div>
  )
})

export default Popup
