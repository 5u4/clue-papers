import React from "react";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Cross2Icon, DragHandleDots2Icon } from "@radix-ui/react-icons";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface Props {
  playerNames: string[];
  setPlayerNameOrder: (order: string[]) => void;
}

// TODO styling

export const PlayerListSort: React.FC<Props> = ({
  playerNames,
  setPlayerNameOrder,
}) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = playerNames.findIndex((p) => p === active.id);
      const newIndex = playerNames.findIndex((p) => p === over?.id);
      setPlayerNameOrder(arrayMove(playerNames, oldIndex, newIndex));
    }
  }

  return (
    <div>
      <div className="w-full">
        <Label>Set player order</Label>
        <p className="text-muted-foreground text-sm py-1">
          Drag to set players in order. Place yourself at the first.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={playerNames}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col space-y-2">
              {playerNames.map((item) => (
                <SortableItem
                  key={item}
                  name={item}
                  onDelete={() => {
                    setPlayerNameOrder(playerNames.filter((p) => p !== item));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

const SortableItem: React.FC<{ name: string; onDelete: () => void }> = ({
  name,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: name });

  return (
    <div
      className="w-full pl-3 pr-2 py-2 flex items-center justify-between rounded-md border bg-white"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {name}

      <div className="flex flex-row items-center justify-between space-x-2">
        <DragHandleDots2Icon {...attributes} {...listeners} />

        <Button variant="outline" size="icon" onClick={onDelete}>
          <Cross2Icon />
        </Button>
      </div>
    </div>
  );
};
