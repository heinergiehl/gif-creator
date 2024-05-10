import React from 'react';
import { observer } from 'mobx-react';
import { MdImage, MdTextFields } from 'react-icons/md';
import { useStores } from '@/store';
const ElementsHistoryPanel = observer(() => {
  // display all the nested elements of the current gif frame in the history panel
  const rootStore = useStores();
  const store = rootStore.editorStore;
  const Icon = (type: string) => {
    switch (type) {
      case 'text':
        return <MdTextFields size="20" />;
      case 'image':
        return <MdImage size="20" />;
      default:
        return <MdTextFields size="20" />;
    }
  };
  return (
    <div className="relative h-screen w-full bg-secondary opacity-100  ">
      <div className="absolute -inset-0.5   rounded-md bg-pink-600 bg-gradient-to-r from-pink-500 to-purple-600 opacity-60 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-500"></div>
      <span className="absolute z-[100] h-full w-full bg-secondary p-4 text-gray-500 opacity-100 dark:bg-slate-900">
        History
      </span>
    </div>
  );
});
export default ElementsHistoryPanel;
