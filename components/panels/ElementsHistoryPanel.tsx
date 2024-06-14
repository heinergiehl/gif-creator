'use client';
import React from 'react';
import { observer } from 'mobx-react';
import { MdImage, MdTextFields } from 'react-icons/md';
import { useStores } from '@/store';
import { CustomAnimatedList } from '../ui/CustomAnimatedList';
import { MagicCard, MagicContainer } from '../magicui/magic-card';
import { Button } from '../ui/button';
import { DeleteIcon, RemoveFormattingIcon, XIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { EditorElement } from '@/types';
import Image from 'next/image';
const ElementsHistoryPanel = observer(() => {
  // display all the nested elements of the current gif frame in the history panel
  const rootStore = useStores();
  const store = rootStore.editorStore;
  return (
    <div className="mt-4  w-full " id="history">
      <span className=" ">Elements History</span>
      <Separator className="my-2" />
      <MagicContainer className="flex-start flex flex-wrap   justify-stretch  gap-4">
        {store.elementsInCurrentFrame?.map((element) => (
          <MagicCard
            onClick={() => {
              store.setSelectedElements([element.id]);
            }}
            key={element.id}
            className="overflow-hiddenshadow-2xl relative flex h-[90px] max-w-[200px] cursor-pointer flex-col items-start justify-center"
          >
            <div className="absolute left-[85%] top-[2%] h-full  w-full ">
              <Button
                variant={'destructive'}
                className="h-5 w-5 rounded-full px-1 py-0"
                onClick={() => {
                  store.removeElement(element.id);
                }}
              >
                <XIcon size={10} />
              </Button>
            </div>
            <div className="ml-4 text-xs first-letter:uppercase ">{element.type}</div>
            <Separator orientation={'horizontal'} className=" my-1 mt-2 w-full" />
            <p className="z-10 ml-4 whitespace-nowrap text-4xl font-medium text-gray-800 dark:text-gray-200">
              <Content element={element} />
            </p>
            <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          </MagicCard>
        ))}
      </MagicContainer>
    </div>
  );
});
export default ElementsHistoryPanel;
const Content = observer(({ element }: { element: EditorElement }) => {
  // depends on the type of element: if text, display the text, if image, display the image
  switch (element.type) {
    case 'text':
      return <div className="max-w-[180px] truncate">{element.properties.text}</div>;
    case 'image':
      return <Image src={element.properties.src} height={50} width={50} alt="item" />;
    default:
      return 'Text';
  }
});
