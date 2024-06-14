import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';
import { BentoCard } from './bento-card';
import { FeautureType } from '@/app/page';
const BentoGrid = ({ features, className }: { features: FeautureType[]; className?: string }) => {
  return (
    <div className={cn('grid w-full auto-rows-[22rem] grid-cols-3 gap-4', className)}>
      {features.map((feature, index) => (
        <BentoCard
          key={index}
          {...feature}
          Icon={feature.Icon}
          name={feature.name}
          description={feature.description}
          href={feature.href}
          cta={feature.cta}
          className={feature.className}
        />
      ))}
    </div>
  );
};
export { BentoGrid };
