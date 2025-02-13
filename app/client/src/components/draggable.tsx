import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import * as api from "@/lib/handlers";
import { useData } from "@/lib/context";
import { FlatNode } from "@/lib/types";
import { useTreeContext } from "./tree";

interface DraggableWrapperProps {
    children: React.ReactNode;
}

export const DraggableWrapper = ({ children }: DraggableWrapperProps) => {
    const [activeTreeNode, setActiveTreeNode] = useState<FlatNode | null>(null);
    const { expandItem } = useTreeContext();
    const { data } = useData();

    const handleDragStart = (event: DragStartEvent) => {
        const node = data.find(({ id }) => id == event.active.id);
        setActiveTreeNode(node ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTreeNode(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id === "" ? null : Number(over.id);

        if (activeId && activeId !== overId) {
            api.moveItem(activeId, overId);
            if (overId) expandItem(overId.toString());
        }
    };

    const activationConstraint = {
        delay: 500,
        tolerance: 5,
    };
    const mouseSensor = useSensor(MouseSensor, { activationConstraint });
    const touchSensor = useSensor(TouchSensor, { activationConstraint });
    const keyboardSensor = useSensor(KeyboardSensor, {});
    const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            {children}
            <DragOverlay>
                {activeTreeNode ? (
                    <div className="w-full rounded-md p-2 border hover:border-input border-transparent bg-card shadow-md cursor-grabbing">
                        {activeTreeNode.name}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

interface DraggableDroppableProps {
    id: string;
    children?: React.ReactNode;
    className?: string;
}

export function Draggable({
    id,
    children,
    className,
}: DraggableDroppableProps) {
    const { attributes, listeners, setNodeRef } = useDraggable({ id });

    return (
        <button
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={className}
        >
            {children}
        </button>
    );
}

export function Droppable({
    id,
    children,
    className,
}: DraggableDroppableProps) {
    const { isOver, setNodeRef, active } = useDroppable({ id });

    className += " rounded-md border-dashed border-2";
    if (id === "") {
        className += active ? " border-gray-300" : " border-transparent";
        className += isOver ? " opacity-100" : " opacity-50";
    } else {
        className +=
            !active || (isOver && active.id !== id)
                ? " opacity-100"
                : " opacity-50";
        className +=
            isOver && active && active.id !== id
                ? " border-gray-300"
                : " border-transparent";
    }

    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}
