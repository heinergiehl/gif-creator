import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
export interface CustomTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
}
const CustomTooltip = React.forwardRef<React.ElementRef<typeof TooltipTrigger>, CustomTooltipProps>(
  ({ children, content }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild ref={ref}>
            {children}
          </TooltipTrigger>
          <TooltipContent>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
CustomTooltip.displayName = 'CustomTooltip';
export { CustomTooltip };
