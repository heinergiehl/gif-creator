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
    <div className="h-screen w-full bg-slate-200">
      <span className="p-4 text-gray-500">History</span>
    </div>
  );
});
export default ElementsHistoryPanel;
