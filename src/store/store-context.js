/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */

import React, { createContext, useContext } from 'react'
import { Store } from '@store/store'

export const store = new Store()

window.mobxStore = store

export const StoreContext = createContext()

export function StoreProvider({ children }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within StoreProvider')
  }

  return context
}
