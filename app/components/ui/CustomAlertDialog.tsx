import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStores } from '@/store';
import { observer } from 'mobx-react-lite';
export const CustomAlertDialog = observer(function CustomAlertDialog() {
  const store = useStores().editorStore;
  const showDialog = store.showAlertDialog;
  const info = store.info;
  const toggleAlertDialog = () => {
    store.toggleAlertDialog();
  };
  return (
    <AlertDialog open={showDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{info.header}</AlertDialogTitle>
          <AlertDialogDescription>{info.content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={toggleAlertDialog}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
