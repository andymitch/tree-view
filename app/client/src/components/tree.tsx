import { TreeNode } from "@/lib/types";
import { useState, useContext, createContext, useEffect } from "react";
import { Draggable, Droppable } from "./draggable";
import { ContextMenuContainer } from "./context-menu";
import { useData } from "@/lib/context";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { AddRootItem } from "./add-root-item";

export interface TreeState {
    collapseAll: () => void;
    expandAll: () => void;
    expandItem: (itemId: string) => void;
    collapseItem: (itemId: string) => void;
}
const TreeContext = createContext<TreeState>({
    collapseAll: () => {},
    expandAll: () => {},
    expandItem: () => {},
    collapseItem: () => {},
});

export const TreeContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { data } = useData();
    const [expandedItems, _setExpandedItems] = useState<string[]>([]);

    const setExpandedItems = (items: string[]) => {
        _setExpandedItems(items);
        sessionStorage.setItem("expandedItems", JSON.stringify(items));
    };

    const expandItem = (itemId: string) => {
        setExpandedItems([...expandedItems, itemId]);
    };

    const collapseItem = (itemId: string) => {
        setExpandedItems(expandedItems.filter((id) => id !== itemId));
    };

    useEffect(() => {
        const storedExpandedItems = sessionStorage.getItem("expandedItems");
        if (storedExpandedItems) {
            _setExpandedItems(JSON.parse(storedExpandedItems));
        }
    }, []);

    const collapseAll = () => {
        setExpandedItems([]);
    };

    const expandAll = () => {
        setExpandedItems(data.map((item) => item.id.toString()));
    };

    return (
        <TreeContext.Provider
            value={{
                collapseAll,
                expandAll,
                expandItem,
                collapseItem,
            }}
        >
            <Accordion
                type="multiple"
                className="w-full"
                value={expandedItems}
                onValueChange={(items) => {
                    setExpandedItems(items);
                }}
            >
                {children}
            </Accordion>
        </TreeContext.Provider>
    );
};

export const useTreeContext = () => useContext(TreeContext);

export const ExpandAllButton = () => {
    const { expandAll } = useTreeContext();

    return <Button onClick={expandAll}>Expand All</Button>;
};

export const CollapseAllButton = () => {
    const { collapseAll } = useTreeContext();

    return <Button onClick={collapseAll}>Collapse All</Button>;
};

export const TreeNodeComponent = ({ tree }: { tree: TreeNode }) => (
    <AccordionItem value={tree.id.toString()} className="pl-1 w-full">
        <ContextMenuContainer id={tree.id.toString()}>
            <Droppable id={tree.id.toString()} className="w-full">
                <Draggable id={tree.id.toString()} className="w-full">
                    <div className="rounded-md p-2 border hover:border-input border-transparent text-left cursor-pointer">
                        {tree.children?.length ? (
                            <AccordionTrigger>{tree.name}</AccordionTrigger>
                        ) : (
                            <span className="pl-6 text-left text-sm font-medium">
                                {tree.name}
                            </span>
                        )}
                    </div>
                </Draggable>
            </Droppable>
        </ContextMenuContainer>
        {tree.children?.length ? (
            <AccordionContent className="w-full">
                {tree.children.map((child) => (
                    <TreeNodeComponent key={child.id} tree={child} />
                ))}
            </AccordionContent>
        ) : null}
    </AccordionItem>
);

export const TreeView = () => {
    const { trees } = useData();

    return (
        <>
            {!trees.length && (
                <AddRootItem
                    size="lg"
                    className="border-dashed border-gray-300"
                />
            )}
            {trees.map((item) => (
                <TreeNodeComponent key={item.id} tree={item} />
            ))}
            <Droppable id="" className="m-2 h-[42px]" />
        </>
    );
};
