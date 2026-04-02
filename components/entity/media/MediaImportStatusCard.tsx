import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MediaImportStatusCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function MediaImportStatusCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  className,
}: MediaImportStatusCardProps) {
  return (
    <div className={cn('w-full rounded-xl border bg-white/70 px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950/70', className)}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900">
          <Icon className={cn('h-4 w-4 text-emerald-500', iconClassName)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</div>
          {description && (
            <div className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
