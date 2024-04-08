"use client"
import React, { createContext } from "react"
import { Store } from "./Store"
import { Provider } from "mobx-react"
import { configure } from "mobx"
import { ScreenToVideoStore } from "./ScreenToVideoStore"
configure({
  enforceActions: "never",
})
class RootStore {
  store: Store
  screenToVideoStore: ScreenToVideoStore
  constructor() {
    this.store = new Store()
    this.screenToVideoStore = new ScreenToVideoStore()
  }
}
export const StoreContext = createContext(new RootStore())
export function StoreProvider(props: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={new RootStore()}>
      {props.children}
    </StoreContext.Provider>
  )
}
