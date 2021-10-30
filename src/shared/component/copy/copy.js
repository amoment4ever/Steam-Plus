import React from 'react'
import CopyIcon from '@shared/icons/copy-component.svg'
import { store } from '@store/store-context'
import { copyTextToClipboard } from '@core/utils/copy-to-clickboard'
import c from 'classnames'
import { Tooltip } from '../tooltip/tooltip'

import styles from './copy-styles.css'

export const CopyCopmponent = ({ copyText, copyTooltipText, className }) => {
  const onClickHandler = () => {
    store.notificationsStore.addNotification({
      text: 'Copied',
      icon: <CopyIcon />,
    })

    copyTextToClipboard(copyText)
  }

  return (
    <Tooltip
      className={styles.copy_icon_wrapper}
      content={copyTooltipText || 'copy'}
    >
      <CopyIcon
        onClick={onClickHandler}
        className={c(styles.copy_icon, className)}
      />
    </Tooltip>
  )
}
