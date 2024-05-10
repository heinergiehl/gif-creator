import React from 'react';
import { observer } from 'mobx-react-lite';
export default observer(function CustomListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className=" flex flex-row border-gray-400 ">
      <div
        className="flex flex-1 transform cursor-pointer select-none items-center   rounded-md
          bg-gray-200
         transition-all duration-500  ease-in-out  hover:scale-[101%] hover:bg-slate-700 hover:shadow-lg dark:bg-slate-700 dark:hover:bg-slate-800"
      >
        {children}
      </div>
    </li>
  );
});
