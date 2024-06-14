import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
export interface CustomTooltipProps {
  children: React.ReactNode;
  content: string;
}
const CustomTooltip = React.forwardRef(({ children, content }: CustomTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
CustomTooltip.displayName = 'CustomTooltip';
export { CustomTooltip };
