import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { fabric } from 'fabric';
import { Label } from '@radix-ui/react-label';
import CustomRangeInput from '@/app/components/ui/CustomRangeInput';
import CustomColorPicker from '@/app/components/ui/CustomColorPicker';
import CustomList from '@/app/components/ui/CustomList';
import CustomListItem from '@/app/components/ui/CustomListItem';
import { CustomSelect } from '@/app/components/ui/CustomSelect';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useStores } from '@/store';
import FilterStore from '@/store/FilterStore';
import CustomCheckBox from '@/app/components/ui/CustomCheckbox';
import { Filter } from 'fluent-ffmpeg';
import { EditorStore, FilterType } from '@/store/EditorStore';
import { filter, set } from 'lodash';
import { action } from 'mobx';
import { MdDelete } from 'react-icons/md';
import { Input } from '@/components/ui/input';
interface RemoveColorFilterInput {
  color: string;
  distance: number;
}
interface FilterMainParameterKeys {
  grayscale: boolean;
  brightness: number;
  removeColor: RemoveColorFilterInput;
  invert: boolean;
  sepia: boolean;
  saturation: number;
  contrast: number;
  hueRotate: number;
  blur: number;
  opacity: number;
  pixelate: number;
}
interface FilterConfig {
  [key: string]: {
    type: 'checkbox' | 'range' | 'complex';
    min?: number;
    max?: number;
    components?: Record<keyof RemoveColorFilterInput, 'range' | 'color'>;
  };
}
export interface IBaseFilter extends fabric.IBaseFilter, FilterMainParameterKeys {
  type: FilterType;
}
const filterConfig: FilterConfig = {
  Grayscale: { type: 'checkbox' },
  Brightness: { type: 'range', min: -1, max: 1 },
  RemoveColor: { type: 'complex', components: { color: 'color', distance: 'range' } },
  Invert: { type: 'checkbox' },
  Sepia: { type: 'checkbox' },
  Saturation: { type: 'range', min: -1, max: 1 },
  Contrast: { type: 'range', min: -1, max: 1 },
  HueRotate: { type: 'range', min: 0, max: 360 },
  Blur: { type: 'range', min: 0, max: 100 },
  Opacity: { type: 'range', min: 0, max: 1 },
  Pixelate: { type: 'range', min: 0, max: 200 },
};
const InputComponents = {
  checkbox: CustomCheckBox,
  color: CustomColorPicker,
  range: CustomRangeInput,
};
const FilterControls: React.FC = observer(() => {
  const { filterStore, editorStore } = useStores();
  console.log('FILTERS', filterStore.filtersOfSelectedElement);
  const [addingFilter, setAddingFilter] = React.useState(false);
  const [filters, setFilters] = React.useState<IBaseFilter[]>([]);
  const [selectedFilterType, setSelectedFilterType] = React.useState<FilterType | null>(null);
  const fromFrame = filterStore.fromFrame;
  const toFrame = filterStore.toFrame;
  useEffect(() => {
    setFilters([...(filterStore.filtersOfSelectedElement() || [])]);
  }, [filterStore.filtersOfSelectedElement, editorStore.currentKeyFrame]);
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">
        Filters applied to frame {editorStore.currentKeyFrame}
      </h2>
      <Label htmlFor="filter" className="mr-4 text-center text-xs">
        Add a Filter to modify the image
        <CustomSelect
          value={selectedFilterType}
          trigger="Choose a filter"
          options={Object.keys(filterConfig).map((key) => {
            return {
              value: key,
              label: key,
            };
          })}
          onChange={(filterType) => {
            setSelectedFilterType(filterType as FilterType);
            filterStore.applyFilter(filterType, {});
            setFilters([...(filterStore.filtersOfSelectedElement() || [])]);
            console.log(filterType, filters);
          }}
        />
      </Label>
      {filters?.map((filter, index) => (
        <CustomListItem key={index}>
          <FilterItem filter={filter} index={index} />
        </CustomListItem>
      ))}
    </div>
  );
});
export interface FilterItemProps {
  filter: IBaseFilter;
  index: number;
}
export const FilterItem: React.FC<FilterItemProps> = observer(({ filter, index }) => {
  const { filterStore } = useStores();
  const [values, setValues] = React.useState({
    from: filterStore.fromFrame || 0,
    to: filterStore.toFrame || 0,
  });
  return (
    <div className="flex h-full w-full flex-col p-2">
      <div className="flex h-full w-full flex-row justify-between gap-x-8">
        <span className="first-letter:uppercase">{filter.type}</span>
        <Button
          className={cn([
            'm-0 h-[25px] w-[25px] rounded-full p-1 transition duration-200',
            'text-red-400 hover:scale-105 hover:bg-red-100 hover:text-red-600 hover:shadow-md',
          ])}
        >
          <MdDelete />
        </Button>
      </div>
      <Label htmlFor="From">
        <Input
          type="number"
          value={values.from}
          onChange={(e) => {
            filterStore.setFromFrame(Number(e.target.value));
            setValues({ ...values, from: Number(e.target.value) });
          }}
        />
      </Label>
      <Label htmlFor="To">
        <Input
          type="number"
          value={values.to}
          onChange={(e) => {
            filterStore.setToFrame(Number(e.target.value));
            setValues({ ...values, to: Number(e.target.value) });
          }}
        />
      </Label>
      <FilterOptions filterType={filter.type} filter={filter} />
      {/* apply to all frames button */}
      <Button onClick={() => filterStore.applyFilterToAllFrames(filter.type)}>
        Apply to all frames
      </Button>
    </div>
  );
});
interface FilterOptionsProps {
  filterType: FilterType;
  filter: IBaseFilter;
}
const FilterOptions: React.FC<FilterOptionsProps> = observer(({ filterType, filter }) => {
  const config = filterConfig[filterType];
  console.log('CONFIG', config, filterType, filter);
  switch (config.type) {
    case 'checkbox':
      return <CheckboxOption filterType={filterType} filter={filter} />;
    case 'range':
      return <RangeOption filterType={filterType} filter={filter} />;
    case 'complex':
      return <ComplexFilterOptions filterType={filterType} filter={filter} />;
    default:
      return null;
  }
});
interface CheckboxOptionProps {
  filterType: FilterType;
  filter: IBaseFilter;
}
const CheckboxOption: React.FC<CheckboxOptionProps> = ({ filterType, filter }) => {
  const { filterStore } = useStores();
  const [checked, setChecked] = React.useState(
    !!filter[filterType.toLowerCase() as keyof IBaseFilter],
  );
  return (
    <CustomCheckBox
      value={checked}
      label={checked ? 'Remove Filter' : 'Apply Filter'}
      checked={checked}
      name={filterType}
      handleCheckedChange={(bool) => {
        filterStore.applyFilter(filterType, { removeFilter: !bool });
        setChecked(!!bool);
      }}
    />
  );
};
interface RangeOptionProps {
  filterType: FilterType;
  filter: IBaseFilter;
}
const RangeOption: React.FC<RangeOptionProps> = observer(({ filterType, filter }) => {
  const { filterStore } = useStores();
  const config = filterConfig[filterType];
  const [value, setValue] = React.useState<number>(0);
  const key = filterType.toLowerCase();
  return (
    <CustomRangeInput
      label={filterType}
      name={filterType}
      min={config.min || 0}
      max={config.max || 1}
      value={Number(value)}
      onChange={(value) => {
        setValue(value);
        filterStore.applyFilter(filterType, { [key]: value });
        console.log(filterType, value, filter);
      }}
    />
  );
});
interface ComplexFilterOptionsProps {
  filterType: FilterType;
  filter: IBaseFilter;
}
const ComplexFilterOptions: React.FC<ComplexFilterOptionsProps> = ({ filterType, filter }) => {
  const { filterStore } = useStores();
  const complexConfig = filterConfig[filterType].components;
  console.log('ComplexFilterOptions', filter?.color, filter?.distance);
  if (!complexConfig) return null;
  const [values, setValues] = React.useState<RemoveColorFilterInput>({
    color: filter?.color || '',
    distance: filter?.distance || 0,
  });
  const latestState = filterStore.filtersOfSelectedElement()?.find((f) => f.type === filterType);
  useEffect(() => {
    setValues({ color: latestState?.color, distance: latestState?.distance });
    filterStore.applyFilter(filterType, {
      color: latestState?.color,
      distance: latestState?.distance,
    });
  }, [filter, filterStore.filtersOfSelectedElement, filterType, filterStore.getSelectedElement()]);
  return (
    <div className="flex items-center gap-x-4">
      <CustomColorPicker
        name={'Color'}
        label="Color"
        value={values?.color}
        onChange={(color) => {
          setValues({ ...(values || {}), color });
          filterStore.applyFilter(filterType, { ...(values || {}), color });
        }}
      />
      <CustomRangeInput
        label="Distance"
        name="distance"
        min={0}
        max={1}
        value={values?.distance || 0}
        onChange={(value) => {
          setValues({ ...(values || {}), distance: value });
          filterStore.applyFilter(filterType, { ...(values || {}), value });
        }}
      />
    </div>
  );
};
export default FilterControls;
