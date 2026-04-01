import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';
export interface CustomTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}
const CustomTooltip = React.forwardRef<React.ElementRef<typeof TooltipTrigger>, CustomTooltipProps>(
  ({ children, content, side = 'top', sideOffset = 8 }, ref) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild ref={ref}>
            {children}
          </TooltipTrigger>
          <TooltipContent side={side} sideOffset={sideOffset}>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
CustomTooltip.displayName = 'CustomTooltip';
export { CustomTooltip };
