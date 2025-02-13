import { Plus, Edit, Trash } from "lucide-react";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "./ui/context-menu";
import * as api from "@/lib/handlers";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useData } from "@/lib/context";
import { useTreeContext } from "./tree";

interface ContextMenuProps {
    id: string;
    children: React.ReactNode;
}

enum EditState {
    NONE,
    RENAMING,
    CREATING,
}

export const ContextMenuContainer = ({ id, children }: ContextMenuProps) => {
    const [editState, setEditState] = useState<EditState>(EditState.NONE);
    const [name, setName] = useState("");
    const { data } = useData();
    const { expandItem } = useTreeContext();

    const handleSubmit = async () => {
        if (name.trim() === "") return;
        if (editState === EditState.RENAMING)
            await api.renameItem(Number(id), name);
        else if (editState === EditState.CREATING) {
            await api.addItem(name, Number(id));
            expandItem(id);
        }
        setName("");
        setEditState(EditState.NONE);
    };

    useEffect(() => {
        if (editState === EditState.RENAMING)
            setName(data.find((node) => node.id === Number(id))?.name || "");
        else if (editState === EditState.CREATING) setName("");
    }, [editState, data, id]);

    const handleDelete = () => {
        api.removeItem(Number(id));
    };

    return (
        <Dialog open={editState !== EditState.NONE}>
            <ContextMenu>
                <ContextMenuTrigger>{children}</ContextMenuTrigger>
                <ContextMenuContent className="w-64">
                    <ContextMenuItem inset>
                        <DialogTrigger
                            className="flex items-center gap-2"
                            onClick={() => setEditState(EditState.CREATING)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Child Item
                        </DialogTrigger>
                    </ContextMenuItem>
                    <ContextMenuItem inset>
                        <DialogTrigger
                            className="flex items-center gap-2"
                            onClick={() => setEditState(EditState.RENAMING)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                        </DialogTrigger>
                    </ContextMenuItem>
                    <ContextMenuItem
                        inset
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <DialogContent>
                <DialogTitle>
                    {editState === EditState.CREATING
                        ? "Add Child Item"
                        : "Rename Item"}
                </DialogTitle>
                <Input
                    placeholder="Enter item name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                />
                <Button onClick={handleSubmit} disabled={name.trim() === ""}>
                    Submit
                </Button>
            </DialogContent>
        </Dialog>
    );
};
