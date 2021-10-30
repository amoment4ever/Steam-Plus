/* eslint-disable react/no-this-in-sfc */
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import c from 'classnames'

import { getProfileData } from '@features/bridge/index'
import { sendBackgroundRequest } from '@core/utils/index'
import { action, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Tooltip } from '@shared/component/tooltip/tooltip'
import { CopyCopmponent } from '@shared/component/copy/copy'
import TradeIcon from './trade-component.svg'
import CommunityIcon from './community-component.svg'
import VacIcon from './vac-component.svg'
import styles from './profile-styles.css'

export class Profile {
  constructor() {
    this.selector = '.profile_rightcol'
    this.currentSteamId = null
    this.bans = null

    makeObservable(this, {
      getBans: action,
      bans: observable,
      currentSteamId: observable,
    })
  }

  get $dom() {
    return document.querySelector(this.selector)
  }

  async getBans() {
    const data = await sendBackgroundRequest('getBans', this.currentSteamId)

    if (data) {
      this.bans = data
    }
  }

  get $profileStatus() {
    return this.$dom.querySelector('.responsive_status_info > .profile_in_game')
  }

  createContainer() {
    this.$container = document.createElement('div')
    this.$container.classList.add('react_element')
    this.$profileStatus.insertAdjacentElement('afterend', this.$container)
  }

  get hasContainer() {
    return this.$dom.querySelector('.react_element')
  }

  render() {
    if (!this.$dom || this.hasContainer) return

    this.createContainer()

    const Controller = observer(() => {
      useEffect(() => {
        getProfileData().then(({ profileData }) => {
          const { steamid: currentSteamId } = profileData
          this.currentSteamId = currentSteamId
          this.getBans()
        })
      }, [])

      const tradeBanTooltipContent = (text) => {
        if (!text || text === 'none') return 'No trade ban'
        if (text === 'probation') return 'Currently on trade probation'
        return 'User tradebanned'
      }

      return (
        <>
          {this.bans?.SteamId && (
            <div className={styles.container}>
              <Tooltip
                className={styles.item_wrapper}
                content={
                  this.bans?.CommunityBanned
                    ? 'User have community ban'
                    : 'No community ban'
                }
              >
                <div className={styles.item}>
                  <CommunityIcon
                    className={c(
                      this.bans?.CommunityBanned
                        ? styles.community_ban
                        : styles.default,
                      styles.icon
                    )}
                  />
                  <div>Commumity</div>
                </div>
              </Tooltip>

              <Tooltip
                className={styles.item_wrapper}
                content={tradeBanTooltipContent(this.bans?.EconomyBan)}
              >
                <div className={styles.item}>
                  <TradeIcon
                    className={c(
                      !this.bans && styles.default_tradeban,
                      this.bans?.EconomyBan === 'none'
                        ? styles.default_tradeban
                        : styles.tradeban,
                      styles.icon
                    )}
                  />
                  <div>Trade</div>
                </div>
              </Tooltip>
              <Tooltip
                className={styles.item_wrapper}
                content={
                  this.bans?.VACBanned ? 'User have VAC ban' : 'No VAC ban'
                }
              >
                <div className={styles.item}>
                  <VacIcon
                    className={c(
                      this.bans?.VACBanned ? styles.vanbanned : styles.default,
                      styles.icon
                    )}
                  />
                  <div>Vac</div>
                </div>
              </Tooltip>
            </div>
          )}
          <div className={styles.current_steam_id}>
            <div className={styles.current_steam_id_field}>
              {this.currentSteamId}
            </div>
            <CopyCopmponent
              copyText={`https://steamcommunity.com/profiles/${this.currentSteamId}`}
              className={styles.copy_icon}
              copyTooltipText="Copy profile url"
            />
          </div>
        </>
      )
    })

    ReactDOM.render(<Controller />, this.$container)
  }
}
