import CheckIcon from '@shared/icons/check-component.svg'
import ErrorIcon from '@shared/icons/error-component.svg'
import { Loader } from '@shared/component/loader/loader'
import React from 'react'

import styles from './status-styles.css'

export const Status = ({ status = 'loading' }) => (
  <div className={styles.container}>
    {status === 'loading' && <Loader size="20" />}
    {status === 'success' && <CheckIcon />}
    {status === 'error' && <ErrorIcon />}
  </div>
)
