'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import SelectDropDown from '@/components/ui/select-dropdown';

import { lodashTitleCase } from '@/lib/string';
import { cn } from '@/lib/utils';

import { Icon } from '@/app/components/icon';
import useVariables from '@/domains/workflows/hooks/use-manage-variables';
import { ActionVariables } from '@/domains/workflows/types';

import VariableBadgeList from '../../utils/variable-badge-list';

function MultiSelect({
  options,
  field,
  onSelect,
  selected,
  canUseVariables = true,
  initialVariables,
}: {
  options: { label: string; value: string }[];
  field: any;
  onSelect: any;
  selected?: string[];
  canUseVariables?: boolean;
  initialVariables?: ActionVariables;
}) {
  const [selectedValues, setSelectedValues] = useState((selected || []).map(value => ({ id: value, name: value })));
  const isMounted = useRef(false);

  const cb = useCallback(
    ({ variablePayload }: { variablePayload: ActionVariables }) =>
      onSelect({ key: field.name, value: formatSelection(), variables: variablePayload }),
    [field.name, formatSelection],
  );

  const { variables, variablePayload, handleUpdateVariablePayload, updateVariables } = useVariables({
    initialVariables,
    fieldValue: field.value,
    cb,
  });

  const allOptions = options.length ? options : [];

  const variableSelections = useMemo(() => {
    return selectedValues.filter(value => value.id.includes('{{') && value.id.includes('}}'));
  }, [selectedValues]);

  const totalVariablesSelection = variableSelections.length;

  function formatSelection() {
    return selectedValues.map((value: any) => {
      return value.id;
    });
  }

  useEffect(() => {
    updateVariables(variableSelections.map(value => value.id));
  }, [variableSelections]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!selectedValues.length) return;

    const formattedSelection = formatSelection();
    onSelect({ key: field.name, value: formattedSelection });
  }, [selectedValues]);

  const mappedValues = allOptions.map(value => {
    return {
      id: value.value,
      name: value.label,
    };
  });

  return (
    <SelectDropDown
      placeholder={`Add ${lodashTitleCase(field.name)}`}
      data={mappedValues as any}
      selectedValues={selectedValues}
      setSelectedValues={setSelectedValues}
      emptyMessage={`No options found.`}
    >
      <div className="flex w-full flex-col gap-2">
        {!selectedValues.length ? (
          <Button
            type="button"
            role="combobox"
            className={cn('ring-neutral-750 text-text-dim h-8 justify-between text-[0.75rem] ring-1')}
          >
            Add {lodashTitleCase(field.name.split('.').pop() || '')}
            <Icon name="down-caret" className="text-icon h-3.5 w-3.5" />
          </Button>
        ) : (
          <div className="ring-neutral-750 min-h-8 relative flex h-auto w-full max-w-full flex-wrap items-center gap-1 overflow-auto rounded px-2 py-1 ring-1">
            {selectedValues.map((value, idx) => (
              <Badge
                key={idx}
                variant={'secondary'}
                className="flex h-[1.5rem] max-w-[5.5rem] items-center gap-1 rounded px-1"
                onClick={e => e.stopPropagation()}
              >
                <span className="truncate whitespace-nowrap text-[0.675rem]">{value.name}</span>
                <IconButton
                  onClick={() => {
                    setSelectedValues(selectedValues.filter(selectedValue => selectedValue.id !== value.id));
                    onSelect({
                      key: field.name,
                      value: selectedValues.filter(selectedValue => selectedValue.id !== value.id),
                    });
                  }}
                  name="x"
                  className="group rounded p-1 hover:bg-white/10 hover:text-light-text"
                  iconClassname="text-dim-text h-3 w-3 group-hover:text-light-text"
                  type="button"
                />
              </Badge>
            ))}

            <IconButton
              type="button"
              className="absolute inset-auto right-2"
              name="down-caret"
              iconClassname="text-icon h-3.5 w-3.5"
            />
          </div>
        )}
        <div className="flex w-max max-w-full flex-col gap-2" onClick={e => e.stopPropagation()}>
          {canUseVariables && (
            <VariableBadgeList
              className="mt-0"
              handleUpdateVariablePayload={handleUpdateVariablePayload}
              variablePayload={variablePayload}
              variables={variables}
            />
          )}
          {canUseVariables && (
            <Button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setSelectedValues(prev => [
                  ...prev,
                  {
                    id: `{{${field.name}${totalVariablesSelection}}}`,
                    name: `{{${field.name}${totalVariablesSelection}}}`,
                  },
                ]);
                onSelect({ key: field.name, value: [`{{${field.name}${totalVariablesSelection}}}`] });
              }}
              className="group flex w-max items-center gap-1 rounded bg-white/[0.025] p-1"
              variant={'secondary'}
            >
              <span className="text-white/70 transition-colors duration-150 ease-in-out group-hover:text-white/80">{`{{}}`}</span>
              <span className="text-[0.75rem] text-white/30 transition-colors duration-150 ease-in-out group-hover:text-white/80">
                use variables
              </span>
            </Button>
          )}
        </div>
      </div>
    </SelectDropDown>
  );
}

export default MultiSelect;