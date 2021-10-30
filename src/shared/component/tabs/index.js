/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import c from 'classnames'

import styles from './tabs-styles.css'

const TabsButtons = ({
  tabs,
  changeTab,
  activeTab,
  classNameActive,
  className,
}) => {
  return (
    <div className={c(styles.tab_buttons, className)}>
      {tabs.map((button, index) => {
        return (
          <div
            key={`tab-${button}-${index}`}
            className={c(
              styles.tab_button,
              index === activeTab && styles.tab_button_active,
              index === activeTab && classNameActive
            )}
            onClick={() => changeTab(index)}
            role="button"
          >
            {button}
          </div>
        )
      })}
    </div>
  )
}

const Tab = ({ children }) => {
  return <>{children}</>
}

export const Tabs = ({ children, classNameActive, classNameHead }) => {
  const tabs = children.map((child) => child.props.label)
  const [activeTab, setTab] = useState(0)

  return (
    <div>
      <TabsButtons
        activeTab={activeTab}
        classNameActive={classNameActive}
        tabs={tabs}
        changeTab={setTab}
        className={classNameHead}
      />
      <div className={styles.content}>{children[activeTab]}</div>
    </div>
  )
}

Tabs.Tab = Tab
