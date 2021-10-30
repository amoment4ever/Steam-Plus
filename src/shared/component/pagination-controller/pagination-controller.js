/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import c from 'classnames'
import styles from './paginations-styles.css'

export const PaginationController = ({ elements = [], selected, onSelect }) => {
  return (
    <div className={styles.container}>
      {elements.map((element) => (
        <div
          key={element}
          onClick={onSelect}
          className={c(styles.element, selected === element && styles.selected)}
        >
          {element}
        </div>
      ))}
    </div>
  )
}
