import { Button } from '@/components/ui/button';
import { FilterType } from '@/store/EditorStore';
import { observer } from 'mobx-react';
import { MdDelete } from 'react-icons/md';
import CustomListItem from './CustomListItem';
interface CustomListProps {
  caption: string;
  children: React.ReactNode;
}
export default observer(function CustomList({ children, caption }: CustomListProps) {
  return (
    <div className=" mx-auto flex w-full flex-col items-start justify-center ">
      <caption>{caption}</caption>
      <ul className="flex flex-col  ">{children}</ul>
    </div>
  );
});
