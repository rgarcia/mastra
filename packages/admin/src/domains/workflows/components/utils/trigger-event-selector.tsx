import { createId } from '@paralleldrive/cuid2';

import { Button } from '@/components/ui/button';

import { Icon } from '@/app/components/icon';

import { UpdateAutomationTrigger, RefinedIntegrationEventTriggerProperties } from '../../types';

import { FrameworkIcon } from './action-selector';

interface TriggerEventSelectorProps {
  type: RefinedIntegrationEventTriggerProperties['type'];
  label: RefinedIntegrationEventTriggerProperties['label'];
  icon: RefinedIntegrationEventTriggerProperties['icon'];
  isSelected: boolean;
  onSelectTriggerEvent: (trigger: UpdateAutomationTrigger) => void;
}

export function TriggerEventSelector({
  type,
  label,
  icon,
  onSelectTriggerEvent,
  isSelected,
}: TriggerEventSelectorProps) {
  const handleSelectTriggerEvent = () => {
    const id = createId();
    onSelectTriggerEvent({ id, type, ...(isSelected ? {} : { condition: undefined, payload: { value: undefined } }) });
  };
  return (
    <Button
      onClick={handleSelectTriggerEvent}
      className="bg-transparent border-border h-9 justify-start gap-3 border-[0.5px] py-0 pl-0 pr-3 text-[#a9a9a9] opacity-70 transition-colors hover:opacity-100 w-full"
    >
      <div className="border-border flex h-full w-9 items-center justify-center border-r-[0.3px]">
        <FrameworkIcon icon={icon} className="text-base text-current" />
      </div>
      <span className="text-xs font-[500]">{label}</span>
      {isSelected ? <Icon name="check-in-circle" className="text-accent ml-auto text-base" /> : null}
    </Button>
  );
}