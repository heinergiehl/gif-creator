import { StoreContext } from "@/store"
import React from "react"
import { observer } from "mobx-react"
import { MdImage, MdTextFields } from "react-icons/md"
import { CiImageOn } from "react-icons/ci"
const ElementsHistoryPanel = observer(() => {
  // display all the nested elements of the current gif frame in the history panel
  const store = React.useContext(StoreContext)
  const currentFrame = store.frames[store.currentKeyFrame]
  let nestedElementsIds: { id: string }[] = []
  console.log(store.currentKeyFrame)
  if (currentFrame) {
    nestedElementsIds = currentFrame.nestedObjects
    console.log(nestedElementsIds)
  }
  const nestedElements = store._editorElements.filter((element) => {
    console.log(element.id)
    return nestedElementsIds.some((id) => id.id === element.id)
  })
  const Icon = (type: string) => {
    switch (type) {
      case "text":
        return <MdTextFields size="20" />
      case "image":
        return <MdImage size="20" />
      default:
        return <MdTextFields size="20" />
    }
  }
  return (
    <div className=" h-full bg-slate-200">
      <span className="text-gray-500 p-4">History</span>
      <ul className=" ">
        {nestedElements.map((element, index) => (
          <li
            key={element.id}
            className="flex items-center justify-start  text-gray-700 font-semibold px-2 py-1 hover:bg-gray-300 cursor-pointer"
          >
            {Icon(element.type)}
            <span className="text-xs">{element.name}</span>
            {/* delete element */}
            <button
              onClick={() => store.deleteNestedObjectOfCurrentFrame(index)}
              className="ml-auto"
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
})
export default ElementsHistoryPanel
