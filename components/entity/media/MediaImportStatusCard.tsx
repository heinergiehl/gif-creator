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
    <div className={cn('w-full rounded-2xl border bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70', className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-slate-100 p-2 dark:bg-slate-900">
          <Icon className={cn('h-5 w-5 text-emerald-500', iconClassName)} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900 dark:text-slate-50">{title}</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{description}</div>
        </div>
      </div>
    </div>
  );
}
