import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
interface CustomAccordionProps {
  trigger: string;
  content: string;
}
export const CustomAccordion = ({ trigger, content }: CustomAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-2xl">{trigger}</AccordionTrigger>
        <AccordionContent className="text-xl">{content}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
