import { useStores } from '@/store';
import { observer } from 'mobx-react-lite';
import React from 'react';
const CircularProgress = observer(function CircularProgress() {
  const store = useStores().editorStore;
  const progress = store.progress.conversion;
  return (
    <div className="relative h-20 w-20">
      <svg
        className="absolute"
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f3f3" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#3498db"
          strokeWidth="12"
          strokeDasharray="339.292"
          strokeDashoffset={339.292 - (339.292 * progress) / 100}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] text-lg font-bold">
        {Math.floor(progress)}%
      </span>
    </div>
  );
});
export default CircularProgress;
