'use client';

import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { capitalizeFirstLetter } from '@/lib/string';

import { Icon } from '@/app/components/icon';
import { useGetWorkflows } from '@/domains/workflows/hooks/use-workflow';
import { getParsedFrameworkApis } from '@/domains/workflows/utils';

import { ToolChoice, useAgentFormContext } from '../context/agent-form-context';

import { DropdownPair, DropdownPairProps } from './tools-dropdown-pair';

interface ToolsMultiSelectProps {
  data: string;
}

export const ToolsMultiSelect = ({ data }: ToolsMultiSelectProps) => {
  const { workflows } = useGetWorkflows();
  const deserializedData = getParsedFrameworkApis(data);

  const groupedData = [...workflows, ...deserializedData].reduce((acc: Record<string, any>, curr) => {
    const key = (curr as any).integrationName || (curr as any).title || 'Unknown';
    if (!acc[key]) {
      acc[key] = [];
    }

    const itemToAdd = 'status' in curr && curr.status === 'PUBLISHED' ? { ...curr, type: 'workflow' } : curr;
    acc[key].push(itemToAdd);
    return acc;
  }, {});

  const integrationKeys = Object.keys(groupedData).map(key => ({
    name: capitalizeFirstLetter(key),
    value: key,
    icon: key.toLowerCase(),
    type: groupedData[key][0].type === 'workflow' ? 'workflow' : 'integration',
  }));

  const { setTools } = useAgentFormContext();

  return (
    <MultiDropdownSelector deserializedData={deserializedData} integrationKeys={integrationKeys} setTools={setTools} />
  );
};
type MultiDropdownSelectorProps = Omit<DropdownPairProps, 'setIntegrationKeys' | 'index' | 'removeDropdownPair'>;

const MultiDropdownSelector = (props: MultiDropdownSelectorProps) => {
  const [dropdownPairs, setDropdownPairs] = useState<number[]>([0]);

  const addNewDropdownPair = () => {
    setDropdownPairs(prev => [...prev, prev.length]);
  };

  const removeDropdownPair = (indexToRemove: number) => {
    if (dropdownPairs.length === 1) return;
    setDropdownPairs(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  const { setToolChoice } = useAgentFormContext();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-medium text-sm">
          Tools: <span className="bg-mastra-bg-4 rounded py-1 px-2 ">{dropdownPairs.length}</span>
        </h1>
        {dropdownPairs.map((_, index) => (
          <DropdownPair key={index} {...props} index={index} removeDropdownPair={removeDropdownPair} />
        ))}
        <button onClick={addNewDropdownPair} className="p-2 bg-mastra-bg-4 flex items-center text-white rounded ">
          <Icon name="plus-icon" className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2 justify-between">
        <p className="text-xs font-medium">Tool choice:</p>
        <RadioGroup
          onValueChange={val => setToolChoice(val as ToolChoice)}
          defaultValue="auto"
          className="flex items-center"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto">Auto</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="required" id="required" />
            <Label htmlFor="required">Required</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default ToolsMultiSelect;