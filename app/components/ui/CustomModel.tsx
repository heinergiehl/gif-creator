import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { observer } from 'mobx-react-lite';
export interface ICustomModalProps {
  isOpen: boolean;
  onTrigger: () => void;
  title?: string;
  description?: string;
  link?: string;
  onClose: () => void;
  onApply: () => void;
  children?: React.ReactNode;
}
export default observer(function CustomModal({
  isOpen,
  onTrigger,
  title,
  description,
  link,
  onClose,
  onApply,
  children,
}: ICustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onTrigger}>
      <DialogTrigger asChild>
        <Button variant="outline">{title || 'Open'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <>
              <Button type="button" variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button type="button" variant="default" onClick={onApply}>
                Apply
              </Button>
            </>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
