"use client"
import React, { createContext } from "react"
import { Store } from "./Store"
import { Provider } from "mobx-react"
import { configure } from "mobx"
configure({
  enforceActions: "never",
})
export const StoreContext = createContext(new Store())
export function StoreProvider(props: { children: React.ReactNode }) {
  const [store, setStore] = React.useState(new Store())
  return (
    <StoreContext.Provider value={new Store()}>
      {props.children}
    </StoreContext.Provider>
  )
}
