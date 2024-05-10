import CustomList from '@/app/components/ui/CustomList';
import FilterControls from '../entity/EffectsResource';
import { observer } from 'mobx-react-lite';
import { fabric } from 'fabric';
export default observer(function EffectsPanel() {
  return (
    <>
      <FilterControls />
    </>
  );
});
