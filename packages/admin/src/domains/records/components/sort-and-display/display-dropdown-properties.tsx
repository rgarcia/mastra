import { Property } from '@arkw/core';
import { DragDropContext, Draggable, DraggableStyle, DropResult, Droppable } from '@hello-pangea/dnd';

import useDraggableInPortal from '@/lib/hooks/use-draggable-in-portal';
import { cn } from '@/lib/utils';

import { Icon } from '@/app/components/icon';
import { IconName } from '@/types/icons';

import { filterPropertyTypeToIconMap } from '../../utils';

/**
 * Reorder an array of properties
 * Update the `order` key of each property after reordering
 * make sure the primary key is the first item on the reordered list
 */
const reorderProperties = (array: Property[], sourceIndex: number, destinationIndex: number) => {
  if (sourceIndex < 0 || sourceIndex >= array.length || destinationIndex < 0 || destinationIndex >= array.length) {
    throw new Error('Invalid source or destination index');
  }

  const primaryProperty = array.find(
    item => item.name === 'name' || item.name === 'firstName' || item.name === 'person',
  );

  const element = array.splice(sourceIndex, 1)[0];
  array.splice(destinationIndex, 0, element);

  const withoutPrimaryProperty = array
    .filter(item => item.id !== primaryProperty?.id)
    ?.map((item, index) => {
      item.order = index + 1;
      return item;
    });

  const allProperties = [...(primaryProperty ? [{ ...primaryProperty, order: 0 }] : []), ...withoutPrimaryProperty];

  return allProperties;
};

interface DisplayDropdownPropertiesProps {
  properties: Property[];
  setPropertiesData: (propertiesData: { properties: Property[]; lastOrderedAt?: number }) => void;
}

const DisplayDropdownProperties = ({ properties, setPropertiesData }: DisplayDropdownPropertiesProps) => {
  const renderDraggable = useDraggableInPortal();

  const getItemStyle = (isDragging: boolean, draggableStyle: DraggableStyle = {}) => {
    return {
      cursor: isDragging ? 'grab' : 'pointer',
      ...draggableStyle,
    };
  };

  const getListStyle = (isDraggingOver: boolean) => ({
    cursor: isDraggingOver ? 'grab' : 'default',
  });

  const onReorder = ({ source, destination }: { source: number; destination: number }) => {
    const reorderedProperties = reorderProperties(properties, source, destination);
    setPropertiesData({ properties: reorderedProperties, lastOrderedAt: Date.now() });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    onReorder({
      source: result.source.index,
      destination: result.destination.index,
    });
  };

  const lowestPropertyOrder = properties.reduce(
    (acc, field) => ((field.order || 0) < acc ? field.order : acc),
    Infinity,
  );

  const primaryProperty = properties.find(field => field.order === lowestPropertyOrder) || properties[0];

  const handleChangePropertyVisibility =
    ({ id, visible }: { id: string; visible: boolean }) =>
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      event.preventDefault();

      const newProperties = properties.map(property => {
        if (property.id === id) {
          return {
            ...property,
            visible: !visible,
          };
        }
        return property;
      });
      setPropertiesData({ properties: newProperties });
    };

  return (
    <>
      <p className="text-light-text text-xs">Properties</p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(droppableProvided, droppableSnapshot) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              style={getListStyle(droppableSnapshot.isDraggingOver)}
              className="no-scrollbar max-h-48 w-full space-y-[4px] overflow-y-scroll"
            >
              {properties.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id as string}
                  index={index}
                  isDragDisabled={item.id === primaryProperty?.id}
                >
                  {renderDraggable((draggableProvided, draggableSnapshot) => {
                    return (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        style={getItemStyle(draggableSnapshot.isDragging, draggableProvided.draggableProps.style)}
                        className={cn(
                          'flex cursor-pointer select-none items-center gap-[10px]',
                          item.visible && 'text-lightptext',
                          !item.visible && 'text-dim-text',
                          item.id === primaryProperty?.id && '!transform-none',
                        )}
                        onClick={handleChangePropertyVisibility({ id: item.id as string, visible: item.visible })}
                        tabIndex={0}
                      >
                        {item.id !== primaryProperty?.id ? (
                          <Icon name="draggable" className="text-dim-text h-2 w-2" />
                        ) : null}
                        <div
                          className={cn(
                            'flex flex-1 gap-1 rounded-[4px] px-[6px] py-[4.5px]',
                            item.visible
                              ? 'text-light-text bg-window-bg border border-solid border-transparent'
                              : 'text-dim-text border-primary-border border border-solid bg-transparent',
                          )}
                        >
                          <Icon name={filterPropertyTypeToIconMap[item.type] as IconName} className="text-dim-text" />
                          <p className="text-xs">{item.displayName}</p>
                        </div>
                      </div>
                    );
                  })}
                </Draggable>
              ))}

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default DisplayDropdownProperties;