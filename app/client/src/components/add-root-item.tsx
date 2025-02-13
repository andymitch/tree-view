import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import * as api from "@/lib/handlers";
import { Plus } from "lucide-react";

export const AddRootItem = ({
    className,
    size,
}: {
    className?: string;
    size?: "lg" | "default" | "sm" | "icon" | null;
}) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const handleSubmit = async () => {
        if (name.trim() === "") return;
        await api.addItem(name, null);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline" className={className} size={size}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add Item</DialogTitle>
                <Input
                    placeholder="Enter item name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") handleSubmit();
                    }}
                    onBlur={() => setName("")}
                />
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={name.trim() === ""}
                >
                    Add Item
                </Button>
            </DialogContent>
        </Dialog>
    );
};
